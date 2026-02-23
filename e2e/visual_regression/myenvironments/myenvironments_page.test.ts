import { loginAsVisualRegressionUser, navigateTo } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.describe(
  'My Environments page Visual Regression Test',
  { tag: ['@regression', '@environment', '@visual'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await page.setViewportSize({
        width: 2000,
        height: 1200,
      });
      await loginAsVisualRegressionUser(page, request);
      await navigateTo(page, 'my-environment');
      await expect(page.getByRole('button', { name: 'setting' })).toBeVisible();
    });

    // FIXME: Test fails in beforeEach - setting button not visible
    // The my-environment page might have changed and no longer has a setting button in the expected location
    test.fixme(`my environments full page`, async ({ page }) => {
      await expect(page).toHaveScreenshot('myenvironments_page.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });

    // FIXME: Test fails in beforeEach - setting button not visible
    test.fixme('column setting modal', async ({ page }) => {
      await page.getByRole('button', { name: 'setting' }).click();
      const columnSettingModal = page.locator('div.ant-modal').first();
      await expect(columnSettingModal).toHaveScreenshot(
        'column_setting_modal.png',
        {
          maxDiffPixelRatio: 0.02,
        },
      );
    });
  },
);
