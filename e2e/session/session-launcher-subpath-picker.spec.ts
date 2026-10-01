// spec: FR-4000 (#9785) — creating a folder in the sub path picker keeps the current listing
import { createAdminApiContext } from '../utils/admin-api';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect, APIRequestContext } from '@playwright/test';

const EXISTING_DIR = 'existing-dir';

test.describe(
  'SessionLauncher - Sub Path Picker',
  { tag: ['@regression', '@session', '@functional'] },
  () => {
    let api: APIRequestContext | undefined;
    let createdFolderId: string | undefined;

    test.beforeEach(async ({ page, request }) => {
      createdFolderId = undefined;
      await loginAsAdmin(page, request);
    });

    test.afterEach(async () => {
      if (!api) return;
      if (createdFolderId) {
        // Best-effort: move to trash, then purge, so nothing is left on the shared server.
        await api
          .delete('/func/folders', { data: { vfolder_id: createdFolderId } })
          .catch(() => undefined);
        await api
          .post('/func/folders/delete-from-trash-bin', {
            data: { vfolder_id: createdFolderId },
          })
          .catch(() => undefined);
      }
      await api.dispose();
      api = undefined;
    });

    test('User can create a folder in the sub path picker and stay in the current listing', async ({
      page,
    }) => {
      const suffix = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const folderName = `e2e-subpath-mkdir-${suffix}`;
      const newDirName = `new-dir-${suffix}`;
      api = await createAdminApiContext();
      const created = await api.post('/func/folders', {
        data: { name: folderName, usage_mode: 'general', permission: 'rw' },
      });
      expect(created.ok()).toBeTruthy();
      createdFolderId = (await created.json()).id;
      const mkdir = await api.post(`/func/folders/${folderName}/mkdir`, {
        data: { path: EXISTING_DIR },
      });
      expect(mkdir.ok()).toBeTruthy();

      await navigateTo(page, 'session/start');
      await page
        .getByRole('button', { name: 'Go to step 3: Data & Storage' })
        .click();
      await page.getByRole('button', { name: 'Select Folder' }).click();
      await page
        .getByRole('option', { name: new RegExp(`^${folderName}\\b`) })
        .click();
      await page.keyboard.press('Escape');
      await expect(
        page.getByRole('listbox', { name: 'Select Folder' }),
      ).toBeHidden();

      const mountRow = page
        .getByRole('listitem')
        .filter({ has: page.getByRole('link', { name: folderName }) });
      await expect(mountRow).toBeVisible();
      await mountRow.getByRole('button', { name: 'Subpath' }).click();

      const pickerDialog = page.getByRole('dialog', {
        name: `Select a path in ${folderName}`,
      });
      await expect(pickerDialog).toBeVisible({ timeout: 15000 });
      const listing = pickerDialog.getByRole('table');
      await expect(
        listing.getByText(EXISTING_DIR, { exact: true }),
      ).toBeVisible({ timeout: 15000 });

      await pickerDialog.getByRole('button', { name: 'Create Folder' }).click();
      const createDialog = page.getByRole('dialog', {
        name: 'Create a new folder',
      });
      await expect(createDialog).toBeVisible();
      await createDialog.getByLabel('Folder Name').fill(newDirName);
      await createDialog
        .getByRole('button', { name: 'Create', exact: true })
        .click();
      await expect(createDialog).toBeHidden();

      // The picker stays at the root: the new folder appears beside the existing one.
      await expect(listing.getByText(newDirName, { exact: true })).toBeVisible({
        timeout: 15000,
      });
      await expect(
        listing.getByText(EXISTING_DIR, { exact: true }),
      ).toBeVisible();
      await expect(pickerDialog.locator('code')).toHaveText('/');

      await pickerDialog
        .getByRole('button', { name: 'Select this location' })
        .click();
      await expect(pickerDialog).toBeHidden();
      await expect(
        mountRow.getByRole('button', { name: 'Subpath' }),
      ).toHaveText('Select a path');
    });
  },
);
