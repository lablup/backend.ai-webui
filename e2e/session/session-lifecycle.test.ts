import { SessionDetailPage } from '../../utils/classes/session/SessionDetailPage';
import { SessionLauncher } from '../../utils/classes/session/SessionLauncher';
import { loginAsAdmin, navigateTo } from '../../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'Session Lifecycle Management',
  { tag: ['@critical', '@session'] },
  () => {
    let sessionDetailPage: SessionDetailPage;
    let createdSessionId: string;

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'session');
      sessionDetailPage = new SessionDetailPage(page);
      await sessionDetailPage.verifyPageLoaded();
    });

    test.afterEach(async () => {
      // Cleanup: terminate created session if it exists
      if (createdSessionId) {
        try {
          const status =
            await sessionDetailPage.getSessionStatus(createdSessionId);
          if (status === 'RUNNING') {
            await sessionDetailPage.terminateSession(createdSessionId);
          }
        } catch {
          // Session might already be terminated
        }
      }
    });

    test('Create, monitor, and terminate interactive session', async ({
      page,
    }) => {
      // Create interactive session
      const sessionLauncher = new SessionLauncher(page);
      createdSessionId = await sessionLauncher
        .withSessionName(`lifecycle-test-${Date.now()}`)
        .create();

      // Monitor session status transitions
      // PENDING → PREPARING → RUNNING
      await sessionDetailPage.waitForStatus(
        createdSessionId,
        'RUNNING',
        120000,
      );

      const runningStatus =
        await sessionDetailPage.getSessionStatus(createdSessionId);
      expect(runningStatus).toBe('RUNNING');

      // Verify session appears in running sessions
      await sessionDetailPage.filterByStatusCategory('running');
      const runningSessions = await sessionDetailPage.getVisibleSessionIds();
      expect(runningSessions).toContain(createdSessionId);

      // Terminate session
      await sessionDetailPage.terminateSession(createdSessionId);

      // Verify session is terminated
      const isTerminated =
        await sessionDetailPage.verifySessionTerminated(createdSessionId);
      expect(isTerminated).toBeTruthy();

      // Verify session appears in finished sessions
      await sessionDetailPage.filterByStatusCategory('finished');
      const finishedSessions = await sessionDetailPage.getVisibleSessionIds();
      expect(finishedSessions).toContain(createdSessionId);
    });

    test('Batch session completes automatically', async ({ page }) => {
      // Create batch session with simple command
      const sessionLauncher = new SessionLauncher(page);
      createdSessionId = await sessionLauncher
        .withSessionName(`batch-test-${Date.now()}`)
        .withBatchCommand('echo "Hello World"')
        .create();

      // Wait for session to complete (RUNNING → TERMINATED)
      // Batch sessions terminate automatically after command completes
      await sessionDetailPage.waitForStatus(
        createdSessionId,
        'TERMINATED',
        180000,
      );

      const finalStatus =
        await sessionDetailPage.getSessionStatus(createdSessionId);
      expect(finalStatus).toBe('TERMINATED');

      // Verify session is in finished category
      await sessionDetailPage.filterByStatusCategory('finished');
      const finishedSessions = await sessionDetailPage.getVisibleSessionIds();
      expect(finishedSessions).toContain(createdSessionId);
    });

    test('View session container logs', async ({ page }) => {
      // Create session
      const sessionLauncher = new SessionLauncher(page);
      createdSessionId = await sessionLauncher
        .withSessionName(`logs-test-${Date.now()}`)
        .create();

      // Wait for session to be running
      await sessionDetailPage.waitForStatus(
        createdSessionId,
        'RUNNING',
        120000,
      );

      // View container logs
      const logs = await sessionDetailPage.viewContainerLogs(createdSessionId);

      // Verify logs are not empty
      expect(logs).toBeTruthy();
      expect(logs.length).toBeGreaterThan(0);

      // Cleanup
      await sessionDetailPage.terminateSession(createdSessionId);
    });

    test('Monitor session resource usage', async ({ page }) => {
      // Create session with specific resources
      const sessionLauncher = new SessionLauncher(page);
      createdSessionId = await sessionLauncher
        .withSessionName(`resource-test-${Date.now()}`)
        .withResources({ cpu: 1, memory: '1g' })
        .create();

      // Wait for session to be running
      await sessionDetailPage.waitForStatus(
        createdSessionId,
        'RUNNING',
        120000,
      );

      // Get resource usage
      const resourceUsage =
        await sessionDetailPage.getResourceUsage(createdSessionId);

      // Verify resource usage data is available
      expect(resourceUsage.cpu).toBeTruthy();
      expect(resourceUsage.memory).toBeTruthy();

      // Cleanup
      await sessionDetailPage.terminateSession(createdSessionId);
    });

    test('Cannot select terminated sessions for bulk operations', async ({
      page,
    }) => {
      // Create and terminate a session
      const sessionLauncher = new SessionLauncher(page);
      createdSessionId = await sessionLauncher
        .withSessionName(`bulk-test-${Date.now()}`)
        .create();

      await sessionDetailPage.waitForStatus(
        createdSessionId,
        'RUNNING',
        120000,
      );
      await sessionDetailPage.terminateSession(createdSessionId);

      // Try to select terminated session
      await sessionDetailPage.filterByStatusCategory('finished');

      // Verify checkbox is disabled
      const sessionRow = page.locator(
        `vaadin-grid-cell-content:has-text("${createdSessionId}")`,
      );
      const checkbox = sessionRow.locator('input[type="checkbox"]');

      const isDisabled = await checkbox.isDisabled();
      expect(isDisabled).toBeTruthy();
    });

    test('Session status transitions are correct', async ({ page }) => {
      // Create session
      const sessionLauncher = new SessionLauncher(page);
      createdSessionId = await sessionLauncher
        .withSessionName(`transition-test-${Date.now()}`)
        .create();

      // Track status transitions
      const transitions: string[] = [];

      // Poll status every 2 seconds
      const pollInterval = 2000;
      const maxPolls = 60; // 2 minutes max
      let polls = 0;

      while (polls < maxPolls) {
        const status =
          await sessionDetailPage.getSessionStatus(createdSessionId);
        transitions.push(status);

        if (status === 'RUNNING') {
          break;
        }

        if (status === 'ERROR' || status === 'CANCELLED') {
          throw new Error(`Session entered ${status} state`);
        }

        await page.waitForTimeout(pollInterval);
        polls++;
      }

      // Verify transition sequence
      // Should go through: PENDING/PREPARING → RUNNING
      expect(transitions).toContain('RUNNING');

      // Verify no invalid transitions
      const invalidStates = ['TERMINATED', 'CANCELLED'];
      const hasInvalidState = transitions.some((s) =>
        invalidStates.includes(s),
      );
      expect(hasInvalidState).toBeFalsy();

      // Cleanup
      await sessionDetailPage.terminateSession(createdSessionId);
    });
  },
);
