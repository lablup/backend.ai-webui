// spec: Duplicate File Upload Test Plan
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
import fs from 'fs';
import os from 'os';
import path from 'path';

const openFolderExplorer = async (
  page: Page,
  folderName: string,
): Promise<FolderExplorerModal> => {
  await navigateTo(page, 'data');
  await clearAllFilters(page);
  await selectPropertyFilter(page, 'Name', folderName);
  const folderLink = page.getByRole('link', { name: folderName }).first();
  await expect(folderLink).toBeVisible({ timeout: 15000 });
  await folderLink.click();
  const modal = new FolderExplorerModal(page);
  await modal.waitForOpen();
  await modal.verifyFileExplorerLoaded();
  return modal;
};

// Not serial: the shared vfolder AND its baseline file are provisioned once in
// beforeAll (fresh context). Both overwrite-confirmation tests then act on that
// pre-existing duplicate independently — neither removes the baseline file
// (one overwrites it, the other cancels), so they are order-independent and a
// failure in one does not cascade-skip the other. mode: 'default' keeps them
// sequential on one worker to limit backend load. See FR-3117.
test.describe(
  'Duplicate File Upload',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
    test.describe.configure({ mode: 'default', timeout: 90_000 });
    const testFolderName = 'e2e-test-dup-upload-' + Date.now();
    let tmpDir: string;
    let testFilePath: string;

    test.beforeAll(async ({ browser, request }) => {
      // Create temporary directory and test file
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-dup-upload-'));

      testFilePath = path.join(tmpDir, 'test-duplicate-file.txt');
      fs.writeFileSync(
        testFilePath,
        'This is test file for e2e duplicate upload testing',
      );

      // Provision the shared vfolder and upload the baseline file once, in a
      // fresh context, so each overwrite test has a pre-existing duplicate to
      // act on without depending on the other test's body. try/finally
      // guarantees the context is closed even if any provisioning/upload step
      // throws, so a failed setup can't leak the context.
      const context = await browser.newContext();
      try {
        const page = await context.newPage();
        await loginAsUser(page, request);
        await createVFolderAndVerify(
          page,
          testFolderName,
          'general',
          'user',
          'rw',
        );

        // openFolderExplorer already calls verifyFileExplorerLoaded().
        const modal = await openFolderExplorer(page, testFolderName);
        const uploadButton = await modal.getUploadButton();
        await uploadButton.click();
        const [fileChooser] = await Promise.all([
          page.waitForEvent('filechooser'),
          page.getByRole('button', { name: 'file-add Upload Files' }).click(),
        ]);
        await fileChooser.setFiles([testFilePath]);
        await modal.verifyFileVisible(path.basename(testFilePath));
        await modal.close();
      } finally {
        await context.close();
      }
    });

    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
      await navigateTo(page, 'data');
    });

    test.afterAll(async ({ browser, request }) => {
      test.setTimeout(180_000);
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
      const fileName = path.basename(testFilePath);

      // 1. Open the shared VFolder (the baseline file was uploaded in beforeAll)
      const modal = await openFolderExplorer(page, testFolderName);

      // 2. Verify the pre-existing baseline file is present
      await modal.verifyFileVisible(fileName);

      // 3. Upload the SAME file again to trigger the overwrite confirmation
      const uploadButton = await modal.getUploadButton();
      await uploadButton.click();

      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.getByRole('button', { name: 'file-add Upload Files' }).click(),
      ]);

      await fileChooser.setFiles([testFilePath]);

      // 4. Verify a confirmation modal appears with the overwrite prompt
      const confirmModal = page.getByRole('dialog').last();
      await expect(confirmModal).toBeVisible();
      await expect(
        confirmModal.getByText(
          'The file or folder with the same name already exists. Do you want to overwrite?',
        ),
      ).toBeVisible();

      // 5. Click "OK" to confirm overwrite
      await page.getByRole('button', { name: 'OK' }).click();

      // 6. Verify the file still exists in the file table (overwritten)
      await modal.verifyFileVisible(fileName);

      // Close modal
      await modal.close();
    });

    test('User can cancel duplicate file upload', async ({ page }) => {
      // 1. Open the shared VFolder in FolderExplorerModal
      const modal = await openFolderExplorer(page, testFolderName);

      // 2. Verify the baseline file (uploaded in beforeAll) exists in the table
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
