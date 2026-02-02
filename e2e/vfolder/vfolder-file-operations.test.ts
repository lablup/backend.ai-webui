import { FolderExplorerModal } from '../utils/classes/vfolder/FolderExplorerModal';
import {
  createVFolderAndVerify,
  deleteForeverAndVerifyFromTrash,
  loginAsAdmin,
  moveToTrashAndVerify,
  navigateTo,
} from '../utils/test-util';
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe(
  'VFolder File Operations',
  { tag: ['@critical', '@vfolder'] },
  () => {
    let testFolderName: string;
    let tempFilePath: string;
    let folderExplorer: FolderExplorerModal;

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'data');

      // Create a test vFolder
      testFolderName = `test-vfolder-${Date.now()}`;
      await createVFolderAndVerify(page, testFolderName);

      // Create temp test file
      tempFilePath = path.join('/tmp', `test-file-${Date.now()}.txt`);
      fs.writeFileSync(tempFilePath, 'Test file content for E2E testing');

      folderExplorer = new FolderExplorerModal(page);
    });

    test.afterEach(async ({ page }) => {
      // Close any open modal first
      try {
        const closeButton = page.getByRole('button', { name: 'Close' });
        if (await closeButton.isVisible({ timeout: 1000 })) {
          await closeButton.click();
          await page.waitForTimeout(500);
        }
      } catch {
        // Modal might not be open
      }

      // Navigate back to data page if needed
      await navigateTo(page, 'data');

      // Cleanup: delete test vFolder
      if (testFolderName) {
        try {
          await moveToTrashAndVerify(page, testFolderName);
          await deleteForeverAndVerifyFromTrash(page, testFolderName);
        } catch {
          // Folder might already be deleted
        }
      }

      // Cleanup: delete temp file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    });

    // FIXME: File upload via TUS protocol is not compatible with Playwright's file chooser
    test('Upload single file to vFolder', async ({ page }) => {
      // Open vFolder explorer by clicking on folder name link
      await page.getByRole('link', { name: testFolderName }).first().click();

      await folderExplorer.waitForModalOpen();

      // Upload file
      await folderExplorer.uploadFile(tempFilePath);

      // Verify file exists
      const fileName = path.basename(tempFilePath);
      const fileExists = await folderExplorer.verifyFileExists(fileName);
      expect(fileExists).toBeTruthy();
    });

    test('Create folder inside vFolder', async ({ page }) => {
      // Open vFolder explorer by clicking on folder name link
      await page.getByRole('link', { name: testFolderName }).first().click();

      await folderExplorer.waitForModalOpen();

      // Create folder
      const newFolderName = 'test-subfolder';
      await folderExplorer.createFolder(newFolderName);

      // Verify folder exists
      const folderExists = await folderExplorer.verifyFileExists(newFolderName);
      expect(folderExists).toBeTruthy();
    });

    test('Create nested folder structure', async ({ page }) => {
      // Open vFolder explorer by clicking on folder name link
      await page.getByRole('link', { name: testFolderName }).first().click();

      await folderExplorer.waitForModalOpen();

      // Create nested folders
      await folderExplorer.createFolder('level1');
      await folderExplorer.openFolder('level1');
      await folderExplorer.createFolder('level2');

      // Verify level2 folder exists
      const folderExists = await folderExplorer.verifyFileExists('level2');
      expect(folderExists).toBeTruthy();
    });

    // FIXME: Requires file upload to work first
    test.fixme('Rename file in vFolder', async ({ page }) => {
      // Open vFolder explorer by clicking on folder name link
      await page.getByRole('link', { name: testFolderName }).first().click();

      await folderExplorer.waitForModalOpen();

      // Upload file first
      await folderExplorer.uploadFile(tempFilePath);
      const originalFileName = path.basename(tempFilePath);

      // Rename file
      const newFileName = `renamed-${Date.now()}.txt`;
      await folderExplorer.renameItem(originalFileName, newFileName);

      // Verify old name doesn't exist
      await folderExplorer.verifyFileNotExists(originalFileName);

      // Verify new name exists
      const fileExists = await folderExplorer.verifyFileExists(newFileName);
      expect(fileExists).toBeTruthy();
    });

    // FIXME: Inline editing with Ant Design Typography.Text editable needs investigation
    test.fixme('Rename folder in vFolder', async ({ page }) => {
      // Open vFolder explorer by clicking on folder name link
      await page.getByRole('link', { name: testFolderName }).first().click();

      await folderExplorer.waitForModalOpen();

      // Create folder first
      const originalFolderName = 'original-folder';
      await folderExplorer.createFolder(originalFolderName);

      // Rename folder
      const newFolderName = `renamed-folder-${Date.now()}`;
      await folderExplorer.renameItem(originalFolderName, newFolderName);

      // Verify old name doesn't exist
      await folderExplorer.verifyFileNotExists(originalFolderName);

      // Verify new name exists
      const folderExists = await folderExplorer.verifyFileExists(newFolderName);
      expect(folderExists).toBeTruthy();
    });

    // FIXME: Requires file upload to work first
    test.fixme('Delete file from vFolder', async ({ page }) => {
      // Open vFolder explorer by clicking on folder name link
      await page.getByRole('link', { name: testFolderName }).first().click();

      await folderExplorer.waitForModalOpen();

      // Upload file first
      await folderExplorer.uploadFile(tempFilePath);
      const fileName = path.basename(tempFilePath);

      // Verify file exists
      const fileExists = await folderExplorer.verifyFileExists(fileName);
      expect(fileExists).toBeTruthy();

      // Delete file
      await folderExplorer.deleteItem(fileName);

      // Verify file doesn't exist
      await folderExplorer.verifyFileNotExists(fileName);
    });

    test('Delete folder from vFolder', async ({ page }) => {
      // Open vFolder explorer by clicking on folder name link
      await page.getByRole('link', { name: testFolderName }).first().click();

      await folderExplorer.waitForModalOpen();

      // Create folder first
      const folderName = 'folder-to-delete';
      await folderExplorer.createFolder(folderName);

      // Verify folder exists
      const folderExists = await folderExplorer.verifyFileExists(folderName);
      expect(folderExists).toBeTruthy();

      // Delete folder
      await folderExplorer.deleteItem(folderName);

      // Verify folder doesn't exist
      await folderExplorer.verifyFileNotExists(folderName);
    });

    // FIXME: File upload via TUS protocol is not compatible with Playwright's file chooser
    test.fixme('Upload multiple files', async ({ page }) => {
      // Create multiple temp files
      const tempFiles: string[] = [];
      for (let i = 0; i < 3; i++) {
        const filePath = path.join('/tmp', `test-file-${Date.now()}-${i}.txt`);
        fs.writeFileSync(filePath, `Test content ${i}`);
        tempFiles.push(filePath);
      }

      try {
        // Open vFolder explorer by clicking on folder name link
        await page.getByRole('link', { name: testFolderName }).first().click();

        await folderExplorer.waitForModalOpen();

        // Upload multiple files
        await folderExplorer.uploadMultipleFiles(tempFiles);

        // Verify all files exist
        for (const filePath of tempFiles) {
          const fileName = path.basename(filePath);
          const fileExists = await folderExplorer.verifyFileExists(fileName);
          expect(fileExists).toBeTruthy();
        }
      } finally {
        // Cleanup temp files
        for (const filePath of tempFiles) {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
    });

    // FIXME: Multi-select checkbox interaction needs investigation
    test.fixme('Delete multiple items', async ({ page }) => {
      // Open vFolder explorer by clicking on folder name link
      await page.getByRole('link', { name: testFolderName }).first().click();

      await folderExplorer.waitForModalOpen();

      // Create multiple items
      const items = ['folder1', 'folder2'];
      for (const item of items) {
        await folderExplorer.createFolder(item);
      }

      // Verify items exist
      for (const item of items) {
        const exists = await folderExplorer.verifyFileExists(item);
        expect(exists).toBeTruthy();
      }

      // Delete multiple items
      await folderExplorer.deleteMultipleItems(items);

      // Verify items don't exist
      for (const item of items) {
        await folderExplorer.verifyFileNotExists(item);
      }
    });

    test('Navigate folder hierarchy', async ({ page }) => {
      // Open vFolder explorer by clicking on folder name link
      await page.getByRole('link', { name: testFolderName }).first().click();

      await folderExplorer.waitForModalOpen();

      // Create nested structure
      await folderExplorer.createFolder('parent');
      await folderExplorer.openFolder('parent');
      await folderExplorer.createFolder('child');

      // Verify child folder exists
      const childExists = await folderExplorer.verifyFileExists('child');
      expect(childExists).toBeTruthy();

      // Navigate back to parent
      await folderExplorer.navigateToParent();

      // Verify parent folder exists
      const parentExists = await folderExplorer.verifyFileExists('parent');
      expect(parentExists).toBeTruthy();
    });

    test('Get list of items in folder', async ({ page }) => {
      // Open vFolder explorer by clicking on folder name link
      await page.getByRole('link', { name: testFolderName }).first().click();

      await folderExplorer.waitForModalOpen();

      // Create some items
      const itemNames = ['item1', 'item2', 'item3'];
      for (const itemName of itemNames) {
        await folderExplorer.createFolder(itemName);
      }

      // Get list of items
      const visibleItems = await folderExplorer.getVisibleItems();

      // Verify all created items are in the list
      for (const itemName of itemNames) {
        expect(visibleItems).toContain(itemName);
      }
    });
  },
);
