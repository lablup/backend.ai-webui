// FR-3414 smoke (ADR-0001): on the admin Data page there is no ambient
// project context (the header selector is hidden), so the folder-creation
// modal embeds its own required "Target Project" selector — the created
// folder must land in exactly the project chosen inside the modal.
import { FolderCreationModal } from '../utils/classes/vfolder/FolderCreationModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect } from '@playwright/test';

// The project chosen inside the modal. `default` exists on every test cluster.
const TARGET_PROJECT = process.env.E2E_ADMIN_PROJECT_NAME || 'default';

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
      const projectSelect = page.getByTestId('folder-create-project-select');
      await expect(projectSelect).toBeVisible();
      await projectSelect.click();
      await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
      await page
        .locator('.ant-select-dropdown')
        .getByRole('option', { name: TARGET_PROJECT, exact: true })
        .click();

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
      await expect(row).toContainText(TARGET_PROJECT);
    });
  },
);
