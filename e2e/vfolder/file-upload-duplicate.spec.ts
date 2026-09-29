// spec: Duplicate File Upload Test Plan
import { FolderExplorerModal } from '../utils/classes/vfolder/FolderExplorerModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import {
  loginAsUser,
  navigateTo,
  createVFolderAndVerify,
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

const OVERWRITE_PROMPT =
  'These items already exist here. Select the ones to overwrite; unselected items are skipped.';

/** Picks files through the explorer's upload menu and returns the confirm dialog. */
const uploadFiles = async (
  page: Page,
  modal: FolderExplorerModal,
  filePaths: Array<string>,
) => {
  const uploadButton = await modal.getUploadButton();
  await uploadButton.click();
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('menuitem', { name: 'Upload Files' }).click(),
  ]);
  await fileChooser.setFiles(filePaths);
  return page.getByRole('dialog').last();
};

// Not serial: the shared vfolder AND its baseline file are provisioned once in
// beforeAll (fresh context). The overwrite-confirmation tests then act on that
// pre-existing duplicate independently — none of them removes the baseline file
// (one overwrites it, one cancels, one deselects it), so they are
// order-independent and a failure in one does not cascade-skip the others.
// mode: 'default' keeps them sequential on one worker to limit backend load.
// See FR-3117.
test.describe(
  'Duplicate File Upload',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
    test.describe.configure({ mode: 'default', timeout: 90_000 });
    const testFolderName = 'e2e-test-dup-upload-' + Date.now();
    let tmpDir: string;
    let testFilePath: string;
    // Never uploaded in beforeAll: the mixed-pick test needs one name that is
    // still free in the shared folder.
    let freshFilePath: string;

    test.beforeAll(async ({ browser, request }) => {
      // Create temporary directory and test file
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-dup-upload-'));

      testFilePath = path.join(tmpDir, 'test-duplicate-file.txt');
      fs.writeFileSync(
        testFilePath,
        'This is test file for e2e duplicate upload testing',
      );

      freshFilePath = path.join(tmpDir, 'test-new-file.txt');
      fs.writeFileSync(
        freshFilePath,
        'This is test file for e2e mixed duplicate upload testing',
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
        // The folder is empty, so nothing collides and no confirmation opens.
        await uploadFiles(page, modal, [testFilePath]);
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

      await cleanupVFolderSafely(page, testFolderName);

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

    test('User sees the colliding file listed and can overwrite it', async ({
      page,
    }) => {
      const fileName = path.basename(testFilePath);

      // 1. Open the shared VFolder (the baseline file was uploaded in beforeAll)
      const modal = await openFolderExplorer(page, testFolderName);

      // 2. Verify the pre-existing baseline file is present
      await modal.verifyFileVisible(fileName);

      // 3. Upload the SAME file again to trigger the overwrite confirmation
      const confirmModal = await uploadFiles(page, modal, [testFilePath]);

      // 4. The confirmation names the colliding file rather than asking once
      //    for the whole pick
      await expect(confirmModal).toBeVisible();
      await expect(confirmModal.getByText(OVERWRITE_PROMPT)).toBeVisible();
      await expect(
        confirmModal.getByRole('row').filter({ hasText: fileName }),
      ).toBeVisible();

      // 5. Confirm with the row left checked, which overwrites it
      await confirmModal.getByRole('button', { name: 'Upload' }).click();

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

      // 3. Upload the same file again
      const confirmModal = await uploadFiles(page, modal, [testFilePath]);

      // 4. Verify the duplicate confirmation modal appears
      await expect(confirmModal).toBeVisible();
      await expect(confirmModal.getByText(OVERWRITE_PROMPT)).toBeVisible();

      // 5. Click "Cancel" to reject overwrite
      await confirmModal.getByRole('button', { name: 'Cancel' }).click();

      // 6. Verify the original file still exists in the file table
      await modal.verifyFileVisible(fileName);

      // Close modal
      await modal.close();
    });

    test('User keeps a deselected file and still uploads the rest of the pick', async ({
      page,
    }) => {
      const duplicateName = path.basename(testFilePath);
      const freshName = path.basename(freshFilePath);

      // 1. Open the shared VFolder
      const modal = await openFolderExplorer(page, testFolderName);
      await modal.verifyFileVisible(duplicateName);

      // 2. Pick the colliding file together with one whose name is free
      const confirmModal = await uploadFiles(page, modal, [
        testFilePath,
        freshFilePath,
      ]);
      await expect(confirmModal).toBeVisible();

      // 3. Only the collision is listed; the free one is reported as a count
      const duplicateRow = confirmModal
        .getByRole('row')
        .filter({ hasText: duplicateName });
      await expect(duplicateRow).toBeVisible();
      await expect(
        confirmModal.getByRole('row').filter({ hasText: freshName }),
      ).toHaveCount(0);
      await expect(
        confirmModal.getByText('1 other item(s) will be uploaded as well.'),
      ).toBeVisible();

      // 4. Deselect the collision, so only the free file should be uploaded
      await duplicateRow.getByRole('checkbox').uncheck();
      await confirmModal.getByRole('button', { name: 'Upload' }).click();

      // 5. Both files are in the folder: the new one arrived, the deselected
      //    one was left as it was
      await modal.verifyFileVisible(freshName);
      await modal.verifyFileVisible(duplicateName);

      // Close modal
      await modal.close();
    });
  },
);
