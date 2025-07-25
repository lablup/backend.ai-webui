import { loginAsUser2 } from './utils/test-util';
import { expect, test } from '@playwright/test';

test.describe('Summary page Visual Regression Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
      width: 1500,
      height: 1500,
    });
    await loginAsUser2(page);
    // change dashboard mode
    await page.getByTestId('user-dropdown-button').click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('menuitem', { name: 'setting Preferences' }).click();
    await page.getByLabel('Use Dashboard page instead of').click();
  });

  test(`dashboard full page`, async ({ page }) => {
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByText('My Sessions').waitFor();
    await expect(page).toHaveScreenshot('dashboard_page.png', {
      fullPage: true,
    });
  });
});
