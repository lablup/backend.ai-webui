import { FolderCreationModal } from '../utils/classes/vfolder/FolderCreationModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import { skipUnlessAllowedVFolderType } from '../utils/feature-gate-util';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, Page } from '@playwright/test';

/**
 * The folder creation modal has no Type (User/Project) radio: every folder is
 * created as a project folder of the page's project (#10501).
 */

/**
 * Navigate to the Project Admin Data page (/project-data) and open the Create
 * Folder modal.
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
  },
);
