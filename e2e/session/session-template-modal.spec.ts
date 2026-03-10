// E2E spec: Session Template Modal – Multi-Node Indicator & Real Session History
import { SessionLauncher } from '../utils/classes/session/SessionLauncher';
import { loginAsAdmin, loginAsUser, navigateTo } from '../utils/test-util';
import { Page } from '@playwright/test';
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
      cluster_size: 4,
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
  await page.reload({ waitUntil: 'domcontentloaded' });
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
// Tests: Multi-Node Indicator (using seeded localStorage)
// ---------------------------------------------------------------------------

test.describe(
  'Session Template Modal – Multi-Node Indicator',
  { tag: ['@session', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial' });
    test.setTimeout(60_000);

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'session/start');
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

    test('User can open the Session Template Modal from the Recent History button', async ({
      page,
    }) => {
      const modal = await openTemplateModal(page);
      await expect(modal).toBeVisible();
    });

    test('Multi-node sessions show a Multi Node badge next to the session name', async ({
      page,
    }) => {
      const modal = await openTemplateModal(page);

      const multiNodeRow = modal
        .getByRole('row')
        .filter({ hasText: 'multi-node-session' });
      await expect(multiNodeRow).toBeVisible({ timeout: 10_000 });

      const multiNodeBadge = multiNodeRow.getByText(/Multi Node/);
      await expect(multiNodeBadge).toBeVisible();
    });

    test('Multi Node badge displays the cluster size (node count)', async ({
      page,
    }) => {
      const modal = await openTemplateModal(page);

      const multiNodeRow = modal
        .getByRole('row')
        .filter({ hasText: 'multi-node-session' });
      await expect(multiNodeRow).toBeVisible({ timeout: 10_000 });

      // Badge text is "Multi Node ×4"
      const multiNodeBadge = multiNodeRow.getByText(/Multi Node.*×.*4/);
      await expect(multiNodeBadge).toBeVisible();
    });

    test('Single-node sessions do not show a Multi Node badge', async ({
      page,
    }) => {
      const modal = await openTemplateModal(page);

      const singleNodeRow = modal
        .getByRole('row')
        .filter({ hasText: 'single-node-session' });
      await expect(singleNodeRow).toBeVisible({ timeout: 10_000 });

      await expect(singleNodeRow.getByText(/Multi Node/)).toHaveCount(0);
    });

    test('Clicking a session name in the modal closes the modal and applies the template', async ({
      page,
    }) => {
      const modal = await openTemplateModal(page);

      const multiNodeRow = modal
        .getByRole('row')
        .filter({ hasText: 'multi-node-session' });
      await expect(multiNodeRow).toBeVisible({ timeout: 10_000 });

      await multiNodeRow.getByText('multi-node-session').click();

      await expect(modal).not.toBeVisible({ timeout: 5_000 });
    });

    test('User can close the Session Template Modal using the X button', async ({
      page,
    }) => {
      const modal = await openTemplateModal(page);
      await expect(modal).toBeVisible();

      await modal.getByRole('button', { name: 'Close' }).first().click();

      await expect(modal).not.toBeVisible({ timeout: 5_000 });
    });
  },
);

// ---------------------------------------------------------------------------
// Helpers: Real session creation (follows proven pattern from session-creation.spec.ts)
// ---------------------------------------------------------------------------

