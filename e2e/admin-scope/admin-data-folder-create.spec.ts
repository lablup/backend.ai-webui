// FR-3414 smoke (ADR-0001): on the admin Data page there is no ambient
// project context (the header selector is hidden), so the folder-creation
// modal embeds its own required "Target Project" selector — the created
// folder must land in exactly the project chosen inside the modal.
import { createAdminApiContext, gqlAdmin } from '../utils/admin-api';
import { FolderCreationModal } from '../utils/classes/vfolder/FolderCreationModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect } from '@playwright/test';

// The project chosen inside the modal. Without an override, the first project
// the selector offers: the admin's domain is not 'default' on every cluster.
const TARGET_PROJECT_OVERRIDE = process.env.E2E_ADMIN_PROJECT_NAME;

test.describe(
  'Admin Data page folder creation targets the in-modal project',
  { tag: ['@admin', '@vfolder', '@functional'] },
  () => {
    let folderName: string;

    test.beforeEach(async ({ page, request }) => {
      folderName =
        'e2e-test-admin-data-create-' +
        Date.now() +
        '-' +
        Math.random().toString(36).slice(2, 6);
      await loginAsAdmin(page, request);
    });

    test.afterEach(async ({ page }) => {
      await cleanupVFolderSafely(page, folderName, 'admin-data');
      // The row's trash action can be disabled for project folders (lts), so
      // purge whatever the UI left behind over REST.
      let api: Awaited<ReturnType<typeof createAdminApiContext>> | undefined;
      try {
        api = await createAdminApiContext();
        const { vfolder_list } = await gqlAdmin<{
          vfolder_list: { items: Array<{ id: string; status: string }> };
        }>(
          api,
          `query($filter: String) {
            vfolder_list(limit: 10, offset: 0, filter: $filter) { items { id status } }
          }`,
          { filter: `name == "${folderName}"` },
        );
        for (const { id, status } of vfolder_list.items) {
          if (status === 'delete-complete') continue;
          await api.delete('/func/folders', { data: { vfolder_id: id } });
          await api.post('/func/folders/delete-from-trash-bin', {
            data: { vfolder_id: id },
          });
        }
      } catch (error) {
        console.warn(`could not purge "${folderName}" over REST:`, error);
      } finally {
        await api?.dispose().catch(() => {});
      }
    });

    test('folder created from the admin Data page lands in the project chosen in the modal', async ({
      page,
    }) => {
      await navigateTo(page, 'admin/data');

      // The header project selector must be absent — the modal is the only
      // place a project can be (and must be) chosen.
      await expect(page.getByTestId('selector-project')).toHaveCount(0);

      await page.getByRole('button', { name: 'Create Folder' }).click();

      const folderCreationModal = new FolderCreationModal(page);
      await folderCreationModal.modalToBeVisible();

      // The in-modal Target Project selector is required on the admin page.
      // It is a plain Astryx `Selector` (role="combobox" trigger,
      // role="listbox"/"option" popup) — no `.ant-select-dropdown` wrapper
      // exists any more.
      const projectSelect = page.getByTestId('folder-create-project-select');
      await expect(projectSelect).toBeVisible();
      await projectSelect.click();
      const targetOption = TARGET_PROJECT_OVERRIDE
        ? page.getByRole('option', {
            name: TARGET_PROJECT_OVERRIDE,
            exact: true,
          })
        : page.getByRole('listbox').getByRole('option').first();
      const targetProject = (await targetOption.innerText()).trim();
      expect(targetProject).not.toBe('');
      await targetOption.click();
      await expect(projectSelect).toContainText(targetProject);

      await folderCreationModal.fillFolderName(folderName);
      await (await folderCreationModal.getCreateButton()).click();

      // Modal closes on success.
      await page
        .getByRole('dialog')
        .filter({ hasText: 'Create a new storage folder' })
        .waitFor({ state: 'hidden' });

      // The created folder's row shows the chosen project as its owner
      // (admin Data page creates project folders; the Owner column renders
      // the owning project's name).
      const row = page.getByRole('row').filter({ hasText: folderName });
      await expect(row).toBeVisible({ timeout: 15000 });
      await expect(row).toContainText(targetProject);
    });
  },
);
