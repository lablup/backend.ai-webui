import { loginAsVisualRegressionUser2 } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({
    width: 1500,
    height: 1000,
  });
  await loginAsVisualRegressionUser2(page);
  await page.getByRole('menuitem', { name: 'Start' }).click();
  await page.waitForLoadState('networkidle');
});

test('Start page Visual Regression Test', async ({ page }) => {
  await expect(page).toHaveScreenshot('start_page.png', {
    fullPage: true,
  });
});
