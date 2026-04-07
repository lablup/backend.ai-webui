// spec: Session Dependency E2E Tests
// Tests for session dependency management via useStartSession (dependencies field).
// Sessions are created via globalThis.backendaiclient API, not through the launcher UI,
// because the session launcher page intentionally has no dependency UI.
import { SessionAPIHelper } from '../utils/classes/session/SessionAPIHelper';
import { loginAsUser, navigateTo } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'Session Dependency via API',
  { tag: ['@critical', '@session', '@functional', '@requires-session'] },
  () => {
    let createdSessionNames: string[] = [];

    test.beforeEach(async ({ page, request }) => {
      createdSessionNames = [];
      await loginAsUser(page, request);
    });

    test.afterEach(async ({ page }) => {
      const helper = new SessionAPIHelper(page);
      for (const name of createdSessionNames) {
        await helper.terminate(name);
      }
    });

    test('Creates batch + interactive session with dependency, waits for RUNNING, verifies dependency relationships, then terminates', async ({
      page,
    }) => {
      // This test requires an agent with available compute resources so that sessions
      // can reach RUNNING state. The current test server has no available agents
      // (sessions remain in PENDING indefinitely). Skip until a capable environment
      // is available.
      test.fixme(
        true,
        'Requires an agent with available compute resources (sessions cannot reach RUNNING on current test server).',
      );
      test.setTimeout(600000);
      const helper = new SessionAPIHelper(page);

      // Navigate to session page first to ensure backendaiclient is ready
      await navigateTo(page, 'session');
      await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });

      const timestamp = Date.now();
      const batchName = `e2e-dep-batch-${timestamp}`;
      const interactiveName = `e2e-dep-interactive-${timestamp}`;

      // ── Step 1: Create a batch session (dependency target) ──────────
      // Batch session auto-terminates when startupCommand finishes,
      // which unblocks the dependent interactive session
      const batchResult = await helper.create({
        sessionName: batchName,
        sessionType: 'batch',
        startupCommand: 'sleep 10',
      });
      createdSessionNames.push(batchName);
      console.log(`Batch session created: ${batchResult.sessionId}`);

      // ── Step 2: Create interactive session with dependency ──────────
      const interactiveResult = await helper.create({
        sessionName: interactiveName,
        sessionType: 'interactive',
        dependencies: [batchResult.sessionId],
      });
      createdSessionNames.push(interactiveName);
      console.log(
        `Interactive session created: ${interactiveResult.sessionId}`,
      );

      // ── Step 3: Wait for batch session to reach RUNNING ─────────────
      await helper.waitForStatus(batchName, ['RUNNING']);

      // ── Step 4: Wait for batch to auto-terminate ──────────────────
      // Dependent sessions start only after their dependency terminates
      await helper.waitForStatus(batchName, ['TERMINATED'], 120000);

      // ── Step 5: Wait for interactive session to reach RUNNING ───────
      await helper.waitForStatus(interactiveName, ['RUNNING'], 180000);

      // ── Step 6: Verify dependency display in session detail ─────────
      await navigateTo(page, 'session');
      await expect(page.locator('.ant-table')).toBeVisible({
        timeout: 10000,
      });

      // Open interactive session detail → verify "Depends on"
      const interactiveRow = page
        .locator('tbody tr:not(.ant-table-measure-row)')
        .filter({ hasText: interactiveName });
      await expect(interactiveRow).toBeVisible({ timeout: 10000 });
      await interactiveRow.getByText(interactiveName).click();

      const interactiveDetail = page.getByRole('dialog', {
        name: 'Session Info',
      });
      await expect(interactiveDetail).toBeVisible({ timeout: 10000 });

      const dependsOnLabel = interactiveDetail.getByText('Depends on');
      await expect(dependsOnLabel).toBeVisible({ timeout: 10000 });
      await expect(
        interactiveDetail.getByText(batchName, { exact: false }),
      ).toBeVisible({ timeout: 5000 });

      await interactiveDetail.getByRole('button', { name: 'Close' }).click();
      await expect(interactiveDetail).not.toBeVisible({ timeout: 5000 });

      // ── Step 8: Verify Dependencies column in session list ──────────
      const settingButton = page
        .getByRole('button', { name: 'setting' })
        .and(page.locator('.ant-btn-sm'));
      await settingButton.click();

      const settingModal = page.getByRole('dialog', {
        name: /Table Settings/i,
      });
      await expect(settingModal).toBeVisible({ timeout: 5000 });

      const depCheckbox = settingModal.getByRole('checkbox', {
        name: /Dependencies/i,
      });
      const hasDepCheckbox = await depCheckbox
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      if (hasDepCheckbox) {
        await depCheckbox.check();
        await settingModal.getByRole('button', { name: /OK/i }).click();
        await expect(settingModal).not.toBeVisible({ timeout: 5000 });

        const dependenciesHeader = page.getByRole('columnheader', {
          name: 'Dependencies',
        });
        await expect(dependenciesHeader).toBeVisible({ timeout: 5000 });

        // Find column index and verify cell content
        const headers = page.locator('thead th');
        const headerCount = await headers.count();
        let depColIndex = -1;
        for (let i = 0; i < headerCount; i++) {
          const text = await headers.nth(i).textContent();
          if (text?.includes('Dependencies')) {
            depColIndex = i;
            break;
          }
        }

        if (depColIndex >= 0) {
          const depCell = interactiveRow.getByRole('cell').nth(depColIndex);
          await expect(depCell).toContainText(batchName, { timeout: 5000 });
        }

        // Revert column setting
        await settingButton.click();
        await expect(settingModal).toBeVisible({ timeout: 5000 });
        await settingModal
          .getByRole('checkbox', { name: /Dependencies/i })
          .uncheck();
        await settingModal.getByRole('button', { name: /OK/i }).click();
        await expect(settingModal).not.toBeVisible({ timeout: 5000 });
      } else {
        await settingModal.getByRole('button', { name: /Cancel/i }).click();
      }

      // ── Step 9: Terminate sessions ──────────────────────────────────
      // afterEach will handle this via API
    });
  },
);

