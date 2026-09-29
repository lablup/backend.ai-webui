import { FolderCreationModal } from '../utils/classes/vfolder/FolderCreationModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import {
  getClientProperty,
  skipUnlessAllowedVFolderType,
} from '../utils/feature-gate-util';
import { loginAsAdmin, loginAsUser, navigateTo } from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

/**
 * FR-3441 removed the in-form Type (User/Project) radio: folder ownership is
 * derived from the page context instead. The regular Data page creates user
 * folders; the Project Admin Data page (/project-data, folderType="project")
 * creates project folders. These tests assert the page-derived contract and
 * the usage-mode narrowing that came with it.
 */

/**
 * Navigate to the regular Data page and open the Create Folder modal.
 * Folders created here are user-owned.
 */
async function openCreateFolderModal(page: Page): Promise<FolderCreationModal> {
  await page.getByRole('link', { name: 'Data' }).click();
  await page.getByRole('button', { name: 'Create Folder' }).first().click();
  const modal = new FolderCreationModal(page);
  await modal.modalToBeVisible();
  return modal;
}

/**
 * Navigate to the Project Admin Data page (/project-data) and open the Create
 * Folder modal. This page passes folderType="project", so folders created here
 * are project-owned.
 */
async function openCreateFolderModalAsAdmin(
  page: Page,
): Promise<FolderCreationModal> {
  await navigateTo(page, 'project-data');
  await page.getByRole('button', { name: 'Create Folder' }).first().click();
  const modal = new FolderCreationModal(page);
  await modal.modalToBeVisible();
  return modal;
}

test.describe(
  'VFolder ownership by page context',
  { tag: ['@vfolder', '@functional'] },
  () => {
    test.describe('User folder creation (Data page)', () => {
      let folderName: string;

      test.beforeEach(async ({ page, request }, testInfo) => {
        folderName = `e2e-test-user-type-folder-${Date.now()}-${testInfo.workerIndex}`;
        await loginAsUser(page, request);
      });

      test.afterEach(async ({ page }) => {
        await cleanupVFolderSafely(page, folderName);
      });

      test('User creates a user folder without any Type selection', async ({
        page,
      }) => {
        const modal = await openCreateFolderModal(page);

        // No Type row: ownership is derived from the page (user folder).
        await modal.expectTypeFormItemHidden();

        await modal.fillFolderName(folderName);
        await (await modal.getCreateButton()).click();
      });
    });

    test.describe('Project folder creation (Project Admin Data page)', () => {
      let folderName: string;

      test.beforeEach(async ({ page, request }, testInfo) => {
        folderName = `e2e-test-project-type-folder-${Date.now()}-${testInfo.workerIndex}`;
        await loginAsAdmin(page, request);
      });

      test.afterEach(async ({ page }) => {
        // Project-type folders are created on /project-data but can only be
        // DELETED from the admin data page (/admin-data); /project-data
        // (VFolderNodesV2) does not expose the trash/delete actions.
        await cleanupVFolderSafely(page, folderName, 'admin-data');
      });

      test(
        'Admin creates a Project folder without any Type selection',
        { tag: ['@requires-vfolder-type-group'] },
        async ({ page }) => {
          // Declarative environment gate (FR-3114): project folder creation
          // still requires the 'group' vfolder type in the cluster's etcd
          // `volumes/_types` config — the server rejects it otherwise.
          await skipUnlessAllowedVFolderType(
            page,
            'group',
            "Project folder creation requires the 'group' vfolder type in the cluster's etcd `volumes/_types` config (@requires-vfolder-type-group)",
          );

          const modal = await openCreateFolderModalAsAdmin(page);

          // No Type row: ownership is derived from the page (project folder).
          await modal.expectTypeFormItemHidden();

          await modal.fillFolderName(folderName);
          await (await modal.getCreateButton()).click();
        },
      );
    });

    test.describe('Usage-mode narrowing on the Project Admin Data page', () => {
      let folderName: string;

      test.beforeEach(async ({ page, request }, testInfo) => {
        folderName = `e2e-test-usage-narrowing-${Date.now()}-${testInfo.workerIndex}`;
        await loginAsAdmin(page, request);
        await openCreateFolderModalAsAdmin(page);
      });

      test.afterEach(async ({ page }) => {
        // Only clean up if the folder was actually created
        try {
          const folderRow = page
            .getByRole('cell', { name: `VFolder Identicon ${folderName}` })
            .filter({ hasText: folderName });
          await folderRow.waitFor({ state: 'visible', timeout: 2000 });
          await cleanupVFolderSafely(page, folderName);
        } catch {
          // Folder was not created; nothing to clean up
        }
      });

      test('Auto Mount is not offered for project folders', async ({
        page,
      }) => {
        const modal = new FolderCreationModal(page);
        await modal.modalToBeVisible();

        // FR-3441: unselectable options are hidden, not disabled — project
        // folders cannot be automount folders, so the radio is absent.
        await expect(await modal.getAutoMountUsageModeRadio()).toBeHidden();

        await (await modal.getCancelButton()).click();
      });

      test('Models is rejected outside the model-store project', async ({
        page,
      }) => {
        // Declarative environment gate (FR-3114): this assertion only holds
        // when the admin's active project is NOT the model-store project.
        const currentProjectName = await getClientProperty(
          page,
          'current_group',
        );
        test.skip(
          currentProjectName === 'model-store',
          "Rejection assertion assumes a non-model-store project; the admin's active project is the model-store project.",
        );

        const modal = new FolderCreationModal(page);
        await modal.modalToBeVisible();
        await modal.fillFolderName(folderName);

        const modelUsageModeRadio = await modal.getModelUsageModeRadio();
        await modelUsageModeRadio.check();
        await expect(modelUsageModeRadio).toBeChecked();

        // The model-store gate moved from the removed Type field onto
        // Usage Mode (FR-3441); en message: data.folders
        // .CreateModelFolderOnlyInExclusiveProject.
        await expect(await modal.getUsageModeFormItem()).toContainText(
          'can only be created in model-store',
        );

        // Read & Write stays visible but disabled for model project folders
        // (FR-1290), unchanged by FR-3441.
        await expect(await modal.getReadWritePermissionRadio()).toBeDisabled();

        await (await modal.getCancelButton()).click();
      });

      test('General mode keeps Read & Write selectable', async ({ page }) => {
        const modal = new FolderCreationModal(page);
        await modal.modalToBeVisible();

        await expect(await modal.getGeneralUsageModeRadio()).toBeChecked();
        await expect(await modal.getReadWritePermissionRadio()).toBeEnabled();

        await (await modal.getCancelButton()).click();
      });
    });
  },
);
