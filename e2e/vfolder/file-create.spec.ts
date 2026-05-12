import { FolderExplorerModal } from '../utils/classes/vfolder/FolderExplorerModal';
import {
  loginAsUser,
  navigateTo,
  createVFolderAndVerify,
  moveToTrashAndVerify,
  deleteForeverAndVerifyFromTrash,
  selectPropertyFilter,
  clearAllFilters,
} from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

const openFolderExplorer = async (
  page: Page,
  folderName: string,
): Promise<FolderExplorerModal> => {
  await navigateTo(page, 'data');
  await clearAllFilters(page);
  await selectPropertyFilter(page, 'Name', folderName);
  const folderLink = page.getByRole('link', { name: folderName }).first();
  await folderLink.waitFor({ state: 'visible' });
  await folderLink.click();
  const modal = new FolderExplorerModal(page);
  await modal.waitForOpen();
  return modal;
};

test.describe(
  'File Creation in VFolder Explorer',
  {
    tag: ['@critical', '@vfolder', '@functional', '@smoke', '@smoke-user'],
  },
  () => {
    const testFolderName = 'e2e-test-file-create-' + new Date().getTime();

    test.beforeAll(async ({ browser, request }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await loginAsUser(page, request);
      await createVFolderAndVerify(page, testFolderName);
      await context.close();
    });

    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
    });

    test.afterAll(async ({ browser, request }) => {
      // Use an extended timeout to allow for delete-forever operation completion
      test.setTimeout(180_000);
      const context = await browser.newContext();
      const page = await context.newPage();
      await loginAsUser(page, request);
      try {
        await moveToTrashAndVerify(page, testFolderName);
        await deleteForeverAndVerifyFromTrash(page, testFolderName);
      } catch {
        console.log(`Could not delete ${testFolderName}, it may not exist`);
      }
      await context.close();
    });

    test('User can see Create File button in file explorer', async ({
      page,
    }) => {
      const modal = await openFolderExplorer(page, testFolderName);
      await modal.verifyFileExplorerLoaded();

      // Verify Create File button is visible and enabled
      const createFileButton = await modal.getCreateFileButton();
      await expect(createFileButton).toBeEnabled();

      await modal.close();
    });

    test('User can create a new file in the file explorer', async ({
      page,
    }) => {
      const modal = await openFolderExplorer(page, testFolderName);
      await modal.verifyFileExplorerLoaded();

      // Click Create File button
      const createFileButton = await modal.getCreateFileButton();
      await createFileButton.click();

      // Verify Create File modal appears
      const createFileModal = page.getByRole('dialog').filter({
        hasText: 'Create a new file',
      });
      await expect(createFileModal).toBeVisible();

      // Enter file name
      const fileName = 'test-file-' + new Date().getTime() + '.txt';
      await createFileModal.getByRole('textbox').fill(fileName);

      // Click Create button
      await createFileModal.getByRole('button', { name: 'Create' }).click();

      // Verify file appears in the file list
      await modal.verifyFileVisible(fileName);

      await modal.close();
    });

    test('User can create a yaml configuration file', async ({ page }) => {
      const modal = await openFolderExplorer(page, testFolderName);
      await modal.verifyFileExplorerLoaded();

      const createFileButton = await modal.getCreateFileButton();
      await createFileButton.click();

      const createFileModal = page.getByRole('dialog').filter({
        hasText: 'Create a new file',
      });
      await expect(createFileModal).toBeVisible();

      const fileName = 'model-definition-' + new Date().getTime() + '.yaml';
      await createFileModal.getByRole('textbox').fill(fileName);

      await createFileModal.getByRole('button', { name: 'Create' }).click();

      await modal.verifyFileVisible(fileName);
      await modal.close();
    });

    test('User cannot create a file with empty name', async ({ page }) => {
      const modal = await openFolderExplorer(page, testFolderName);
      await modal.verifyFileExplorerLoaded();

      const createFileButton = await modal.getCreateFileButton();
      await createFileButton.click();

      const createFileModal = page.getByRole('dialog').filter({
        hasText: 'Create a new file',
      });
      await expect(createFileModal).toBeVisible();

      // Click Create without entering a name
      await createFileModal.getByRole('button', { name: 'Create' }).click();

      // Verify validation error message appears
      await expect(
        createFileModal.getByText('Please enter the file name.'),
      ).toBeVisible();

      // Modal should still be open
      await expect(createFileModal).toBeVisible();

      // Cancel the modal
      await createFileModal.getByRole('button', { name: 'Cancel' }).click();
      await modal.close();
    });

    test('User cannot create a file with invalid characters in name', async ({
      page,
    }) => {
      const modal = await openFolderExplorer(page, testFolderName);
      await modal.verifyFileExplorerLoaded();

      const createFileButton = await modal.getCreateFileButton();
      await createFileButton.click();

      const createFileModal = page.getByRole('dialog').filter({
        hasText: 'Create a new file',
      });
      await expect(createFileModal).toBeVisible();

      // Test forward slash
      await createFileModal.getByRole('textbox').fill('invalid/file.txt');
      await createFileModal.getByRole('button', { name: 'Create' }).click();
      await expect(
        createFileModal.getByText('File name must not contain path separators'),
      ).toBeVisible();
      await expect(createFileModal).toBeVisible();

      // Test backslash
      await createFileModal.getByRole('textbox').clear();
      await createFileModal.getByRole('textbox').fill('invalid\\file.txt');
      await createFileModal.getByRole('button', { name: 'Create' }).click();
      await expect(
        createFileModal.getByText('File name must not contain path separators'),
      ).toBeVisible();
      await expect(createFileModal).toBeVisible();

      await createFileModal.getByRole('button', { name: 'Cancel' }).click();
      await modal.close();
    });
  },
);

test.describe(
  'File Creation - Read Only VFolder',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
      await navigateTo(page, 'data');
    });

    // TODO: Permission API returns inaccurate response, so write buttons are not properly disabled for read-only folders.
    // Re-enable this test when the permission API is fixed.
    test.skip('User cannot create files in read-only VFolder', async ({
      page,
    }) => {
      const roFolderName = 'e2e-test-file-create-ro-' + new Date().getTime();

      // Create a read-only vfolder
      await createVFolderAndVerify(page, roFolderName, 'general', 'user', 'ro');

      // Open the folder explorer
      const modal = await openFolderExplorer(page, roFolderName);
      await modal.verifyFileExplorerLoaded();
      await modal.verifyPermission('Read only');

      // Verify Create File button is disabled
      const createFileButton = page
        .getByRole('dialog')
        .first()
        .getByRole('button', { name: /Create File/ });
      await expect(createFileButton.first()).toBeDisabled();

      await modal.close();

      // Cleanup
      await moveToTrashAndVerify(page, roFolderName);
      await deleteForeverAndVerifyFromTrash(page, roFolderName);
    });
  },
);
