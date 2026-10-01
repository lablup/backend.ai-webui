// spec: FR-4005 (#9793) — the explorer's side panel starts on Metadata every time it opens
import { createAdminApiContext } from '../utils/admin-api';
import { FolderExplorerModal } from '../utils/classes/vfolder/FolderExplorerModal';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect, Page, APIRequestContext } from '@playwright/test';

const openFolderExplorer = async (page: Page, folderName: string) => {
  const folderLink = page.getByRole('link', { name: folderName }).first();
  await expect(folderLink).toBeVisible({ timeout: 15000 });
  await folderLink.click();
  const modal = new FolderExplorerModal(page);
  await modal.waitForOpen();
  await modal.verifyFolderName(folderName);
  return modal;
};

// The side panel's tab strip is a nav landmark: tabs are buttons and the
// selected one carries `aria-current="true"`.
const getSidePanelTab = (page: Page, name: 'Metadata' | 'Audit Log') =>
  page
    .getByRole('dialog')
    .first()
    .getByRole('navigation', { name: 'Tabs' })
    .getByRole('button', { name, exact: true });

test.describe(
  'FolderExplorerModal - Side Panel',
  { tag: ['@regression', '@vfolder', '@functional'] },
  () => {
    let api: APIRequestContext | undefined;
    const createdFolderIds: string[] = [];

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test.afterEach(async () => {
      if (!api) return;
      // Best-effort: move to trash, then purge, so nothing is left on the shared server.
      for (const vfolderId of createdFolderIds.splice(0)) {
        await api
          .delete('/func/folders', { data: { vfolder_id: vfolderId } })
          .catch(() => undefined);
        await api
          .post('/func/folders/delete-from-trash-bin', {
            data: { vfolder_id: vfolderId },
          })
          .catch(() => undefined);
      }
      await api.dispose();
      api = undefined;
    });

    test('User can see the side panel start on Metadata when opening another folder after viewing the Audit Log', async ({
      page,
    }) => {
      test.setTimeout(120000);
      api = await createAdminApiContext();
      const suffix = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const [firstFolder, secondFolder] = [
        `e2e-side-panel-a-${suffix}`,
        `e2e-side-panel-b-${suffix}`,
      ];
      for (const name of [firstFolder, secondFolder]) {
        const created = await api.post('/func/folders', {
          data: { name, usage_mode: 'general', permission: 'rw' },
        });
        expect(created.ok()).toBeTruthy();
        createdFolderIds.push((await created.json()).id);
      }

      await navigateTo(page, 'data');

      // 1. The first folder's side panel opens on Metadata; switch to Audit Log.
      const firstModal = await openFolderExplorer(page, firstFolder);
      await expect(getSidePanelTab(page, 'Metadata')).toHaveAttribute(
        'aria-current',
        'true',
      );
      await getSidePanelTab(page, 'Audit Log').click();
      await expect(getSidePanelTab(page, 'Audit Log')).toHaveAttribute(
        'aria-current',
        'true',
      );
      await firstModal.close();

      // 2. Opening a different folder starts the side panel over on Metadata.
      await openFolderExplorer(page, secondFolder);
      await expect(getSidePanelTab(page, 'Metadata')).toHaveAttribute(
        'aria-current',
        'true',
      );
      await expect(getSidePanelTab(page, 'Audit Log')).not.toHaveAttribute(
        'aria-current',
        'true',
      );
    });
  },
);
