// Test to verify consecutive folder deletions work correctly with filter clearing
import { NotificationHandler } from '../utils/classes/common/NotificationHandler';
import { skipUnlessManagerVersion } from '../utils/feature-gate-util';
import {
  loginAsUser,
  loginAsAdmin,
  createVFolderAndVerify,
  moveToTrashAndVerify,
  deleteForeverAndVerifyFromTrash,
  getVFolderRow,
  navigateTo,
  retryWithTableRefresh,
  selectPropertyFilter,
  userInfo,
} from '../utils/test-util';
import {
  createUserApiContext,
  createVFolderViaApi,
  moveVFolderToTrashViaApi,
  purgeVFolderViaApi,
} from '../utils/vfolder-api';
import { expect, test, type APIRequestContext } from '@playwright/test';

// Not serial: single test — no ordering dependency.
test.describe(
  'VFolder Consecutive Deletion - User Operations',
  { tag: ['@regression', '@vfolder', '@functional'] },
  () => {
    test.setTimeout(180_000);
    const folder1Name = 'e2e-test-consecutive-1-' + new Date().getTime();
    const folder2Name = 'e2e-test-consecutive-2-' + new Date().getTime();
    const folder3Name = 'e2e-test-consecutive-3-' + new Date().getTime();

    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
    });

    test('User can create and permanently delete multiple VFolders consecutively', async ({
      page,
    }) => {
      test.setTimeout(180_000);
      // Create NotificationHandler instance for managing notifications throughout the test
      const notification = new NotificationHandler(page);

      // Create three folders
      // Dismiss notifications after each creation to prevent UI blocking
      await createVFolderAndVerify(page, folder1Name);
      await notification.closeAllNotifications();

      await createVFolderAndVerify(page, folder2Name);
      await notification.closeAllNotifications();

      await createVFolderAndVerify(page, folder3Name);
      await notification.closeAllNotifications();

      // Move all to trash
      await moveToTrashAndVerify(page, folder1Name);
      await notification.closeAllNotifications();

      await moveToTrashAndVerify(page, folder2Name);
      await notification.closeAllNotifications();

      await moveToTrashAndVerify(page, folder3Name);
      await notification.closeAllNotifications();

      // Delete all consecutively - this tests that filters are cleared properly
      // between each deletion, preventing the "folder not found" issue
      await deleteForeverAndVerifyFromTrash(page, folder1Name);
      await notification.closeAllNotifications();

      await deleteForeverAndVerifyFromTrash(page, folder2Name);
      await notification.closeAllNotifications();

      await deleteForeverAndVerifyFromTrash(page, folder3Name);
      await notification.closeAllNotifications();
    });
  },
);

// Not serial: single test — the folders are prepared over the API per test.
test.describe(
  'VFolder Bulk Deletion - Admin Trash',
  {
    tag: ['@regression', '@vfolder', '@functional', '@requires-manager-v26.9'],
  },
  () => {
    let adminApi: APIRequestContext | undefined;
    let folderPrefix: string;
    let folders: Array<{ name: string; id: string }> = [];

    test.beforeEach(async ({ page, request }) => {
      adminApi = undefined;
      folders = [];
      await loginAsAdmin(page, request);
      await skipUnlessManagerVersion(
        page,
        '26.9.0rc1',
        'Bulk delete forever reads VFolder permissions from scopedVFoldersV2 (#10051)',
      );
      adminApi = await createUserApiContext(
        userInfo.admin.email,
        userInfo.admin.password,
      );
      folderPrefix = `e2e-test-bulk-purge-${Date.now()}-`;
      for (const suffix of ['a', 'b']) {
        const name = folderPrefix + suffix;
        const id = await createVFolderViaApi(adminApi, name);
        folders.push({ name, id });
        await moveVFolderToTrashViaApi(adminApi, id);
      }
    });

    test.afterEach(async () => {
      if (!adminApi) return;
      for (const { id } of folders) {
        await purgeVFolderViaApi(adminApi, id);
      }
      await adminApi.dispose().catch(() => {});
    });

    test('Admin can delete forever multiple folders at once from the trash tab', async ({
      page,
    }) => {
      await navigateTo(page, 'admin-data');
      await page
        .getByRole('tab', { name: /^Trash/ })
        .or(page.getByRole('button', { name: /^Trash/ }))
        .first()
        .click();
      await selectPropertyFilter(page, 'Name', folderPrefix);

      const rows = folders.map(({ name }) => getVFolderRow(page, name));
      await retryWithTableRefresh(page, async () => {
        for (const row of rows) {
          await expect(
            row.getByRole('cell', { name: 'DELETE_PENDING', exact: true }),
          ).toBeVisible({ timeout: 2500 });
        }
      });
      for (const row of rows) {
        await row.getByRole('checkbox').check();
      }

      // The bulk actions render next to the selection label, above the table.
      const selectionBar = page
        .locator('div')
        .filter({ has: page.getByText('2 selected', { exact: true }) })
        .filter({
          has: page.getByRole('button', { name: 'Delete', exact: true }),
        })
        .last();
      await expect(selectionBar).toBeVisible();
      await selectionBar
        .getByRole('button', { name: 'Delete', exact: true })
        .click();

      const dialog = page.getByRole('dialog', { name: 'Delete Forever?' });
      await expect(dialog).toBeVisible();
      for (const { name } of folders) {
        await expect(
          dialog.getByRole('listitem').filter({ hasText: name }),
        ).toBeVisible();
      }
      const deleteForeverButton = dialog.getByRole('button', {
        name: 'Delete forever',
      });
      await expect(deleteForeverButton).toBeDisabled();
      await dialog
        .getByRole('textbox', { name: 'Please type Delete to confirm.' })
        .fill('Delete');
      await expect(deleteForeverButton).toBeEnabled();
      await deleteForeverButton.click();
      await expect(dialog).toBeHidden({ timeout: 15000 });

      // The admin Trash tab keeps purged rows as DELETE_ONGOING /
      // DELETE_COMPLETE, so a row leaving DELETE_PENDING (or the list) is the
      // signal that it was deleted forever.
      await retryWithTableRefresh(page, async () => {
        for (const row of rows) {
          await expect(
            row.getByRole('cell', { name: 'DELETE_PENDING', exact: true }),
          ).toBeHidden({ timeout: 2500 });
        }
      });
    });
  },
);
