import { loginAsVisualRegressionAdmin } from '../../utils/test-util';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await loginAsVisualRegressionAdmin(page, request);
  await page.setViewportSize({
    width: 1500,
    height: 1400,
  });
  await page.getByRole('link', { name: 'Information' }).click();
  await page.waitForLoadState('networkidle');
});

test.describe(
  'Information page Visual Regression Test',
  { tag: ['@regression', '@visual'] },
  () => {
    test('Information page screenshot', async ({ page }) => {
      await expect(page).toHaveScreenshot('information_page.png', {
        fullPage: true,
      });
    });
  },
);
