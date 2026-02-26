// spec: Upload Permission Controls Test Plan
import { FolderExplorerModal } from '../utils/classes/vfolder/FolderExplorerModal';
import {
  loginAsUser,
  navigateTo,
  createVFolderAndVerify,
  moveToTrashAndVerify,
  deleteForeverAndVerifyFromTrash,
  isLocalEnvironment,
  webServerEndpoint,
} from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

// Check if backend server endpoint is also local
const isBackendLocal =
  webServerEndpoint.includes('127.0.0.1') ||
  webServerEndpoint.includes('localhost');

const openFolderExplorer = async (
  page: Page,
  folderName: string,
): Promise<FolderExplorerModal> => {
  await navigateTo(page, 'data');
  await page.waitForLoadState('networkidle');
  const folderLink = page.getByRole('link', { name: folderName }).first();
  await expect(folderLink).toBeVisible({ timeout: 15000 });
  await folderLink.click();
  const modal = new FolderExplorerModal(page);
  await modal.waitForOpen();
  await modal.verifyFileExplorerLoaded();
  return modal;
};

test.describe.serial(
  'Upload Permission Controls',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
    // Skip tests on external deployments where VFolder permission control may not work
    test.skip(
      !isLocalEnvironment || !isBackendLocal,
      'Requires local environment with local backend server',
    );

    const roFolderName = 'e2e-test-perm-ro-' + Date.now();
    const rwFolderName = 'e2e-test-perm-rw-' + Date.now();

    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
      await navigateTo(page, 'data');
    });

    test.afterAll(async ({ browser, request }) => {
      // Cleanup: delete both VFolders
      const context = await browser.newContext();
      const page = await context.newPage();

      await loginAsUser(page, request);

      // Clean up read-only folder
      try {
        await moveToTrashAndVerify(page, roFolderName);
        await deleteForeverAndVerifyFromTrash(page, roFolderName);
      } catch {
        console.log(`Could not delete ${roFolderName}, it may not exist`);
      }

      // Clean up read-write folder
      try {
        await moveToTrashAndVerify(page, rwFolderName);
        await deleteForeverAndVerifyFromTrash(page, rwFolderName);
      } catch {
        console.log(`Could not delete ${rwFolderName}, it may not exist`);
      }

      await context.close();
    });

    test('User cannot upload files to read-only VFolder', async ({ page }) => {
      // 1. Create a VFolder with Read Only permissions
      await createVFolderAndVerify(page, roFolderName, 'general', 'user', 'ro');

      // 2. Open the VFolder in FolderExplorerModal
      const modal = await openFolderExplorer(page, roFolderName);

      // 3. Verify file explorer loaded (Name column header visible)
      await modal.verifyFileExplorerLoaded();

      // 4. Verify the Upload button is disabled (the button should be present but disabled)
      const uploadButton = await modal.getUploadButton();
      await expect(uploadButton).toBeDisabled();

      // 5. Verify the Create folder button is disabled
      const createButton = await modal.getCreateFolderButton();
      await expect(createButton).toBeDisabled();

      // 6. Close modal
      await modal.close();
    });

    test('User can upload files to read-write VFolder', async ({ page }) => {
      // 1. Create a VFolder with Read & Write permissions
      await createVFolderAndVerify(page, rwFolderName, 'general', 'user', 'rw');

      // 2. Open the VFolder in FolderExplorerModal
      const modal = await openFolderExplorer(page, rwFolderName);

      // 3. Verify file explorer loaded
      await modal.verifyFileExplorerLoaded();

      // 4. Verify the Upload button is enabled
      const uploadButton = await modal.getUploadButton();
      await expect(uploadButton).toBeEnabled();

      // 5. Verify the Create folder button is enabled
      const createButton = await modal.getCreateFolderButton();
      await expect(createButton).toBeEnabled();

      // 6. Close modal
      await modal.close();
    });
  },
);
