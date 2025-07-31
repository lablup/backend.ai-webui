import { loginAsAdmin } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page);
  await page.setViewportSize({
    width: 1500,
    height: 2000,
  });
});
test.describe.configure({ mode: 'serial' });
test.describe('Configuration page Visual Regression Test', () => {
  test('Configuration page', async ({ page }) => {
    await page.getByRole('link', { name: 'Configurations' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('configurations_page.png', {
      fullPage: true,
    });
  });

  test('Overlay Network settings modal', async ({ page }) => {
    await page.getByRole('link', { name: 'Configurations' }).click();
    await page
      .locator('div')
      .filter({
        hasText:
          /^Overlay NetworkConfiguration to use when creating overlay networks\.Config$/,
      })
      .getByRole('button')
      .click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('overlay_network_settings_modal.png', {
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('Scheduler settings modal', async ({ page }) => {
    await page.getByRole('link', { name: 'Configurations' }).click();
    await page
      .locator('div')
      .filter({ hasText: /^SchedulerConfiguration per job scheduler\.Config$/ })
      .getByRole('button')
      .click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('scheculer_settings_modal.png', {
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Close' }).click();
  });
});
