import { loginAsVisualRegressionAdmin } from '../../utils/test-util';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await loginAsVisualRegressionAdmin(page, request);
  await page.getByRole('link', { name: 'Maintenance' }).click();
  await page.waitForLoadState('networkidle');
});

test.describe(
  'Maintenance page Visual Regression Test',
  { tag: ['@regression', '@maintenance', '@visual'] },
  () => {
    test('Maintenance page screenshot', async ({ page }) => {
      await expect(page).toHaveScreenshot('maintenance_page.png');
    });
  },
);
