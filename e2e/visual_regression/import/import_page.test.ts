import { loginAsVisualRegressionUser2 } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({
    width: 1500,
    height: 1500,
  });
  await loginAsVisualRegressionUser2(page);
  await page.getByRole('menuitem', { name: 'Import & Run' }).click();
  await page.waitForLoadState('networkidle');
});

test('Import & Run page Visual Regression Test', async ({ page }) => {
  await expect(page).toHaveScreenshot('import_page.png', {
    mask: [
      page.locator('#cpu-usage-bar #front'),
      page.locator('#cpu-usage-bar-2 #front'),
      page.locator('#mem-usage-bar'),
      page.locator('#mem-usage-bar-2'),
      page.locator('#concurrency-usage-bar'),
    ],
    fullPage: true,
  });
});
