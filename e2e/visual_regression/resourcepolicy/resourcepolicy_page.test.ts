import { loginAsAdmin } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

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

test.describe('Resource Policy page Visual Regression Test', () => {
  // Keypair table
  test(`keypair table`, async ({ page }) => {
    await page.getByRole('tab', { name: 'Keypair' }).click();
    await expect(page).toHaveScreenshot('keypair_table.png', {
      fullPage: true,
    });

    // info modal
    await page.getByRole('button', { name: 'info-circle' }).click();
    const resourceInfoModal = page.locator(
      'div.ant-modal.css-dev-only-do-not-override-1wkvdan.bai-modal',
    );
    await expect(resourceInfoModal).toHaveScreenshot('keypair_info_modal.png');
    await page.getByRole('button', { name: 'Close' }).click();

    // create modal
    await page.getByRole('button', { name: 'plus Create' }).click();
    await page.getByText('Create Resource Policy').waitFor();
    const createKeypairModal = page.locator('div.ant-modal-content').nth(1);
    await expect(createKeypairModal).toHaveScreenshot(
      'create_resource_policy_modal.png',
    );
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
    const createUserModal = page.locator(
      'div.ant-modal.css-dev-only-do-not-override-1wkvdan.bai-modal',
    );
    await expect(createUserModal).toHaveScreenshot('user_create_modal.png');
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
    const createProjectModal = page.locator(
      'div.ant-modal.css-dev-only-do-not-override-1wkvdan.bai-modal',
    );
    await expect(createProjectModal).toHaveScreenshot(
      'project_create_modal.png',
    );
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
