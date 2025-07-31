import { loginAsAdmin } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe('Maintenance page Visual Regression Test', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Maintenance page', async ({ page }) => {
    await page.getByRole('link', { name: 'Maintenance' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('maintenance_page.png');
  });
});
