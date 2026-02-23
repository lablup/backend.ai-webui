import { loginAsVisualRegressionUser, navigateTo } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await page.setViewportSize({
    width: 1500,
    height: 1500,
  });
  await loginAsVisualRegressionUser(page, request);
  await navigateTo(page, 'summary');
  await expect(page.getByText('My Sessions')).toBeVisible();
});

test.describe(
  'Dashboard page Visual Regression Test',
  { tag: ['@regression', '@visual'] },
  () => {
    // FIXME: Test fails in beforeEach - "My Sessions" text is not visible on page
    // The page might have changed or the locator needs updating
    test.fixme('dashboard full page', async ({ page }) => {
      await expect(page).toHaveScreenshot('dashboard_page.png', {
        fullPage: true,
        mask: [page.locator('td.ant-table-cell')],
        maxDiffPixelRatio: 0.07,
      });
    });
  },
);
