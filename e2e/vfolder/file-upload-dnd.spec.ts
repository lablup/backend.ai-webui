// spec: e2e/vfolder/file-upload.plan.md
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

// Not serial: single test — no ordering dependency.
test.describe(
  'Drag-and-Drop File Upload',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
    test.describe.configure({ timeout: 90_000 });
    const testFolderName = 'e2e-test-dnd-upload-' + Date.now();
    let tmpDir: string;
    let testFilePath: string;
    let uploadDir: string; // Directory to upload (contains the test file)

    test.beforeAll(async () => {
      // Create temporary directory and test file
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-dnd-upload-'));

      // Keep the file in its own subdirectory so the temp dir cleans up as one.
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

      // 4. Drag a file onto the file explorer area.
      const fileName = path.basename(testFilePath);
      const fileContent = fs.readFileSync(testFilePath, 'utf8');

      // The drag overlay is driven by document-level listeners, so the
      // dragenter goes to the document exactly as the browser sends it.
      await page.evaluate(() => {
        const dt = new DataTransfer();
        document.dispatchEvent(
          new DragEvent('dragenter', { bubbles: true, dataTransfer: dt }),
        );
      });

      // 5. The dropzone covers the whole explorer overlay and carries the
      //    caption inside it (FR-3575). The regression this pins is a drop
      //    area that collapsed to a ~100px band at the top of a full-height
      //    overlay, so visibility alone would not catch it — the boxes have
      //    to match.
      const dropOverlay = page.getByTestId('folder-explorer-drop-overlay');
      const dragOverlay = dropOverlay.locator('.bai-file-explorer-dropzone');
      await expect(dragOverlay).toBeVisible({ timeout: 5000 });
      await expect(
        dragOverlay.getByText('Drag and drop files to this area to upload.'),
      ).toBeVisible();

      const overlayBox = await dropOverlay.boundingBox();
      const dropzoneBox = await dragOverlay.boundingBox();
      expect(overlayBox).not.toBeNull();
      expect(dropzoneBox).not.toBeNull();
      for (const side of ['x', 'y', 'width', 'height'] as const) {
        expect(
          Math.abs(dropzoneBox![side] - overlayBox![side]),
          `dropzone ${side} should match the overlay`,
        ).toBeLessThanOrEqual(1);
      }

      // 6. Move around inside the dropzone before releasing. The browser fires
      //    dragenter/dragleave pairs with no relatedTarget here, and the
      //    dropzone stops their propagation — the overlay must survive them or
      //    there is nothing left to drop onto (FR-3575).
      await dragOverlay.evaluate((zone) => {
        const child = zone.firstElementChild ?? zone;
        for (let i = 0; i < 3; i++) {
          const dt = new DataTransfer();
          child.dispatchEvent(
            new DragEvent('dragenter', { bubbles: true, dataTransfer: dt }),
          );
          zone.dispatchEvent(
            new DragEvent('dragleave', { bubbles: true, dataTransfer: dt }),
          );
          zone.dispatchEvent(
            new DragEvent('dragover', {
              bubbles: true,
              cancelable: true,
              dataTransfer: dt,
            }),
          );
        }
      });
      await expect(dragOverlay).toBeVisible();

      // 7. Release the file onto the dropzone — a real `drop` carrying the file,
      //    not `setInputFiles` on the hidden input, so the drop path is what is
      //    under test.
      await dragOverlay.evaluate(
        (zone, [name, content]) => {
          const dt = new DataTransfer();
          dt.items.add(new File([content], name, { type: 'text/plain' }));
          zone.dispatchEvent(
            new DragEvent('drop', {
              bubbles: true,
              cancelable: true,
              dataTransfer: dt,
            }),
          );
        },
        [fileName, fileContent],
      );

      // The drop must close the overlay by itself — no synthetic dragleave.
      await expect(dragOverlay).not.toBeVisible({ timeout: 10000 });

      // 8. Verify the uploaded file appears in the file table
      await modal.verifyFileVisible(fileName);

      // 9. Close modal
      await modal.close();
    });
  },
);
