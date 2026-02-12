// spec: e2e/vfolder/file-upload.plan.md
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
  'Drag-and-Drop File Upload',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
    const testFolderName = 'e2e-test-dnd-upload-' + Date.now();
    let tmpDir: string;
    let testFilePath: string;
    let uploadDir: string; // Directory to upload (contains the test file)

    test.beforeAll(async () => {
      // Create temporary directory and test file
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-dnd-upload-'));

      // Create a subdirectory to simulate folder upload
      uploadDir = path.join(tmpDir, 'upload-folder');
      fs.mkdirSync(uploadDir);

      testFilePath = path.join(uploadDir, 'test-dnd-file.txt');
      fs.writeFileSync(
        testFilePath,
        'This is a test file for drag and drop upload testing',
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

    test('User can upload a file via drag and drop', async ({ page }) => {
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

      // 4. Simulate drag-and-drop of a file onto the file explorer area
      const fileName = path.basename(testFilePath);

      // Get the modal body (drop container)
      const modalBody = page.locator('.ant-modal-body').first();

      // Trigger dragenter to show the overlay by dispatching a real dragenter event
      await modalBody.evaluate((element) => {
        const dragEvent = new DragEvent('dragenter', {
          bubbles: true,
          cancelable: true,
          dataTransfer: new DataTransfer(),
        });
        element.dispatchEvent(dragEvent);
      });

      // 5. Verify the drag-and-drop overlay appears with text "Drag and drop"
      const dragOverlay = page.locator('.ant-upload-drag');
      await expect(dragOverlay).toBeVisible({ timeout: 5000 });

      // Verify the overlay text
      await expect(
        page.getByText('Drag and drop files to this area to upload.'),
      ).toBeVisible();

      // 6. Upload files by setting them on the hidden input in the Dragger component
      // Even though the input has directory/webkitdirectory attributes, Playwright can
      // set individual file paths with their relative paths to simulate directory structure
      const fileInput = dragOverlay.locator('input[type="file"]');

      // Set the file with its relative path (simulating it being inside a folder)
      // This works because Ant Design's Upload component processes the files based on
      // their webkitRelativePath property
      await fileInput.evaluate((input: HTMLInputElement) => {
        // Remove the directory attributes temporarily to allow file selection
        input.removeAttribute('directory');
        input.removeAttribute('webkitdirectory');
      });

      await fileInput.setInputFiles(testFilePath);

      // Dismiss the drag overlay by dispatching a dragleave event to the document
      // This simulates the user completing the drag-and-drop operation
      await page.evaluate(() => {
        const dragLeaveEvent = new DragEvent('dragleave', {
          bubbles: true,
          cancelable: true,
        });
        document.dispatchEvent(dragLeaveEvent);
      });

      // Wait for drag overlay to disappear after upload
      await expect(dragOverlay).not.toBeVisible({ timeout: 10000 });

      // 7. Verify the uploaded file appears in the file table
      await modal.verifyFileVisible(fileName);

      // 8. Close modal
      await modal.close();
    });
  },
);
