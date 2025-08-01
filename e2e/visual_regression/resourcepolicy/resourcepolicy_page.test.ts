import { loginAsAdmin } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.describe('Resource Policy page Visual Regression Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
      width: 1800,
      height: 1400,
    });
    await loginAsAdmin(page);
    await page
      .getByRole('link', { name: 'Resource Policy', exact: true })
      .click();
    await page.getByText('Name', { exact: true }).waitFor();
  });

  // Keypair table
  test(`keypair table`, async ({ page }) => {
    await page.getByRole('tab', { name: 'Keypair' }).click();
    await expect(page).toHaveScreenshot('keypair_table.png', {
      fullPage: true,
    });

    // info modal
    await page.getByRole('button', { name: 'info-circle' }).click();
    // await page.getByText('Resource Policy:').waitFor();
    await expect(page).toHaveScreenshot('keypair_info_modal.png', {
      fullPage: true,
      mask: [page.getByText('Resource Policy:'), page.getByRole('cell')],
    });
    await page.getByRole('button', { name: 'Close' }).click();

    // create modal
    await page.getByRole('button', { name: 'plus Create' }).click();
    await page.getByText('Create Resource Policy').waitFor();
    await expect(page).toHaveScreenshot('keypair_create_modal.png', {
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  // User table
  test('user table', async ({ page }) => {
    await page.getByRole('tab', { name: 'User' }).click();
    await page.getByText('Max Session Count Per Model').waitFor();
    await expect(page).toHaveScreenshot('user_table.png', {
      fullPage: true,
    });

    // create modal
    await page.getByRole('button', { name: 'plus Create' }).click();
    await page.getByText('Create Resource Policy').waitFor();
    await expect(page).toHaveScreenshot('user_create_modal.png', {
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  // Project table
  test('project table', async ({ page }) => {
    await page.getByRole('tab', { name: 'Project' }).click();
    await page.getByText('Max Quota Scope Size (GB)').waitFor();
    await expect(page).toHaveScreenshot('project_table.png', {
      fullPage: true,
    });

    // create modal
    await page.getByRole('button', { name: 'plus Create' }).click();
    await page.getByText('Create Resource Policy').waitFor();
    await expect(page).toHaveScreenshot('project_create_modal.png', {
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
