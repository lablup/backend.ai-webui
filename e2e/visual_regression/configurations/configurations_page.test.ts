import {
  loginAsVisualRegressionAdmin,
  navigateTo,
} from '../../utils/test-util';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await loginAsVisualRegressionAdmin(page, request);
  await page.setViewportSize({
    width: 1500,
    height: 2000,
  });
  await navigateTo(page, 'settings');
  await expect(
    page.getByText('Overlay Network', { exact: true }),
  ).toBeVisible();
});

test.describe(
  'Configuration page Visual Regression Test',
  { tag: ['@regression', '@config', '@visual'] },
  () => {
    // FIXME: Login fails - user-dropdown-button not visible after login
    test.fixme('Configuration page', async ({ page }) => {
      await expect(page).toHaveScreenshot('configurations-page.png', {
        fullPage: true,
      });
    });

    // FIXME: Login fails - user-dropdown-button not visible after login
    test.fixme('Overlay Network settings modal', async ({ page }) => {
      await page
        .locator('div')
        .filter({
          hasText:
            /^Overlay NetworkConfiguration to use when creating overlay networks\.Config$/,
        })
        .getByRole('button')
        .click();
      // Wait for modal to be visible and animation to complete
      const overlayNetworkSettingsModal = page.getByRole('dialog', {
        name: /Overlay Network settings/i,
      });
      await expect(overlayNetworkSettingsModal).toBeVisible();
      // Wait for the modal dialog content to be fully rendered
      await expect(overlayNetworkSettingsModal.getByText('MTU')).toBeVisible();
      await expect(overlayNetworkSettingsModal).toHaveScreenshot(
        'overlay-network-settings-modal.png',
        { maxDiffPixelRatio: 0.02 },
      );
      await page.getByRole('button', { name: 'Close' }).click();
    });

    // FIXME: Test fails because beforeEach navigation fails after first test runs
    // Error: page.getByText('Overlay Network', { exact: true }) is not visible after previous test
    test.fixme('Scheduler settings modal', async ({ page }) => {
      await page
        .locator('div')
        .filter({
          hasText: /^SchedulerConfiguration per job scheduler\.Config$/,
        })
        .getByRole('button')
        .click();
      // Wait for modal to be visible and animation to complete
      const schedulerSettingModal = page.getByRole('dialog', {
        name: /Scheduler settings/i,
      });
      await expect(schedulerSettingModal).toBeVisible();
      // Wait for the modal dialog content to be fully rendered
      await expect(
        schedulerSettingModal.getByText('Scheduler', { exact: true }),
      ).toBeVisible();
      await expect(schedulerSettingModal).toHaveScreenshot(
        'scheduler-settings-modal.png',
      );
      await page.getByRole('button', { name: 'Close' }).click();
    });
  },
);
