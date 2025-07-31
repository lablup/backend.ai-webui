import { FolderCreationModal } from '../../utils/classes/FolderCreationModal';
import {
  loginAsUser2,
  moveToTrashAndVerify,
  deleteForeverAndVerifyFromTrash,
} from '../../utils/test-util';
import { expect, test } from '@playwright/test';

const folderName = 'e2e-test-visual-regression';
test.describe.parallel('Vfolder page Visual Regression Test', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser2(page);
    await page.setViewportSize({
      width: 1500,
      height: 1000,
    });
    await page.getByRole('link', { name: 'Data' }).click();
    await page.getByText('This storage backend').waitFor();
  });

  test('Full page', async ({ page }) => {
    await expect(page).toHaveScreenshot('vfolder_page.png', {
      fullPage: true,
    });
  });

  test('Create Folder modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Folder' }).nth(1).click();
    await expect(page).toHaveScreenshot('create_folder_modal.png', {
      fullPage: true,
    });
  });

  test.describe('existing folder action modal', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Create Folder' }).nth(1).click();
      const folderCreationModal = new FolderCreationModal(page);
      await folderCreationModal.fillFolderName(folderName);
      await (await folderCreationModal.getCreateButton()).click();
      await page.getByLabel('Close', { exact: true }).first().click();

      await page.reload();
      await page.getByRole('link', { name: folderName }).waitFor();
    });

    test.afterEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Close' }).click();
      await moveToTrashAndVerify(page, folderName);
      await deleteForeverAndVerifyFromTrash(page, folderName);
    });

    test('Folder info modal', async ({ page }) => {
      await page.getByRole('link', { name: folderName }).click();
      await page
        .getByRole('heading', {
          name: 'e2e-test-visual-regression',
          exact: true,
        })
        .waitFor();

      await expect(page).toHaveScreenshot('folder_info_modal.png', {
        fullPage: true,
        mask: [
          page.locator('tr.ant-descriptions-row', {
            hasText: 'Created At',
          }),
          page.locator('tr.ant-descriptions-row', {
            hasText: 'Path',
          }),
        ],
      });
    });

    test('Modify Permission modal', async ({ page }) => {
      await page
        .getByRole('row', { name: 'VFolder Identicon e2e-test' })
        .getByRole('button')
        .first()
        .click();
      await page.getByText('Modify Permissions').waitFor();
      await expect(page).toHaveScreenshot('modify_permission_modal.png', {
        fullPage: true,
        mask: [page.getByRole('img', { name: 'VFolder Identicon' })],
      });
    });
  });
});
