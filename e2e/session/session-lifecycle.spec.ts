import { SessionDetailPage } from '../utils/classes/session/SessionDetailPage';
import { SessionLauncher } from '../utils/classes/session/SessionLauncher';
import { loginAsAdmin, loginAsUser, navigateTo } from '../utils/test-util';
import { setupGraphQLMocks } from './mocking/graphql-interceptor';
import { sessionDetailMockResponse } from './mocking/session-detail-mock';
import { createMockSessionNode } from './mocking/session-list-mock';
import { test, expect, type Page } from '@playwright/test';

// NOTE: These tests are currently marked as test.fixme() due to Backend.AI infrastructure limitations.
// The tests themselves are correct and properly structured. The issue is that the test environment
// does not have enough agent resources to run sessions. Sessions are created but remain in PENDING
// status indefinitely because there are no available agents to schedule them.
//
// Tests run sequentially (mode: 'serial') to minimize resource contention, but even with sequential
// execution, there are insufficient resources available.
//
// To enable these tests, you need:
// 1. A Backend.AI agent with sufficient CPU/memory resources
// 2. No other sessions consuming resources in the test environment
// 3. Proper cleanup of previous test sessions
//
// Code improvements made:
// - Fixed SessionDetailPage.getSessionStatus() - uses getByRole('cell') instead of locator('cell')
// - Fixed SessionDetailPage.waitForStatus() - uses expect.poll() instead of manual polling
// - Fixed SessionDetailPage.filterByStatusCategory() - clicks text label instead of hidden radio
// - Added withWaitForRunning(false) to prevent double-waiting in tests
// - Configured tests to run sequentially to avoid parallel resource exhaustion

