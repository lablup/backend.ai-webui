import { loginAsVisualRegressionUser, navigateTo } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await page.setViewportSize({
    width: 1500,
    height: 1500,
  });
  await loginAsVisualRegressionUser(page, request);
  await navigateTo(page, 'import');
  await expect(
    page.getByRole('button', { name: 'Import and Run' }),
  ).toBeVisible();
});

test.describe(
  'Import & Run page Visual Regression Test',
  { tag: ['@regression', '@visual'] },
  () => {
    test('Import & Run page screenshot', async ({ page }) => {
      await expect(page).toHaveScreenshot('import_page.png', {
        mask: [
          page.locator('#cpu-usage-bar #front'),
          page.locator('#cpu-usage-bar-2 #front'),
          page.locator('#mem-usage-bar'),
          page.locator('#mem-usage-bar-2'),
          page.locator('#concurrency-usage-bar'),
        ],
        fullPage: true,
        maxDiffPixelRatio: 0.08,
      });
    });
  },
);
