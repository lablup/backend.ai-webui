// spec: Suite 5: Upload to Subdirectory
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
  'Upload to Subdirectory',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
    const testFolderName = 'e2e-test-subdir-upload-' + Date.now();
    const subfolderName = 'test-subfolder';
    let tmpDir: string;
    let testFilePath: string;

    test.beforeAll(async () => {
      // Create temporary directory and test file
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-subdir-'));

      testFilePath = path.join(tmpDir, 'test-file-in-subfolder.txt');
      fs.writeFileSync(
        testFilePath,
        'This is a test file uploaded to a subdirectory',
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

    test('User can upload a file to a subdirectory', async ({ page }) => {
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

      // 4. Create a new folder using the "Create" button
      const createButton = await modal.getCreateFolderButton();
      await createButton.click();

      // Wait for create folder dialog to appear (nested dialog)
      const createFolderDialog = page.getByRole('dialog').last();
      await expect(createFolderDialog).toBeVisible();

      // Enter folder name in the input field
      const folderNameInput = createFolderDialog.getByRole('textbox');
      await folderNameInput.fill(subfolderName);

      // Click Create button to create the folder
      await createFolderDialog.getByRole('button', { name: 'Create' }).click();

      // Verify the subfolder appears in the file table (this implicitly waits for folder creation)
      await modal.verifyFileVisible(subfolderName);

      // 5. Navigate into the newly created folder (click folder name)
      await page.getByRole('cell', { name: subfolderName }).first().click();

      // 6. Verify breadcrumb shows the subdirectory path (waits for navigation)
      await expect(
        page.locator('.ant-breadcrumb').getByText(subfolderName),
      ).toBeVisible();

      // 7. Upload a file via Upload button
      const uploadButton = await modal.getUploadButton();
      await uploadButton.click();

      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.getByRole('button', { name: 'file-add Upload Files' }).click(),
      ]);

      await fileChooser.setFiles([testFilePath]);

      // 8. Verify the file appears in the subdirectory's file table
      const fileName = path.basename(testFilePath);
      await modal.verifyFileVisible(fileName);

      // 9. Navigate back to root (click home in breadcrumb)
      // The breadcrumb has a home icon at the beginning
      const breadcrumb = page.locator('.ant-breadcrumb');
      await breadcrumb.locator('a').first().click();

      // 10. Verify navigation back to root by checking subfolder is visible again
      await modal.verifyFileVisible(subfolderName);

      // The uploaded file should NOT be visible at the root level
      await expect(
        page.getByRole('cell', { name: fileName, exact: true }),
      ).toHaveCount(0);

      // Close modal
      await modal.close();
    });
  },
);
