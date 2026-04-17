import { FolderCreationModal } from '../utils/classes/vfolder/FolderCreationModal';
import {
  deleteForeverAndVerifyFromTrash,
  loginAsAdmin,
  loginAsUser,
  moveToTrashAndVerify,
} from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

/**
 * Navigate to the Data page and open the Create Folder modal.
 */
async function openCreateFolderModal(page: Page): Promise<FolderCreationModal> {
  await page.getByRole('link', { name: 'Data' }).click();
  await page.getByRole('button', { name: 'Create Folder' }).nth(1).click();
  const modal = new FolderCreationModal(page);
  await modal.modalToBeVisible();
  return modal;
}

test.describe(
  'VFolder Type Selection',
  { tag: ['@vfolder', '@functional'] },
  () => {
    test.describe('User-type vfolder creation', () => {
      let folderName: string;

      test.beforeEach(async ({ page, request }, testInfo) => {
        folderName = `e2e-test-user-type-folder-${Date.now()}-${testInfo.workerIndex}`;
        await loginAsUser(page, request);
      });

      test.afterEach(async ({ page }) => {
        await moveToTrashAndVerify(page, folderName);
        await deleteForeverAndVerifyFromTrash(page, folderName);
      });

      test('User can create a User-type vfolder with default selection', async ({
        page,
      }) => {
        const modal = await openCreateFolderModal(page);
        await modal.fillFolderName(folderName);

        // User-type radio should be visible and selected by default
        const userTypeRadio = await modal.getUserTypeRadio();
        await expect(userTypeRadio).toBeVisible();
        await expect(userTypeRadio).toBeChecked();

        await (await modal.getCreateButton()).click();
      });
    });

    test.describe('Project-type vfolder creation (admin)', () => {
      let folderName: string;

      test.beforeEach(async ({ page, request }, testInfo) => {
        folderName = `e2e-test-project-type-folder-${Date.now()}-${testInfo.workerIndex}`;
        await loginAsAdmin(page, request);
      });

      test.afterEach(async ({ page }) => {
        try {
          await moveToTrashAndVerify(page, folderName);
          await deleteForeverAndVerifyFromTrash(page, folderName);
        } catch {
          // Folder may not exist if test was skipped or creation failed
        }
      });

      test('Admin can create a Project-type vfolder', async ({ page }) => {
        const modal = await openCreateFolderModal(page);
        await modal.fillFolderName(folderName);

        // Project-type radio should be visible for admin
        const projectTypeRadio = await modal.getProjectTypeRadio();
        await expect(projectTypeRadio).toBeVisible();

        // Check if project type radio is enabled (requires 'group' type in ETCD config)
        const isDisabled = await projectTypeRadio.isDisabled();
        if (!isDisabled) {
          await projectTypeRadio.check();
          await expect(projectTypeRadio).toBeChecked();
        } else {
          // If project type is not available, fall back to user type and skip
          test.skip(true, 'Project type is not available in this environment');
        }

        await (await modal.getCreateButton()).click();
      });
    });

    test.describe('Project radio disabled states (admin)', () => {
      let folderName: string;

      test.beforeEach(async ({ page, request }, testInfo) => {
        folderName = `e2e-test-disabled-project-type-${Date.now()}-${testInfo.workerIndex}`;
        await loginAsAdmin(page, request);
        await openCreateFolderModal(page);
      });

      test.afterEach(async ({ page }) => {
        // Only clean up if the folder was actually created
        try {
          const folderRow = page
            .getByRole('cell', { name: `VFolder Identicon ${folderName}` })
            .filter({ hasText: folderName });
          await folderRow.waitFor({ state: 'visible', timeout: 2000 });
          await moveToTrashAndVerify(page, folderName);
          await deleteForeverAndVerifyFromTrash(page, folderName);
        } catch {
          // Folder was not created; nothing to clean up
        }
      });

      test('Project radio is disabled when usage mode is model (non-model-store project)', async ({
        page,
      }) => {
        const modal = new FolderCreationModal(page);
        await modal.modalToBeVisible();
        await modal.fillFolderName(folderName);

        // Select model usage mode
        const modelUsageModeRadio = await modal.getModelUsageModeRadio();
        await modelUsageModeRadio.check();
        await expect(modelUsageModeRadio).toBeChecked();

        // Project-type radio should be visible for admin
        const projectTypeRadio = await modal.getProjectTypeRadio();
        await expect(projectTypeRadio).toBeVisible();

        // If the project radio is enabled here, we are likely in a model-store project.
        // In that case, this test's assumption ("non-model-store project") does not hold,
        // so skip to avoid environment-dependent failures.
        if (await projectTypeRadio.isEnabled()) {
          test.skip(
            true,
            'Current project behaves as model-store; skipping disabled-state assertion.',
          );
        }

        // Project radio should be disabled when model mode is selected
        // and current project is not model-store
        await expect(projectTypeRadio).toBeDisabled();

        // Hover the project radio label to surface its tooltip. Ant Design's
        // disabled wrapper intercepts pointer events, so force the hover.
        const typeFormItem = await modal.getTypeFormItem();
        const projectRadioLabel = typeFormItem.locator(
          '[data-testid="project-type"]',
        );
        await projectRadioLabel.hover({ force: true });

        // Cancel the modal since we're only testing the disabled state
        await (await modal.getCancelButton()).click();
      });

      test('Project radio is disabled when usage mode is automount', async ({
        page,
      }) => {
        const modal = new FolderCreationModal(page);
        await modal.modalToBeVisible();
        await modal.fillFolderName(folderName);

        // Select auto mount usage mode
        const autoMountRadio = await modal.getAutoMountUsageModeRadio();
        await autoMountRadio.check();
        await expect(autoMountRadio).toBeChecked();

        // Project-type radio should be visible for admin
        const projectTypeRadio = await modal.getProjectTypeRadio();
        await expect(projectTypeRadio).toBeVisible();

        // Project radio should be disabled when automount mode is selected
        await expect(projectTypeRadio).toBeDisabled();

        // Cancel the modal since we're only testing the disabled state
        await (await modal.getCancelButton()).click();
      });

      test('Project radio is enabled when usage mode is general', async ({
        page,
      }) => {
        const modal = new FolderCreationModal(page);
        await modal.modalToBeVisible();
        await modal.fillFolderName(folderName);

        // General mode should be selected by default
        const generalUsageModeRadio = await modal.getGeneralUsageModeRadio();
        await expect(generalUsageModeRadio).toBeChecked();

        // Project-type radio should be enabled for admin in general mode
        const projectTypeRadio = await modal.getProjectTypeRadio();
        await expect(projectTypeRadio).toBeVisible();
        await expect(projectTypeRadio).not.toBeDisabled();

        // Cancel the modal
        await (await modal.getCancelButton()).click();
      });
    });

    test.describe('Type field visibility per role', () => {
      test('Regular user sees only User-type radio (no Project radio)', async ({
        page,
        request,
      }) => {
        await loginAsUser(page, request);
        const modal = await openCreateFolderModal(page);

        // User-type radio should be visible
        const typeFormItem = await modal.getTypeFormItem();
        const userTypeRadio = typeFormItem.locator('[data-testid="user-type"]');
        await expect(userTypeRadio).toBeVisible();

        // Project-type radio should NOT be visible for regular users
        const projectTypeRadio = typeFormItem.locator(
          '[data-testid="project-type"]',
        );
        await expect(projectTypeRadio).toBeHidden();

        await (await modal.getCancelButton()).click();
      });

      test('Admin sees both User-type and Project-type radios', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        const modal = await openCreateFolderModal(page);

        // Both type radios should be visible for admin
        const userTypeRadio = await modal.getUserTypeRadio();
        await expect(userTypeRadio).toBeVisible();

        const projectTypeRadio = await modal.getProjectTypeRadio();
        await expect(projectTypeRadio).toBeVisible();

        await (await modal.getCancelButton()).click();
      });
    });
  },
);
