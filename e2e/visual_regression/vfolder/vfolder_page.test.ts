import { loginAsVisualRegressionUser2 } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await loginAsVisualRegressionUser2(page);
  await page.setViewportSize({
    width: 1500,
    height: 1000,
  });
  await page.getByRole('link', { name: 'Data' }).click();
  await page.getByText('This storage backend').waitFor();
});

test.describe('Vfolder page Visual Regression Test', () => {
  test('Full page', async ({ page }) => {
    await expect(page).toHaveScreenshot('vfolder_page.png', {
      fullPage: true,
    });
  });

  test('Create Folder modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Folder' }).nth(1).click();
    const folderCreationModal = page.locator('.ant-modal-content').first();
    await expect(folderCreationModal).toHaveScreenshot(
      'create_folder_modal.png',
    );
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test.describe('existing folder action modal', () => {
    test('Folder info modal', async ({ page }) => {
      await page.getByRole('link', { name: 'model_folder' }).click();
      await page
        .getByRole('heading', {
          name: 'model_folder',
          exact: true,
        })
        .waitFor();

      const folderInfoModal = page.locator('.ant-modal-content').first();
      await expect(folderInfoModal).toHaveScreenshot('folder_info_modal.png');
      await page.getByRole('button', { name: 'Close' }).click();
    });

    test('Modify Permission modal', async ({ page }) => {
      await page
        .getByRole('row', { name: `VFolder Identicon model_folder` })
        .getByRole('button')
        .first()
        .click();
      await page.getByText('Modify Permissions').waitFor();
      const modifyPermissionModal = page.locator('.ant-modal-content').first();
      await expect(modifyPermissionModal).toHaveScreenshot(
        'modify_permission_modal.png',
      );
      await page.getByRole('button', { name: 'Close' }).click();
    });
  });
});
