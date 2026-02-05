import { loginAsVisualRegressionAdmin } from '../../utils/test-util';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await loginAsVisualRegressionAdmin(page, request);
  await page.setViewportSize({
    width: 1500,
    height: 2000,
  });
  await page.getByRole('link', { name: 'Configurations' }).click();
  await page.waitForLoadState('networkidle');
});

test.describe(
  'Configuration page Visual Regression Test',
  { tag: ['@regression', '@config', '@visual'] },
  () => {
    test('Configuration page', async ({ page }) => {
      await expect(page).toHaveScreenshot('configurations_page.png', {
        fullPage: true,
      });
    });

    test('Overlay Network settings modal', async ({ page }) => {
      await page
        .locator('div')
        .filter({
          hasText:
            /^Overlay NetworkConfiguration to use when creating overlay networks\.Config$/,
        })
        .getByRole('button')
        .click();
      await page.waitForLoadState('networkidle');
      const overlayNetworkSettingsModal = page.locator('div.ant-modal').first();
      await expect(overlayNetworkSettingsModal).toHaveScreenshot(
        'overlay_network_settings_modal.png',
      );
      await page.getByRole('button', { name: 'Close' }).click();
    });

    test('Scheduler settings modal', async ({ page }) => {
      await page
        .locator('div')
        .filter({
          hasText: /^SchedulerConfiguration per job scheduler\.Config$/,
        })
        .getByRole('button')
        .click();
      await page.waitForLoadState('networkidle');
      const SchedulerSettingModal = page.locator('div.ant-modal').first();
      await expect(SchedulerSettingModal).toHaveScreenshot(
        'scheduler_settings_modal.png',
      );
      await page.getByRole('button', { name: 'Close' }).click();
    });
  },
);
