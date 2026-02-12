// spec: Button-Based File Upload Test Plan
import { FolderExplorerModal } from '../utils/classes/vfolder/FolderExplorerModal';
import {
  loginAsUser,
  navigateTo,
  createVFolderAndVerify,
  moveToTrashAndVerify,
  deleteForeverAndVerifyFromTrash,
} from '../utils/test-util';
import { test, Page } from '@playwright/test';
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
  'Button-Based File Upload',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
    const testFolderName = 'e2e-test-upload-' + Date.now();
    let tmpDir: string;
    let testFile1Path: string;
    let testFile2Path: string;
    let testFile3Path: string;

    test.beforeAll(async () => {
      // Create temporary directory and test files
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-upload-'));

      testFile1Path = path.join(tmpDir, 'test-upload-file-1.txt');
      fs.writeFileSync(
        testFile1Path,
        'This is test file 1 for e2e upload testing',
      );

      testFile2Path = path.join(tmpDir, 'test-upload-file-2.txt');
      fs.writeFileSync(
        testFile2Path,
        'This is test file 2 for e2e upload testing',
      );

      testFile3Path = path.join(tmpDir, 'test-upload-file-3.txt');
      fs.writeFileSync(
        testFile3Path,
        'This is test file 3 for e2e upload testing',
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
        console.log(`Could not delete ${testFolderName}, it may not exist`);
      }

      await context.close();

      // Cleanup: delete temporary test files
      try {
        if (tmpDir && fs.existsSync(tmpDir)) {
          fs.rmSync(tmpDir, { recursive: true, force: true });
        }
      } catch {
        console.log(`Could not delete temporary directory ${tmpDir}`);
      }
    });

    test('User can upload a single file via Upload button', async ({
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
      const modal = await openFolderExplorer(page, testFolderName);

      // 3. Verify file explorer loaded
      await modal.verifyFileExplorerLoaded();

      // 4. Click the "Upload" button
      const uploadButton = await modal.getUploadButton();
      await uploadButton.click();

      // 5. In the dropdown, click "Upload Files" button and handle file chooser
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.getByRole('button', { name: 'file-add Upload Files' }).click(),
      ]);

      // 6. Upload a single test file
      await fileChooser.setFiles([testFile1Path]);

      // 7. Verify the uploaded file appears in the file table
      const fileName = path.basename(testFile1Path);
      await modal.verifyFileVisible(fileName);

      // 8. Close modal
      await modal.close();
    });

    test('User can upload multiple files via Upload button', async ({
      page,
    }) => {
      // 1. Open the VFolder in FolderExplorerModal
      const modal = await openFolderExplorer(page, testFolderName);

      // 2. Verify file explorer loaded
      await modal.verifyFileExplorerLoaded();

      // 3. Click the "Upload" button
      const uploadButton = await modal.getUploadButton();
      await uploadButton.click();

      // 4. In the dropdown, click "Upload Files" and handle file chooser
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.getByRole('button', { name: 'file-add Upload Files' }).click(),
      ]);

      // 5. Upload multiple test files
      await fileChooser.setFiles([testFile2Path, testFile3Path]);

      // 6. Verify all uploaded files appear in the file table
      await modal.verifyFileVisible(path.basename(testFile2Path));
      await modal.verifyFileVisible(path.basename(testFile3Path));

      // 7. Close modal
      await modal.close();
    });
  },
);