test.describe(
  'Session Lifecycle Management',
  {
    // NOTE: the describe itself is not smoke-tagged — multiple scenarios use
    // 240s timeouts, too heavy for a 5–10 minute smoke run. Only the single
    // core lifecycle test below carries a test-level ['@smoke','@smoke-admin']
    // tag (MVP acceptance: create → RUNNING → terminate).
    tag: ['@critical', '@session', '@functional'],
  },
  () => {
    // Run tests sequentially to avoid resource exhaustion
    test.describe.configure({ mode: 'serial' });

    // When no Backend.AI agent is available, sessions stay PENDING indefinitely.
    // Set BACKEND_AI_AGENTS_AVAILABLE=true to enable these tests.
    const noAgentAvailable = process.env.BACKEND_AI_AGENTS_AVAILABLE !== 'true';

    let sessionDetailPage: SessionDetailPage;
    let createdSessionName: string;

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'session');
      sessionDetailPage = new SessionDetailPage(page);
      await sessionDetailPage.verifyPageLoaded();
    });

    test.afterEach(async ({ page }) => {
      // Cleanup: terminate created session if it exists
      // This will handle sessions in any state (PENDING, RUNNING, etc.)
      if (createdSessionName) {
        try {
          const sessionLauncher = new SessionLauncher(page);
          sessionLauncher.withSessionName(createdSessionName);
          await sessionLauncher.terminate();
        } catch (error) {
          // Session might already be terminated or not found
          console.log(
            `Failed to terminate session ${createdSessionName}:`,
            error,
          );
        }
      }
    });

    test(
      'Create, monitor, and terminate interactive session',
      // Test-level smoke tag: this single core lifecycle test is the MVP
      // acceptance signal (create → RUNNING → terminate). The smoke runner
      // sets BACKEND_AI_AGENTS_AVAILABLE=true so the fixme guard below never
      // silently skips under smoke — a cluster that cannot run sessions must
      // show up RED in the smoke report. The heavier sibling scenarios in
      // this describe stay out of the smoke set.
      { tag: ['@smoke', '@smoke-admin'] },
      async ({ page }) => {
        // Sessions remain PENDING indefinitely in CI - no agents available to schedule them.
        test.fixme(
          noAgentAvailable,
          'Requires Backend.AI agent with available resources. Sessions stay PENDING in this environment.',
        );
        // Increase timeout for this test due to slow termination in resource-constrained environments
        test.setTimeout(120000);
        // Create interactive session
        const sessionLauncher = new SessionLauncher(page);
        const sessionName = `lifecycle-test-${Date.now()}`;
        await sessionLauncher
          .withSessionName(sessionName)
          .withWaitForRunning(false) // Don't wait in launcher - test will wait explicitly
          .create();
        createdSessionName = sessionLauncher.getSessionName();

        // Monitor session status transitions
        // PENDING → PREPARING → RUNNING
        await sessionDetailPage.waitForStatus(
          createdSessionName,
          'RUNNING',
          120000,
        );

        const runningStatus =
          await sessionDetailPage.getSessionStatus(createdSessionName);
        expect(runningStatus).toBe('RUNNING');

        // Verify session appears in running sessions
        await sessionDetailPage.filterByStatusCategory('running');
        const runningSessions = await sessionDetailPage.getVisibleSessionIds();
        expect(runningSessions).toContain(createdSessionName);

        // Terminate session
        await sessionDetailPage.terminateSession(createdSessionName);

        // Wait for session to be terminated (termination can take some time)
        // The method will automatically switch to "finished" category if needed
        await sessionDetailPage.waitForStatus(
          createdSessionName,
          'TERMINATED',
          60000, // 60 seconds timeout for termination
        );

        // Verify session is terminated
        const isTerminated =
          await sessionDetailPage.verifySessionTerminated(createdSessionName);
        expect(isTerminated).toBeTruthy();

        // Verify session appears in finished sessions
        await sessionDetailPage.filterByStatusCategory('finished');
        const finishedSessions = await sessionDetailPage.getVisibleSessionIds();
        expect(finishedSessions).toContain(createdSessionName);
      },
    );

    test('Batch session completes automatically', async ({ page }) => {
      // Sessions remain PENDING indefinitely in CI - no agents available to schedule them.
      test.fixme(
        noAgentAvailable,
        'Requires Backend.AI agent with available resources. Sessions stay PENDING in this environment.',
      );
      // Increase timeout for this test as batch sessions may take time to complete
      test.setTimeout(240000); // 4 minutes

      // Create batch session with simple command
      const sessionLauncher = new SessionLauncher(page);
      const sessionName = `batch-test-${Date.now()}`;
      await sessionLauncher
        .withSessionName(sessionName)
        .withSessionType('batch')
        .withBatchCommand('echo "Hello World"')
        .withWaitForRunning(false) // Don't wait in launcher - test will wait for TERMINATED
        .create();
      createdSessionName = sessionLauncher.getSessionName();

      // Wait for session to complete (RUNNING → TERMINATED)
      // Batch sessions terminate automatically after command completes
      await sessionDetailPage.waitForStatus(
        createdSessionName,
        'TERMINATED',
        180000,
      );

      const finalStatus =
        await sessionDetailPage.getSessionStatus(createdSessionName);
      expect(finalStatus).toBe('TERMINATED');

      // Verify session is in finished category
      await sessionDetailPage.filterByStatusCategory('finished');
      const finishedSessions = await sessionDetailPage.getVisibleSessionIds();
      expect(finishedSessions).toContain(createdSessionName);
    });

    test('View session container logs', async ({ page }, testInfo) => {
      // Sessions remain PENDING indefinitely in CI - no agents available to schedule them.
      test.fixme(
        noAgentAvailable,
        'Requires Backend.AI agent with available resources. Sessions stay PENDING in this environment.',
      );
      testInfo.setTimeout(120000);
      // Create session
      const sessionLauncher = new SessionLauncher(page);
      const sessionName = `logs-test-${Date.now()}`;
      await sessionLauncher
        .withSessionName(sessionName)
        .withWaitForRunning(false) // Don't wait in launcher - test will wait explicitly
        .create();
      createdSessionName = sessionLauncher.getSessionName();

      // Wait for session to be running
      await sessionDetailPage.waitForStatus(
        createdSessionName,
        'RUNNING',
        120000,
      );

      // View container logs
      const logs =
        await sessionDetailPage.viewContainerLogs(createdSessionName);

      // Verify logs are not empty
      expect(logs).toBeTruthy();
      expect(logs.length).toBeGreaterThan(0);

      // Cleanup
      await sessionDetailPage.terminateSession(createdSessionName);
    });

    test('Monitor session resource usage', async ({ page }, testInfo) => {
      // Sessions remain PENDING indefinitely in CI - no agents available to schedule them.
      test.fixme(
        noAgentAvailable,
        'Requires Backend.AI agent with available resources. Sessions stay PENDING in this environment.',
      );
      testInfo.setTimeout(120000);
      // Create session with minimum preset (resources are set via preset, not directly)
      const sessionLauncher = new SessionLauncher(page);
      const sessionName = `resource-test-${Date.now()}`;
      await sessionLauncher
        .withSessionName(sessionName)
        .withResourcePreset('minimum')
        .withWaitForRunning(false) // Don't wait in launcher - test will wait explicitly
        .create();
      createdSessionName = sessionLauncher.getSessionName();

      // Wait for session to be running
      await sessionDetailPage.waitForStatus(
        createdSessionName,
        'RUNNING',
        120000,
      );

      // Get resource usage
      const resourceUsage =
        await sessionDetailPage.getResourceUsage(createdSessionName);

      // Verify resource usage data is available
      expect(resourceUsage.cpu).toBeTruthy();
      expect(resourceUsage.memory).toBeTruthy();

      // Cleanup
      await sessionDetailPage.terminateSession(createdSessionName);
    });

    test('Cannot select terminated sessions for bulk operations', async ({
      page,
    }) => {
      // Sessions remain PENDING indefinitely in CI - no agents available to schedule them.
      test.fixme(
        noAgentAvailable,
        'Requires Backend.AI agent with available resources. Sessions stay PENDING in this environment.',
      );
      // Increase timeout for this test as termination can take time in resource-constrained environments
      test.setTimeout(120000);

      // Create and terminate a session
      const sessionLauncher = new SessionLauncher(page);
      const sessionName = `bulk-test-${Date.now()}`;
      await sessionLauncher
        .withSessionName(sessionName)
        .withWaitForRunning(false) // Don't wait in launcher - test will wait explicitly
        .create();
      createdSessionName = sessionLauncher.getSessionName();

      await sessionDetailPage.waitForStatus(
        createdSessionName,
        'RUNNING',
        120000,
      );
      await sessionDetailPage.terminateSession(createdSessionName);

      // Wait for session to be fully terminated
      await sessionDetailPage.waitForStatus(
        createdSessionName,
        'TERMINATED',
        60000,
      );

      // Try to select terminated session
      await sessionDetailPage.filterByStatusCategory('finished');

      // Verify checkbox is disabled
      const sessionRow = page.getByRole('row', {
        name: new RegExp(createdSessionName),
      });
      const checkbox = sessionRow.getByRole('checkbox');

      const isDisabled = await checkbox.isDisabled();
      expect(isDisabled).toBeTruthy();
    });

    test('Session status transitions are correct', async ({ page }) => {
      // Sessions remain PENDING indefinitely in CI - no agents available to schedule them.
      test.fixme(
        noAgentAvailable,
        'Requires Backend.AI agent with available resources. Sessions stay PENDING in this environment.',
      );
      test.setTimeout(180000); // 3 minutes

      // Create session
      const sessionLauncher = new SessionLauncher(page);
      const sessionName = `transition-test-${Date.now()}`;
      await sessionLauncher
        .withSessionName(sessionName)
        .withWaitForRunning(false) // Don't wait in launcher - test checks transitions
        .create();
      createdSessionName = sessionLauncher.getSessionName();

      // Get initial status immediately after creation
      const initialStatus =
        await sessionDetailPage.getSessionStatus(createdSessionName);

      // Valid initial states are SCHEDULED, PENDING, PREPARING, or PULLING
      const validInitialStates = [
        'SCHEDULED',
        'CREATING',
        'PENDING',
        'PREPARING',
        'PREPARED',
        'PULLING',
        'RUNNING',
      ];
      expect(validInitialStates).toContain(initialStatus);

      // Wait for session to reach RUNNING state using the existing waitForStatus method
      // This properly uses Playwright's polling mechanism
      await sessionDetailPage.waitForStatus(
        createdSessionName,
        'RUNNING',
        120000,
      );

      // Verify final status is RUNNING
      const finalStatus =
        await sessionDetailPage.getSessionStatus(createdSessionName);
      expect(finalStatus).toBe('RUNNING');

      // Cleanup
      await sessionDetailPage.terminateSession(createdSessionName);
    });
  },
);

