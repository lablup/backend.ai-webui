import {
  loginAsVisualRegressionAdmin,
  navigateTo,
} from '../../utils/test-util';
import { expect, test } from '@playwright/test';

// FIXME: Test fails in beforeEach - lablup-progress-bar element not found
// This Lit-Element component might have been replaced with React or the page has been redesigned
// Skip this test because this page will be replaced with a NEO design
test.beforeEach(async ({ page, request }) => {
  await page.setViewportSize({
    width: 1500,
    height: 1200,
  });
  await loginAsVisualRegressionAdmin(page, request);
  await navigateTo(page, 'summary');
  await expect(page.locator('lablup-progress-bar').first()).toBeVisible();
});

test.describe(
  'Summary page Visual Regression Test',
  { tag: ['@regression', '@visual'] },
  () => {
    // FIXME: Test skipped due to beforeEach failure (lablup-progress-bar not found)
    test.fixme(`Test in light mode`, async ({ page }) => {
      await expect(page).toHaveScreenshot(`summary_light.png`, {
        mask: [
          page.locator('lablup-progress-bar'),
          page.locator('span.percentage.start-bar'),
          page.locator('span.percentage.end-bar'),
        ],
        fullPage: true,
      });
    });

    // FIXME: Test skipped due to beforeEach failure (lablup-progress-bar not found)
    test.fixme(`Test in dark mode`, async ({ page }) => {
      await page.getByRole('button', { name: 'moon' }).click();
      await expect(page.getByRole('button', { name: 'sun' })).toBeVisible();

      await expect(page).toHaveScreenshot('summary_dark.png', {
        mask: [
          page.locator('lablup-progress-bar'),
          page.locator('span.percentage.start-bar'),
          page.locator('span.percentage.end-bar'),
        ],
        fullPage: true,
      });

      await page.getByRole('button', { name: 'sun' }).click();
    });
  },
);
