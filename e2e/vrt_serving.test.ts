import { loginAsUser2 } from './utils/test-util';
import { expect, test } from '@playwright/test';

test.describe('Session page Visual Regression Test', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser2(page);
    await page.getByRole('link', { name: 'Serving' }).click();
    await page.getByText('Active', { exact: true }).waitFor();
  });

  test('serving full page', async ({ page }) => {
    await page.setViewportSize({
      width: 1920,
      height: 1200,
    });
    await expect(page).toHaveScreenshot('session_page.png', {
      fullPage: true,
    });
  });

  test('Create a new service page', async ({ page }) => {
    await page.setViewportSize({
      width: 1300,
      height: 2300,
    });
    await page.getByRole('button', { name: 'Start Service' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('create_service_page.png', {
      fullPage: true,
    });
  });

  test('Update Service', async ({ page }) => {
    await page.setViewportSize({
      width: 1100,
      height: 2200,
    });
    await page.getByRole('button', { name: 'setting' }).click();
    await page.getByText('Service Name(optional)').waitFor();
    await expect(page).toHaveScreenshot('update_service_page.png', {
      fullPage: true,
    });
  });

  test('Delete modal', async ({ page }) => {
    await page.getByRole('button', { name: 'delete' }).click();
    await expect(page).toHaveScreenshot('delete_modal.png', {
      fullPage: true,
    });
  });
});
