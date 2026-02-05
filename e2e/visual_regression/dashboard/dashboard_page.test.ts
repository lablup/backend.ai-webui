import { loginAsVisualRegressionUser2 } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await page.setViewportSize({
    width: 1500,
    height: 1500,
  });
  await loginAsVisualRegressionUser2(page, request);
  // change dashboard mode
  await page.getByTestId('user-dropdown-button').click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('menuitem', { name: 'setting Preferences' }).click();
  await page.getByLabel('Use Dashboard page instead of').click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByText('My Sessions').waitFor();
});

test.describe(
  'Dashboard page Visual Regression Test',
  { tag: ['@regression', '@visual'] },
  () => {
    test('dashboard full page', async ({ page }) => {
      await expect(page).toHaveScreenshot('dashboard_page.png', {
        fullPage: true,
        mask: [page.locator('td.ant-table-cell')],
      });
    });
  },
);
