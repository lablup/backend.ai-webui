// spec: e2e/AppLauncher-Test-Plan.md
// Section 9: App Launcher - Debug Mode Features
import { loginAsUser } from './utils/test-util';
import { test, expect, Page } from '@playwright/test';

/**
 * Opens the app launcher modal for an existing session
 */
const openAppLauncherForExistingSession = async (
  page: Page,
  sessionName: string,
): Promise<void> => {
  // Navigate to Sessions page
  await page.getByRole('link', { name: 'Sessions' }).click();
  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });

  // Find the session row
  const sessionRow = page.locator('tr').filter({ hasText: sessionName });
  await expect(sessionRow).toBeVisible({ timeout: 10000 });

  // Wait for session to reach RUNNING status
  const runningStatus = sessionRow.getByText('RUNNING');
  await expect(runningStatus).toBeVisible({ timeout: 180000 });

  // Click on the session name link to open detail drawer
  const sessionNameLink = sessionRow.getByText(sessionName);
  await sessionNameLink.click();

  // Wait for session detail drawer to open
  const sessionDetailDrawer = page
    .locator('.ant-drawer')
    .filter({ hasText: 'Session Info' });
  await expect(sessionDetailDrawer).toBeVisible({ timeout: 10000 });

  // Click the app launcher button
  const appLauncherButton = sessionDetailDrawer
    .getByRole('button')
    .filter({ has: page.getByLabel('app') })
    .first();
  await expect(appLauncherButton).toBeVisible({ timeout: 5000 });
  await appLauncherButton.click();

  // Wait for app launcher modal to open
  const appLauncherModal = page.getByRole('dialog').filter({ hasText: 'App:' });
  await expect(appLauncherModal).toBeVisible({ timeout: 10000 });
};

/**
 * Closes the app launcher modal
 */
const closeAppLauncherModal = async (page: Page): Promise<void> => {
  const appLauncherModal = page.getByRole('dialog').filter({ hasText: 'App:' });
  const closeButton = appLauncherModal.getByRole('button', { name: 'Close' });
  await closeButton.click();
  await expect(appLauncherModal).not.toBeVisible({ timeout: 5000 });
};

