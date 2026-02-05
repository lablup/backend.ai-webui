import { loginAsVisualRegressionUser2 } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await page.setViewportSize({
    width: 1500,
    height: 1000,
  });
  await loginAsVisualRegressionUser2(page, request);
  await page.getByRole('menuitem', { name: 'Start' }).click();
  await page.waitForLoadState('networkidle');
});

test.describe(
  'Start page Visual Regression Test',
  { tag: ['@regression', '@visual'] },
  () => {
    test('Start page screenshot', async ({ page }) => {
      await expect(page).toHaveScreenshot('start_page.png', {
        fullPage: true,
      });
    });
  },
);
