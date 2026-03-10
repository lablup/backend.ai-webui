// E2E spec: Session Template Modal – Multi-Node Indicator
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Encode a form-values object into the URLSearchParams string format used by
 * the session history `params` field.
 */
function buildParams(formValues: Record<string, unknown>): string {
  const p = new URLSearchParams();
  p.set('formValues', JSON.stringify(formValues));
  return p.toString();
}

/**
 * Seed localStorage with session history that contains both a multi-node
 * session and a single-node session, then reload so the app picks them up.
 */
async function seedSessionHistory(page: import('@playwright/test').Page) {
  const STORAGE_KEY = 'backendaiwebui.settings.user.recentSessionHistory';

  const multiNodeEntry = {
    id: 'e2e-multi-node-id',
    name: 'multi-node-session',
    params: buildParams({
      cluster_mode: 'multi-node',
      cluster_size: 2,
      sessionName: 'multi-node-session',
    }),
    createdAt: new Date(Date.now() - 1000).toISOString(),
  };

  const singleNodeEntry = {
    id: 'e2e-single-node-id',
    name: 'single-node-session',
    params: buildParams({
      cluster_mode: 'single-node',
      cluster_size: 1,
      sessionName: 'single-node-session',
    }),
    createdAt: new Date(Date.now() - 2000).toISOString(),
  };

  await page.evaluate(
    ({ key, value }: { key: string; value: string }) => {
      localStorage.setItem(key, value);
    },
    {
      key: STORAGE_KEY,
      value: JSON.stringify([multiNodeEntry, singleNodeEntry]),
    },
  );

  // Reload so Jotai atoms are initialised from the updated localStorage
  await page.reload({ waitUntil: 'networkidle' });
}

/**
 * Opens the Session Template Modal by clicking the "Recent History" button on
 * the Session Launcher page and waits for the modal to become visible.
 * Returns the modal locator.
 */
async function openTemplateModal(page: import('@playwright/test').Page) {
  const recentHistoryButton = page.getByRole('button', {
    name: 'Recent History',
  });
  await expect(recentHistoryButton).toBeVisible({ timeout: 10_000 });
  await recentHistoryButton.click();

  const modal = page.getByRole('dialog', { name: 'Recent History' });
  await expect(modal).toBeVisible({ timeout: 10_000 });
  return modal;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe(
  'Session Template Modal – Multi-Node Indicator',
  { tag: ['@session', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'session/start');
      // Wait for the Session Launcher page to be ready
      await expect(
        page.getByRole('button', { name: 'Recent History' }),
      ).toBeVisible({ timeout: 15_000 });
      // Seed session history via localStorage then reload
      await seedSessionHistory(page);
      // After reload, navigate back to session/start
      await navigateTo(page, 'session/start');
      await expect(
        page.getByRole('button', { name: 'Recent History' }),
      ).toBeVisible({ timeout: 15_000 });
    });

    // ───────────────────────────────────────────────────────────────────────
    // 1. Modal opens and shows session name column
    // ───────────────────────────────────────────────────────────────────────

    test('User can open the Session Template Modal from the Recent History button', async ({
      page,
    }) => {
      const modal = await openTemplateModal(page);
      await expect(modal).toBeVisible();
    });

    // ───────────────────────────────────────────────────────────────────────
    // 2. Multi-node badge is shown for multi-node sessions
    // ───────────────────────────────────────────────────────────────────────

    test('Multi-node sessions show a Multi Node badge next to the session name', async ({
      page,
    }) => {
      const modal = await openTemplateModal(page);

      // The multi-node row should contain the session name link
      const multiNodeRow = modal
        .getByRole('row')
        .filter({ hasText: 'multi-node-session' });
      await expect(multiNodeRow).toBeVisible({ timeout: 10_000 });

      // The BAITag badge with "Multi Node" text should be visible in that row
      const multiNodeBadge = multiNodeRow.locator('.ant-tag').filter({
        hasText: /Multi Node/,
      });
      await expect(multiNodeBadge).toBeVisible();
    });

    // ───────────────────────────────────────────────────────────────────────
    // 3. Multi-node badge shows the node count
    // ───────────────────────────────────────────────────────────────────────

    test('Multi Node badge displays the cluster size (node count)', async ({
      page,
    }) => {
      const modal = await openTemplateModal(page);

      const multiNodeRow = modal
        .getByRole('row')
        .filter({ hasText: 'multi-node-session' });
      await expect(multiNodeRow).toBeVisible({ timeout: 10_000 });

      // Badge text is "Multi Node × 2"
      const multiNodeBadge = multiNodeRow.locator('.ant-tag').filter({
        hasText: /Multi Node.*×.*2/,
      });
      await expect(multiNodeBadge).toBeVisible();
    });

    // ───────────────────────────────────────────────────────────────────────
    // 4. Single-node sessions do NOT show the badge
    // ───────────────────────────────────────────────────────────────────────

    test('Single-node sessions do not show a Multi Node badge', async ({
      page,
    }) => {
      const modal = await openTemplateModal(page);

      const singleNodeRow = modal
        .getByRole('row')
        .filter({ hasText: 'single-node-session' });
      await expect(singleNodeRow).toBeVisible({ timeout: 10_000 });

      // There should be no .ant-tag badge in the single-node row
      await expect(
        singleNodeRow.locator('.ant-tag').filter({ hasText: /Multi Node/ }),
      ).not.toBeVisible();
    });

    // ───────────────────────────────────────────────────────────────────────
    // 5. Tooltip on the badge shows the full description
    // ───────────────────────────────────────────────────────────────────────

    test('Hovering over the Multi Node badge shows a tooltip with the node count', async ({
      page,
    }) => {
      const modal = await openTemplateModal(page);

      const multiNodeRow = modal
        .getByRole('row')
        .filter({ hasText: 'multi-node-session' });
      await expect(multiNodeRow).toBeVisible({ timeout: 10_000 });

      const badge = multiNodeRow.locator('.ant-tag').filter({
        hasText: /Multi Node/,
      });
      await expect(badge).toBeVisible();

      // Hover to trigger the tooltip
      await badge.hover();

      // The tooltip text comes from t('session.MultiNode', { count: 2 })
      // which is "Multi-node session (2 nodes)"
      const tooltip = page.locator('.ant-tooltip').filter({
        hasText: /2/,
      });
      await expect(tooltip).toBeVisible({ timeout: 5_000 });
    });

    // ───────────────────────────────────────────────────────────────────────
    // 6. Clicking the session name link closes the modal
    // ───────────────────────────────────────────────────────────────────────

    test('Clicking a session name in the modal closes the modal and navigates back to the launcher', async ({
      page,
    }) => {
      const modal = await openTemplateModal(page);

      const multiNodeRow = modal
        .getByRole('row')
        .filter({ hasText: 'multi-node-session' });
      await expect(multiNodeRow).toBeVisible({ timeout: 10_000 });

      // Click the session name link (BAILink inside the row)
      await multiNodeRow.getByRole('link').first().click();

      // The modal should close after selecting a history entry
      await expect(modal).not.toBeVisible({ timeout: 5_000 });
    });

    // ───────────────────────────────────────────────────────────────────────
    // 7. Modal can be closed with the X button
    // ───────────────────────────────────────────────────────────────────────

    test('User can close the Session Template Modal using the X button', async ({
      page,
    }) => {
      const modal = await openTemplateModal(page);
      await expect(modal).toBeVisible();

      // Close with the header X button (first "Close" button in the modal)
      await modal.getByRole('button', { name: 'Close' }).first().click();

      await expect(modal).not.toBeVisible({ timeout: 5_000 });
    });
  },
);
