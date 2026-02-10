// spec: Duplicate File Upload Test Plan
import { FolderExplorerModal } from '../utils/classes/vfolder/FolderExplorerModal';
import {
  loginAsUser,
  navigateTo,
  createVFolderAndVerify,
  moveToTrashAndVerify,
  deleteForeverAndVerifyFromTrash,
} from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import os from 'os';
import path from 'path';

const openFolderExplorer = async (
  page: Page,
  folderName: string,
): Promise<FolderExplorerModal> => {
  await navigateTo(page, 'data');
  await page
    .getByRole('link', { name: folderName })
    .first()
    .click({ force: true });
  const modal = new FolderExplorerModal(page);
  await modal.waitForOpen();
  return modal;
};

test.describe.serial(
  'Duplicate File Upload',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
    const testFolderName = 'e2e-test-dup-upload-' + Date.now();
    let tmpDir: string;
    let testFilePath: string;

    test.beforeAll(async () => {
      // Create temporary directory and test file
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-dup-upload-'));

      testFilePath = path.join(tmpDir, 'test-duplicate-file.txt');
      fs.writeFileSync(
        testFilePath,
        'This is test file for e2e duplicate upload testing',
      );
    });

    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
      await navigateTo(page, 'data');
    });

    test.afterAll(async ({ browser, request }) => {
      // Cleanup: delete VFolder
      const context = await browser.newContext();
      const page = await context.newPage();

      await loginAsUser(page, request);

      try {
        await moveToTrashAndVerify(page, testFolderName);
        await deleteForeverAndVerifyFromTrash(page, testFolderName);
      } catch {
        /* ignore cleanup errors */
      }

      await context.close();

      // Cleanup: delete temporary test files
      try {
        if (tmpDir && fs.existsSync(tmpDir)) {
          fs.rmSync(tmpDir, { recursive: true, force: true });
        }
      } catch {
        /* ignore cleanup errors */
      }
    });

    test('User sees duplicate confirmation when uploading existing file', async ({
      page,
    }) => {
      // 1. Create a VFolder with Read & Write permissions
      await createVFolderAndVerify(
        page,
        testFolderName,
        'general',
        'user',
        'rw',
      );

      // 2. Open the VFolder in FolderExplorerModal
      let modal = await openFolderExplorer(page, testFolderName);

      // 3. Verify file explorer loaded
      await modal.verifyFileExplorerLoaded();

      // 4. Upload a test file via Upload button (first upload - establish baseline)
      const uploadButton = await modal.getUploadButton();
      await uploadButton.click();

      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.getByRole('button', { name: 'file-add Upload Files' }).click(),
      ]);

      await fileChooser.setFiles([testFilePath]);

      // 5. Verify the file appears in the file table
      const fileName = path.basename(testFilePath);
      await modal.verifyFileVisible(fileName);

      // 6. Close the modal
      await modal.close();

      // 7. Re-open the VFolder in FolderExplorerModal
      modal = await openFolderExplorer(page, testFolderName);

      // 8. Click "Upload" button again
      const uploadButton2 = await modal.getUploadButton();
      await uploadButton2.click();

      // 9. Upload the SAME file again
      const [fileChooser2] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.getByRole('button', { name: 'file-add Upload Files' }).click(),
      ]);

      await fileChooser2.setFiles([testFilePath]);

      // 10. Verify a confirmation modal appears with title "Overwrite Confirmation"
      const confirmModal = page.getByRole('dialog').last();
      await expect(confirmModal).toBeVisible();
      await expect(
        confirmModal.getByText(
          'The file or folder with the same name already exists. Do you want to overwrite?',
        ),
      ).toBeVisible();

      // 11. Click "OK" to confirm overwrite
      await page.getByRole('button', { name: 'OK' }).click();

      // 12. Verify the file still exists in the file table (overwritten)
      await modal.verifyFileVisible(fileName);

      // Close modal
      await modal.close();
    });

    test('User can cancel duplicate file upload', async ({ page }) => {
      // 1. Open the same VFolder in FolderExplorerModal
      const modal = await openFolderExplorer(page, testFolderName);

      // 2. Verify the file from previous test exists in the table
      const fileName = path.basename(testFilePath);
      await modal.verifyFileVisible(fileName);

      // 3. Click "Upload" button
      const uploadButton = await modal.getUploadButton();
      await uploadButton.click();

      // 4. Upload the same file again
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.getByRole('button', { name: 'file-add Upload Files' }).click(),
      ]);

      await fileChooser.setFiles([testFilePath]);

      // 5. Verify the duplicate confirmation modal appears ("Overwrite Confirmation")
      const confirmModal = page.getByRole('dialog').last();
      await expect(confirmModal).toBeVisible();
      await expect(
        confirmModal.getByText(
          'The file or folder with the same name already exists. Do you want to overwrite?',
        ),
      ).toBeVisible();

      // 6. Click "Cancel" to reject overwrite
      await page.getByRole('button', { name: 'Cancel' }).click();

      // 7. Verify the original file still exists in the file table
      await modal.verifyFileVisible(fileName);

      // Close modal
      await modal.close();
    });
  },
);
