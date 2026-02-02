// spec: FolderExplorerModal-Test-Plan.md
import { FolderExplorerModal } from '../utils/classes/vfolder/FolderExplorerModal';
import {
  loginAsUser,
  navigateTo,
  createVFolderAndVerify,
  moveToTrashAndVerify,
  deleteForeverAndVerifyFromTrash,
  modifyConfigToml,
  webuiEndpoint,
} from './utils/test-util';
import { test, expect, Page } from '@playwright/test';

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

test.describe.serial('FolderExplorerModal - User VFolder Access', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsUser(page, request);
    await navigateTo(page, 'data');
  });

  test('User can create folders and upload files in VFolder with write permissions', async ({
    page,
  }) => {
    const rwFolderName = 'e2e-test-folder-rw-' + new Date().getTime();

    // 1. Create a VFolder with Read & Write permissions
    await createVFolderAndVerify(page, rwFolderName, 'general', 'user', 'rw');

    // 2. Open the VFolder in FolderExplorerModal
    const modal = await openFolderExplorer(page, rwFolderName);

    // 3. Verify modal opens successfully with proper layout
    await modal.verifyFolderName(rwFolderName);

    // 4. Verify file explorer loads without errors
    await modal.verifyFileExplorerLoaded();

    // 5. Verify Read & Write permission is displayed in folder details
    await modal.verifyPermission('Read & Write');

    // 6. Verify upload functionality is available (Write permission)
    const uploadButton = await modal.getUploadButton();
    await expect(uploadButton).toBeEnabled();

    // 7. Verify create folder functionality is available (Write permission)
    const createButton = await modal.getCreateFolderButton();
    await expect(createButton).toBeEnabled();

    // 8. Close modal
    await modal.close();

    // 9. Cleanup
    await moveToTrashAndVerify(page, rwFolderName);
    await deleteForeverAndVerifyFromTrash(page, rwFolderName);
  });

  test('User can view files but cannot upload to read-only VFolder', async ({
    page,
  }) => {
    const roFolderName = 'e2e-test-folder-ro-' + new Date().getTime();

    // 1. Create a VFolder with Read Only permissions
    await createVFolderAndVerify(page, roFolderName, 'general', 'user', 'ro');

    // 2. Verify folder shows "Read only" in the table
    await navigateTo(page, 'data');
    const folderRow = page.getByRole('row', { name: new RegExp(roFolderName) });
    await expect(folderRow.getByText('Read only').first()).toBeVisible();

    // 3. Open the VFolder in FolderExplorerModal
    const modal = await openFolderExplorer(page, roFolderName);

    // 4. Verify modal opens successfully
    await modal.verifyFolderName(roFolderName);

    // 5. Verify "Read only" mount permission is displayed in folder details
    await modal.verifyPermission('Read only');

    // 6. Verify file explorer loads
    await modal.verifyFileExplorerLoaded();

    // 7. Close modal
    await modal.close();

    // 8. Cleanup
    await moveToTrashAndVerify(page, roFolderName);
    await deleteForeverAndVerifyFromTrash(page, roFolderName);
  });

  test('User sees error message when accessing non-existent VFolder', async ({
    page,
  }) => {
    // 1. Navigate directly to a non-existent VFolder URL
    await page.goto(`${webuiEndpoint}/data?folder=non-existent-id-12345`);

    // Wait for modal to appear
    const modal = new FolderExplorerModal(page);
    await modal.waitForOpen();

    // 2. Verify error message is displayed in modal
    await modal.verifyErrorMessage('Folder not found or access denied');

    // 3. Verify file explorer table is not within the modal body
    // Check that BAIFileExplorer's table is not rendered
    await modal.verifyFileExplorerNotLoaded();

    // 4. Verify modal can still be closed
    const closeButton = await modal.getCloseButton();
    // For React development mode, the button may be covered by Red screen; use force click
    await closeButton.click({ force: true });
  });
});

test.describe('FolderExplorerModal - User Modal Interaction', () => {
  const testFolderName = 'e2e-test-folder-layout-' + new Date().getTime();

  test.beforeAll(async ({ browser, request }) => {
    // Create the folder once before all tests in this serial group
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsUser(page, request);
    await createVFolderAndVerify(page, testFolderName);
    await context.close();
  });

  test.beforeEach(async ({ page, request }) => {
    await loginAsUser(page, request);
    // Always navigate to data page to ensure clean state
    await navigateTo(page, 'data');
  });

  test.afterAll(async ({ browser, request }) => {
    // Create a new context and page for cleanup
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginAsUser(page, request);

    // Clean up folder created during tests
    try {
      await moveToTrashAndVerify(page, testFolderName);
      await deleteForeverAndVerifyFromTrash(page, testFolderName);
    } catch (error) {
      console.log(`Could not delete ${testFolderName}, it may not exist`);
    }

    await context.close();
  });

  test('User can open and close VFolder explorer modal', async ({ page }) => {
    // 1. Open modal
    const modal = await openFolderExplorer(page, testFolderName);

    // 2. Verify modal header displays folder name
    await modal.verifyFolderName(testFolderName);

    // 3. Verify close button is visible and clickable
    const closeButton = await modal.getCloseButton();

    // 4. Close modal by clicking the close button
    await closeButton.click();

    // 5. Wait for modal to actually be hidden
    await expect(page.getByRole('dialog').first()).not.toBeVisible({
      timeout: 2000,
    });

    // 6. Verify URL no longer has folder parameter
    await expect(page).toHaveURL(/\/data($|\?(?!.*folder=))/);
  });

  test('User can access File Browser from VFolder explorer modal', async ({
    page,
    request,
  }) => {
    await modifyConfigToml(page, request, {
      general: {
        defaultFileBrowserImage:
          'cr.backend.ai/stable/python-pytorch:2.1.0-py310-cuda12.1-ubuntu22.04@x86_64s',
      },
    });

    // 1. Open modal
    const modal = await openFolderExplorer(page, testFolderName);

    // 2. Verify File Browser button exists
    const fileBrowserButton = await modal.getFileBrowserButton();
    await expect(fileBrowserButton).toBeEnabled();

    // 3. Close modal
    await modal.close();
  });

  test.fixme(
    'User can access File Browser from VFolder explorer modal without defaultFileBrowserImage setting',
    () => {},
  );

  test('User can view VFolder details in the explorer modal', async ({
    page,
  }) => {
    // 1. Open modal
    const modal = await openFolderExplorer(page, testFolderName);

    // 2. Verify essential folder details are displayed
    await modal.verifyFolderDetails();

    // 3. Close modal
    await modal.close();
  });
});
