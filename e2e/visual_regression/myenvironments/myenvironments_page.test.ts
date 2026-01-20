import { loginAsVisualRegressionUser2 } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.describe('Summary page Visual Regression Test', () => {
  test.beforeEach(async ({ page, request }) => {
    await page.setViewportSize({
      width: 2000,
      height: 1200,
    });
    await loginAsVisualRegressionUser2(page, request);
    await page.getByRole('link', { name: 'My Environments' }).click();
    await page.waitForLoadState('networkidle');
  });

  test(`my environments full page`, async ({ page }) => {
    await expect(page).toHaveScreenshot('myenvironments_page.png', {
      fullPage: true,
    });
  });

  test('column setting modal', async ({ page }) => {
    await page.getByRole('button', { name: 'setting' }).click();
    const columnSettingModal = page.locator('div.ant-modal').first();
    await expect(columnSettingModal).toHaveScreenshot(
      'column_setting_modal.png',
    );
  });
});
