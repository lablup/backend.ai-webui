import { loginAsAdmin } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe('Information page Visual Regression Test', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.setViewportSize({
      width: 1500,
      height: 1400,
    });
  });

  test('Information page', async ({ page }) => {
    await page.getByRole('link', { name: 'Information' }).click();
    await page.getByText('core').waitFor();
    await expect(page).toHaveScreenshot('information_page.png', {
      fullPage: true,
    });
  });
});