const createInteractiveSession = async (page: Page, sessionName: string) => {
  const interactiveRadioButton = page
    .locator('label')
    .filter({ hasText: 'Interactive' })
    .locator('input[type="radio"]');
  await interactiveRadioButton.check();
  const sessionNameInput = page.locator('#sessionName');
  await sessionNameInput.fill(sessionName);
  await page.getByRole('button', { name: 'Next' }).click();

  // Wait for resource group combobox to be visible (indicates page is ready)
  const resourceGroup = page.getByRole('combobox', {
    name: 'Resource Group',
  });
  await expect(resourceGroup).toBeVisible({ timeout: 10_000 });
  await resourceGroup.fill('default');
  await page.keyboard.press('Enter');
  // Select Minimum Requirements
  const resourcePreset = page.getByRole('combobox', {
    name: 'Resource Presets',
  });
  await expect(resourcePreset).toBeVisible();
  await resourcePreset.fill('minimum');
  await page.getByRole('option', { name: 'minimum' }).click();
  // Launch
  await page.getByRole('button', { name: 'Skip to review' }).click();

  // Wait for Launch button to be enabled
  const launchButton = page.locator('button').filter({ hasText: 'Launch' });
  await expect(launchButton).toBeEnabled({ timeout: 10_000 });
  await launchButton.click();

  await page
    .getByRole('dialog')
    .filter({ hasText: 'No storage folder is mounted' })
    .getByRole('button', { name: 'Start' })
    .click();
};

// ---------------------------------------------------------------------------
// Tests: Real session creation → session history → re-create from template
// ---------------------------------------------------------------------------

test.describe(
  'Session Template Modal – Real Session History',
  { tag: ['@session', '@functional'] },
  () => {
    test.setTimeout(180_000);

    let createdSessionName: string | null = null;

    test.afterEach(async ({ page }) => {
      // Cleanup: terminate created session if it exists
      if (createdSessionName) {
        try {
          const sessionLauncher = new SessionLauncher(page);
          sessionLauncher.withSessionName(createdSessionName);
          await sessionLauncher.terminate();
        } catch (error) {
          console.log(
            `Failed to terminate session ${createdSessionName}:`,
            error,
          );
        }
      }
    });

    test('Created session appears in Recent History and can be re-launched from template', async ({
      page,
      request,
    }) => {
      await loginAsUser(page, request);

      // Step 1: Navigate to session launcher and create a real session
      const sessionName = `e2e-template-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      createdSessionName = sessionName;

      await navigateTo(page, 'session/start');
      // Wait for the session launcher page to be ready
      await expect(
        page.locator('label').filter({ hasText: 'Interactive' }),
      ).toBeVisible({ timeout: 15_000 });

      await createInteractiveSession(page, sessionName);

      // Wait for the app to navigate to /session after session creation.
      // This confirms that pushSessionHistory has been called (it runs before
      // webuiNavigate('/job') which then redirects to /session).
      // Without this wait, navigateTo(page, 'session/start') could fire before
      // the async startSession API resolves, leaving localStorage empty.
      await page.waitForURL(/\/session(?!\/start)/, { timeout: 30_000 });

      // Verify session appears in session list
      const sessionRow = page.locator('tr').filter({ hasText: sessionName });
      await expect(sessionRow).toBeVisible({ timeout: 30_000 });

      // Step 2: Navigate back to session/start and open Recent History modal
      await navigateTo(page, 'session/start');
      await expect(
        page.getByRole('button', { name: 'Recent History' }),
      ).toBeVisible({ timeout: 15_000 });

      const modal = await openTemplateModal(page);

      // Step 3: Verify the created session appears in the modal
      const historyRow = modal
        .getByRole('row')
        .filter({ hasText: sessionName });
      await expect(historyRow).toBeVisible({ timeout: 10_000 });

      // Step 4: Click the session name to apply the template
      await historyRow.getByText(sessionName).click();

      // Modal should close after selecting a history entry
      await expect(modal).not.toBeVisible({ timeout: 5_000 });

      // Step 5: Verify the template was applied to the form.
      // After clicking a history entry, the form navigates to the review step
      // (last step) and populates the form fields. The #sessionName input is
      // on step 1 which is not the current active step, so it may be hidden.
      // We verify the template was applied by checking the "Confirm and Launch"
      // step is now active and the URL contains formValues with a sessionName.
      await expect(
        page.getByRole('button', { name: /Confirm and Launch/i }),
      ).toBeVisible({ timeout: 5_000 });
      // The URL should contain formValues with a sessionName set from the template
      await expect(page).toHaveURL(/formValues.*sessionName/, {
        timeout: 5_000,
      });
    });
  },
);
