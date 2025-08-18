import { loginAsVisualRegressionAdmin } from '../../utils/test-util';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await loginAsVisualRegressionAdmin(page);
  await page.setViewportSize({
    width: 1500,
    height: 1400,
  });
  await page.getByRole('link', { name: 'Information' }).click();
  await page.waitForLoadState('networkidle');
});

test('Information page Visual Regression Test', async ({ page }) => {
  await expect(page).toHaveScreenshot('information_page.png', {
    fullPage: true,
  });
});