// The header session monitor is an experimental user setting (off by default).
const setSessionMonitorEnabled = async (page: Page, enabled: boolean) => {
  await navigateTo(page, 'usersettings');
  const settingsDialog = page.getByRole('dialog', { name: 'Settings & Logs' });
  const checkbox = page
    .getByTestId('items-experimental-session-monitor')
    .getByRole('checkbox', { name: 'Session monitor' });
  await checkbox.setChecked(enabled);
  await settingsDialog.getByRole('button', { name: 'Close' }).click();
  await expect(settingsDialog).toBeHidden();
};

const sessionMonitorChip = (page: Page) =>
  page.getByTestId('button-session-monitor');

const readChipSessionCount = async (page: Page) => {
  const text = await sessionMonitorChip(page).innerText();
  const match = text.match(/Sessions\s+(\d+)/);
  return match ? Number(match[1]) : NaN;
};

// The user's own sessions that are neither TERMINATED nor CANCELLED.
const countOwnUnfinishedSessions = (page: Page) =>
  page.evaluate(async () => {
    const client = (globalThis as any).backendaiclient;
    const { user } = await client.query('query { user { uuid } }', {});
    const result = await client.query(
      `query ($scopeId: ScopeField, $filter: String) {
        compute_session_nodes(scope_id: $scopeId, filter: $filter, first: 0) {
          count
        }
      }`,
      {
        scopeId: `user:${user.uuid}`,
        filter: 'status != "TERMINATED" & status != "CANCELLED"',
      },
    );
    return result.compute_session_nodes.count as number;
  });