test.describe('AppLauncher - Debug Mode Features', () => {
  const existingSessionName = 'e2e-edge-case-terminated';

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('User can see debug options when debug mode is enabled', async ({
    page,
  }) => {
    // 1. Enable debug mode
    await page.evaluate(() => {
      globalThis.backendaiwebui.debug = true;
    });

    // 2. Open app launcher modal
    await openAppLauncherForExistingSession(page, existingSessionName);

    const appLauncherModal = page
      .getByRole('dialog')
      .filter({ hasText: 'App:' });

    // 3. Verify debug options are visible
    const forceV1Checkbox = appLauncherModal
      .locator('label')
      .filter({ hasText: 'Force use of V1' })
      .locator('input[type="checkbox"]')
      .first();
    await expect(forceV1Checkbox).toBeVisible();

    const forceV2Checkbox = appLauncherModal
      .locator('label')
      .filter({ hasText: 'Force use of V1' })
      .locator('input[type="checkbox"]')
      .nth(1);
    await expect(forceV2Checkbox).toBeVisible();

    const useSubdomainCheckbox = appLauncherModal
      .locator('label')
      .filter({ hasText: 'UseSubdomain' })
      .locator('input[type="checkbox"]');
    await expect(useSubdomainCheckbox).toBeVisible();

    // 4. Verify subdomain input field is initially disabled
    const subdomainInput = appLauncherModal
      .locator('input[type="text"]')
      .filter({ hasText: '' });

    await expect(subdomainInput).toBeDisabled();

    // Clean up
    await closeAppLauncherModal(page);
  });

  test('User can force V1 proxy usage in debug mode', async ({ page }) => {
    // 1. Enable debug mode
    await page.evaluate(() => {
      globalThis.backendaiwebui.debug = true;
    });

    // 2. Open app launcher modal
    await openAppLauncherForExistingSession(page, existingSessionName);

    const appLauncherModal = page
      .getByRole('dialog')
      .filter({ hasText: 'App:' });

    // 3. Check "Force Use V1 Proxy" checkbox
    const forceV1Checkbox = appLauncherModal
      .locator('label')
      .filter({ hasText: 'Force use of V1' })
      .locator('input[type="checkbox"]')
      .first();
    await forceV1Checkbox.check();
    await expect(forceV1Checkbox).toBeChecked();

    // 4. Verify "Force Use V2 Proxy" checkbox is disabled
    const forceV2Checkbox = appLauncherModal
      .locator('label')
      .filter({ hasText: 'Force use of V1' })
      .locator('input[type="checkbox"]')
      .nth(1);
    await expect(forceV2Checkbox).toBeDisabled();

    // Clean up
    await closeAppLauncherModal(page);
  });

  test('User can force V2 proxy usage in debug mode', async ({ page }) => {
    // 1. Enable debug mode
    await page.evaluate(() => {
      globalThis.backendaiwebui.debug = true;
    });

    // 2. Open app launcher modal
    await openAppLauncherForExistingSession(page, existingSessionName);

    const appLauncherModal = page
      .getByRole('dialog')
      .filter({ hasText: 'App:' });

    // 3. Check "Force Use V2 Proxy" checkbox
    const forceV2Checkbox = appLauncherModal
      .locator('label')
      .filter({ hasText: 'Force use of V1' })
      .locator('input[type="checkbox"]')
      .nth(1);
    await forceV2Checkbox.check();
    await expect(forceV2Checkbox).toBeChecked();

    // 4. Verify "Force Use V1 Proxy" checkbox is disabled
    const forceV1Checkbox = appLauncherModal
      .locator('label')
      .filter({ hasText: 'Force use of V1' })
      .locator('input[type="checkbox"]')
      .first();
    await expect(forceV1Checkbox).toBeDisabled();

    // Clean up
    await closeAppLauncherModal(page);
  });

  test('User can specify custom subdomain in debug mode', async ({ page }) => {
    // 1. Enable debug mode
    await page.evaluate(() => {
      globalThis.backendaiwebui.debug = true;
    });

    // 2. Open app launcher modal
    await openAppLauncherForExistingSession(page, existingSessionName);

    const appLauncherModal = page
      .getByRole('dialog')
      .filter({ hasText: 'App:' });

    // 3. Check "Use Subdomain" checkbox
    const useSubdomainCheckbox = appLauncherModal
      .locator('label')
      .filter({ hasText: 'UseSubdomain' })
      .locator('input[type="checkbox"]');
    await useSubdomainCheckbox.check();
    await expect(useSubdomainCheckbox).toBeChecked();

    // 4. Verify subdomain input field is enabled
    const subdomainInput = appLauncherModal
      .locator('input[type="text"]')
      .last();
    await expect(subdomainInput).toBeEnabled();

    // 5. Enter subdomain value
    await subdomainInput.fill('my-custom-app');
    await expect(subdomainInput).toHaveValue('my-custom-app');

    // Clean up
    await closeAppLauncherModal(page);
  });

  test('User verifies debug controls are not visible without debug mode', async ({
    page,
  }) => {
    // 1. Disable debug mode (ensure it's disabled)
    await page.evaluate(() => {
      globalThis.backendaiwebui.debug = false;
    });

    // 2. Open app launcher modal
    await openAppLauncherForExistingSession(page, existingSessionName);

    const appLauncherModal = page
      .getByRole('dialog')
      .filter({ hasText: 'App:' });

    // 3. Verify debug options are not visible
    const forceV1Checkbox = appLauncherModal
      .locator('label')
      .filter({ hasText: 'Force use of V1' })
      .locator('input[type="checkbox"]')
      .first();
    await expect(forceV1Checkbox).not.toBeVisible();

    const forceV2Checkbox = appLauncherModal
      .locator('label')
      .filter({ hasText: 'Force use of V1' })
      .locator('input[type="checkbox"]')
      .nth(1);
    await expect(forceV2Checkbox).not.toBeVisible();

    const useSubdomainCheckbox = appLauncherModal
      .locator('label')
      .filter({ hasText: 'UseSubdomain' })
      .locator('input[type="checkbox"]');
    await expect(useSubdomainCheckbox).not.toBeVisible();

    // 4. Verify modal functions normally - apps are still visible
    const consoleAppButton = appLauncherModal
      .getByRole('button')
      .filter({ has: page.getByText('Console') });
    await expect(consoleAppButton).toBeVisible();

    // Clean up
    await closeAppLauncherModal(page);
  });
});
