// spec: Button-Based File Upload Test Plan
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

// Not serial: the shared vfolder is provisioned once in beforeAll (fresh
// context, mirroring vfolder-explorer-modal.spec.ts), and each test uploads
// its own distinct files into it, so the tests are order-independent and a
// failure in one does not cascade-skip the others. mode: 'default' keeps them
// sequential on one worker to limit backend load. See FR-3117.
test.describe(
  'Button-Based File Upload',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
    test.describe.configure({ mode: 'default', timeout: 90_000 });
    const testFolderName = 'e2e-test-upload-' + Date.now();
    let tmpDir: string;
    let testFile1Path: string;
    let testFile2Path: string;
    let testFile3Path: string;

    test.beforeAll(async ({ browser, request }) => {
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

      // Provision the shared vfolder once, in a fresh context, so neither test
      // owns creation as an asserted step and the suite no longer needs to be
      // serial. try/finally guarantees the context is closed even if login or
      // folder creation throws, so a failed provisioning can't leak it.
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
        console.log(`Could not delete temporary directory ${tmpDir}`);
      }
    });

    test('User can upload a single file via Upload button', async ({
      page,
    }) => {
      // 1. Open the shared VFolder (provisioned in beforeAll) in FolderExplorerModal
      const modal = await openFolderExplorer(page, testFolderName);

      // 2. Verify file explorer loaded
      await modal.verifyFileExplorerLoaded();

      // 3. Click the "Upload" button
      const uploadButton = await modal.getUploadButton();
      await uploadButton.click();

      // 4. In the dropdown, click "Upload Files" button and handle file chooser
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.getByRole('button', { name: 'file-add Upload Files' }).click(),
      ]);

      // 5. Upload a single test file
      await fileChooser.setFiles([testFile1Path]);

      // 6. Verify the uploaded file appears in the file table
      const fileName = path.basename(testFile1Path);
      await modal.verifyFileVisible(fileName);

      // 7. Close modal
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