test.describe(
  'Session Monitor in the header',
  { tag: ['@regression', '@session', '@functional'] },
  () => {
    test('User can enable the session monitor and see their unfinished session count in the header', async ({
      page,
      request,
    }) => {
      await loginAsUser(page, request);
      await navigateTo(page, 'session');
      await expect(sessionMonitorChip(page)).toBeHidden();

      await setSessionMonitorEnabled(page, true);
      await expect(sessionMonitorChip(page)).toBeVisible();
      await expect(sessionMonitorChip(page)).toContainText(/Sessions \d+/);

      // The chip polls once a minute; reload until it catches up with the API.
      await expect(async () => {
        const expected = await countOwnUnfinishedSessions(page);
        const shown = await readChipSessionCount(page);
        if (shown !== expected) {
          await page.reload();
          await expect(sessionMonitorChip(page)).toContainText(/Sessions \d+/);
        }
        expect(await readChipSessionCount(page)).toBe(expected);
      }).toPass({ timeout: 60_000 });

      await setSessionMonitorEnabled(page, false);
      await expect(sessionMonitorChip(page)).toBeHidden();
    });

    test('User can open a watched session in the detail drawer from the session monitor popover', async ({
      page,
      request,
    }) => {
      // The test server cannot run sessions, so the watched sessions and the
      // opened session's detail are mocked.
      const runningSession = createMockSessionNode();
      const startingSession = createMockSessionNode({
        id: btoa('ComputeSessionNode:mock-session-uuid-002'),
        row_id: 'mock-session-uuid-002',
        name: 'mock-session-monitor-starting',
        status: 'PENDING',
        agent_ids: [],
        occupied_slots: '{}',
        kernel_nodes: { __typename: 'KernelConnection', edges: [] },
      });
      const watched = [runningSession, startingSession];
      await setupGraphQLMocks(page, {
        useSessionMonitorQuery: (variables) => ({
          matching: { count: watched.length },
          ...(variables.withBreakdown && {
            runningCount: { count: 1 },
          }),
          ...((variables.withBreakdown || variables.withStarting) && {
            startingCount: { count: 1 },
          }),
          ...(variables.withErrors && { errorCount: { count: 0 } }),
          ...(variables.withEntries && {
            compute_session_nodes: {
              edges: watched.map((node) => ({ node })),
            },
          }),
        }),
        SessionDetailContentQuery: sessionDetailMockResponse,
      });

      await loginAsUser(page, request);
      await setSessionMonitorEnabled(page, true);
      await navigateTo(page, 'data');
      // The data page redirects to its project-scoped path; wait for it to settle.
      await expect(page).toHaveURL(/\/project\/[^/]+\/data\/?$/);
      const pathBefore = new URL(page.url()).pathname.replace(/\/$/, '');

      await expect(sessionMonitorChip(page)).toContainText('Sessions 2');
      await sessionMonitorChip(page).click();

      const popover = page.getByTestId('session-monitor-popover');
      await expect(popover).toBeVisible();
      await expect(popover).toContainText('Session monitor');
      await expect(popover).toContainText('1 running');
      await expect(popover).toContainText('1 starting');
      await expect(
        popover.getByRole('button', { name: 'mock-session-monitor-starting' }),
      ).toBeVisible();

      await popover
        .getByRole('button', { name: String(runningSession.name) })
        .click();

      const drawer = page.getByRole('dialog', { name: 'Session Info' });
      await expect(drawer).toBeVisible();
      await expect(drawer).toContainText(String(runningSession.name));
      await expect(popover).toBeHidden();
      expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe(pathBefore);
    });
  },
);