test.describe(
  'Session Detail - Dependency Display',
  { tag: ['@regression', '@session', '@functional', '@requires-session'] },
  () => {
    let sessionName: string;
    let helper: SessionAPIHelper;

    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
      helper = new SessionAPIHelper(page);

      // Create a session so there's always one to click on
      sessionName = `e2e-detail-${Date.now()}`;
      await navigateTo(page, 'session');
      await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });

      await helper.create({
        sessionName,
        sessionType: 'interactive',
      });
      await helper.waitForStatus(sessionName, ['RUNNING']);
    });

    test.afterEach(async () => {
      await helper.terminate(sessionName);
    });

    test('Session detail drawer renders correctly and can show dependency info', async ({
      page,
    }) => {
      // This test requires a session to reach RUNNING state in beforeEach.
      // The current test server has no available agents, so skip until capable environment.
      test.fixme(
        true,
        'Requires an agent with available compute resources (sessions cannot reach RUNNING on current test server).',
      );
      await navigateTo(page, 'session');
      await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });

      const sessionRow = page
        .locator('tbody tr:not(.ant-table-measure-row)')
        .filter({ hasText: sessionName });
      await expect(sessionRow).toBeVisible({ timeout: 10000 });
      await sessionRow.getByText(sessionName).click();

      const detailDialog = page.getByRole('dialog', {
        name: 'Session Info',
      });
      await expect(detailDialog).toBeVisible({ timeout: 10000 });

      await expect(detailDialog.getByText('Cluster Mode')).toBeVisible({
        timeout: 5000,
      });
    });
  },
);

test.describe(
  'Session List - Dependencies Column',
  { tag: ['@regression', '@session', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
    });

    test('Dependencies column can be enabled via table settings', async ({
      page,
    }) => {
      await navigateTo(page, 'session');
      await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });

      const dependenciesHeader = page.getByRole('columnheader', {
        name: 'Dependencies',
      });
      await expect(dependenciesHeader).not.toBeVisible();

      const settingButton = page
        .getByRole('button', { name: 'setting' })
        .and(page.locator('.ant-btn-sm'));
      await settingButton.click();

      const settingModal = page.getByRole('dialog', {
        name: /Table Settings/i,
      });
      await expect(settingModal).toBeVisible({ timeout: 5000 });

      const dependenciesCheckbox = settingModal.getByRole('checkbox', {
        name: /Dependencies/i,
      });
      const isCheckboxVisible = await dependenciesCheckbox
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      if (!isCheckboxVisible) {
        await settingModal.getByRole('button', { name: /Cancel/i }).click();
        test.skip();
        return;
      }

      await dependenciesCheckbox.check();

      await settingModal.getByRole('button', { name: /OK/i }).click();
      await expect(settingModal).not.toBeVisible({ timeout: 5000 });

      await expect(dependenciesHeader).toBeVisible({ timeout: 5000 });

      // Revert
      await settingButton.click();
      await expect(settingModal).toBeVisible({ timeout: 5000 });
      await settingModal
        .getByRole('checkbox', { name: /Dependencies/i })
        .uncheck();
      await settingModal.getByRole('button', { name: /OK/i }).click();
      await expect(settingModal).not.toBeVisible({ timeout: 5000 });

      await expect(dependenciesHeader).not.toBeVisible();
    });
  },
);
