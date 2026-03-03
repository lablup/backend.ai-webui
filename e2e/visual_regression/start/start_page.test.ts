import { loginAsVisualRegressionUser, navigateTo } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await page.setViewportSize({
    width: 1500,
    height: 1000,
  });
  await loginAsVisualRegressionUser(page, request);
  await navigateTo(page, 'start');
  await expect(
    page.getByRole('button', { name: 'Start Session' }).first(),
  ).toBeVisible();
});

test.describe(
  'Start page Visual Regression Test',
  { tag: ['@regression', '@visual'] },
  () => {
    // FIXME: Start Session button not visible - beforeEach fails
    test.fixme('Start page screenshot', async ({ page }) => {
      await expect(page).toHaveScreenshot('start_page.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.03,
      });
    });
  },
);
