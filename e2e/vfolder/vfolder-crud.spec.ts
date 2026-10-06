import { FolderCreationModal } from '../utils/classes/vfolder/FolderCreationModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import { skipUnlessManagerVersion } from '../utils/feature-gate-util';
import {
  acceptAllInvitationAndVerifySpecificFolder,
  createVFolderAndVerify,
  deleteForeverAndVerifyFromTrash,
  getVFolderRow,
  leaveSharedFolderAndVerify,
  loginAsUser,
  loginAsUser2,
  moveToTrashAndVerify,
  navigateTo,
  restoreVFolderAndVerify,
  retryWithTableRefresh,
  selectPropertyFilter,
  shareVFolderAndVerify,
  userInfo,
} from '../utils/test-util';
import {
  createUserApiContext,
  createVFolderViaApi,
  purgeVFolderViaApi,
  shareVFolderViaApi,
} from '../utils/vfolder-api';
import { test, expect, type APIRequestContext } from '@playwright/test';

test.describe(
  'VFolder CRUD',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
    });
    const folderName = 'e2e-test-folder-user-creation' + new Date().getTime();
    // Not serial: each creation test uses a unique folder name generated in
    // beforeEach and cleaned up in afterEach, so a failure doesn't cascade.
    // mode: 'default' keeps tests sequential on one worker to limit backend load.
    test.describe('vFolder Creation', () => {
      test.describe.configure({ mode: 'default' });
      let creationFolderName: string;
      test.beforeEach(async ({ page }) => {
        creationFolderName =
          'e2e-test-folder-user-creation-' +
          Date.now() +
          '-' +
          Math.random().toString(36).slice(2, 6);
        await page.getByRole('link', { name: 'Data' }).click();
        await page
          .getByRole('button', { name: 'Create Folder' })
          .first()
          .click();
      });
      test.afterEach(async ({ page }) => {
        await cleanupVFolderSafely(page, creationFolderName);
      });
      test('User can create a vFolder by selecting a specific location', async ({
        page,
      }) => {
        const folderCreationModal = new FolderCreationModal(page);
        await folderCreationModal.modalToBeVisible();
        await folderCreationModal.fillFolderName(creationFolderName);
        await folderCreationModal.fillLocationSelector('local');
        await folderCreationModal.selectLocationOptionByText('local');
        await (await folderCreationModal.getCreateButton()).click();
      });
      test('User can create default vFolder', async ({ page }) => {
        const folderCreationModal = new FolderCreationModal(page);
        await folderCreationModal.modalToBeVisible();
        await folderCreationModal.fillFolderName(creationFolderName);
        await (await folderCreationModal.getCreateButton()).click();
      });
      test('User can create Model vFolder', async ({ page }) => {
        const folderCreationModal = new FolderCreationModal(page);
        await folderCreationModal.modalToBeVisible();
        await folderCreationModal.fillFolderName(creationFolderName);
        await (await folderCreationModal.getModelUsageModeRadio()).check();
        await expect(
          await folderCreationModal.getModelUsageModeRadio(),
        ).toBeChecked();
        await (await folderCreationModal.getCreateButton()).click();
      });
      test('User can create cloneable Model vFolder', async ({ page }) => {
        const folderCreationModal = new FolderCreationModal(page);
        await folderCreationModal.modalToBeVisible();
        await folderCreationModal.fillFolderName(creationFolderName);
        await (await folderCreationModal.getModelUsageModeRadio()).check();
        await expect(
          await folderCreationModal.getModelUsageModeRadio(),
        ).toBeChecked();
        await (await folderCreationModal.getCloneableSwitchButton()).click();
        await expect(
          await folderCreationModal.getCloneableSwitchButton(),
        ).toBeChecked();
        await (await folderCreationModal.getCreateButton()).click();
      });
      test('User can create Read & Write vFolder', async ({ page }) => {
        const folderCreationModal = new FolderCreationModal(page);
        await folderCreationModal.modalToBeVisible();
        await folderCreationModal.fillFolderName(creationFolderName);
        await (await folderCreationModal.getReadWritePermissionRadio()).check();
        await expect(
          await folderCreationModal.getReadWritePermissionRadio(),
        ).toBeChecked();
        await (await folderCreationModal.getCreateButton()).click();
      });
      test('User can create Read Only vFolder', async ({ page }) => {
        const folderCreationModal = new FolderCreationModal(page);
        await folderCreationModal.modalToBeVisible();
        await folderCreationModal.fillFolderName(creationFolderName);
        await (await folderCreationModal.getReadOnlyPermissionRadio()).check();
        await expect(
          await folderCreationModal.getReadOnlyPermissionRadio(),
        ).toBeChecked();
        await (await folderCreationModal.getCreateButton()).click();
      });
    });
    // Auto Mount uses a dedicated folder name (dot-prefixed) that is independent.
    // Not serial: single test — no ordering dependency.
    test.describe('Auto Mount vFolder Creation', () => {
      const folderName = '.e2e-test-folder-auto-mount' + new Date().getTime();
      test.beforeEach(async ({ page }) => {
        await page.getByRole('link', { name: 'Data' }).click();
        await page
          .getByRole('button', { name: 'Create Folder' })
          .first()
          .click();
      });
      test.afterEach(async ({ page }) => {
        await cleanupVFolderSafely(page, folderName);
      });
      test('User can create Auto Mount vFolder', async ({ page }) => {
        const folderCreationModal = new FolderCreationModal(page);
        await folderCreationModal.modalToBeVisible();
        await folderCreationModal.fillFolderName(folderName);
        await (await folderCreationModal.getAutoMountUsageModeRadio()).check();
        await expect(
          await folderCreationModal.getAutoMountUsageModeRadio(),
        ).toBeChecked();
        await (await folderCreationModal.getCreateButton()).click();
      });
    });

    test('User can create, delete(move to trash), restore, delete forever vFolder', async ({
      page,
    }) => {
      test.setTimeout(180_000);
      await createVFolderAndVerify(page, folderName);
      await moveToTrashAndVerify(page, folderName);
      await restoreVFolderAndVerify(page, folderName);
      await moveToTrashAndVerify(page, folderName);
      await deleteForeverAndVerifyFromTrash(page, folderName);
    });
  },
);

// Not serial: single test — no ordering dependency; the folder is created in
// beforeEach and cleaned up in afterEach.
test.describe(
  'VFolder Sharing',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
    const sharingFolderName = 'e2e-test-folder-sharing' + new Date().getTime();
    test.setTimeout(180_000);
    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
      await createVFolderAndVerify(page, sharingFolderName);
    });
    test.afterEach(async ({ page }) => {
      await cleanupVFolderSafely(page, sharingFolderName);
    });

    test('User can share vFolder', async ({ page, browser, request }) => {
      await shareVFolderAndVerify(
        page,
        sharingFolderName,
        userInfo.user2.email,
      );
      const user2_page = await browser.newPage();
      await loginAsUser2(user2_page, request);
      await acceptAllInvitationAndVerifySpecificFolder(
        user2_page,
        sharingFolderName,
        userInfo.user.email,
      );
    });

    // Regression guard for FR-2978: previously the leave_invited client
    // sent `null` as the request body, which the manager's
    // BodyParam[LeaveVFolderReq] rejected with HTTP 400.
    // fixme: the 26.9.0rc1 manager answers the invitee's POST
    // /folders/{id}/leave with 403 "lacks permission HARD_DELETE".
    test.fixme('Invitee can leave a shared vFolder', async ({
      page,
      browser,
      request,
    }) => {
      await shareVFolderAndVerify(
        page,
        sharingFolderName,
        userInfo.user2.email,
      );
      const user2_page = await browser.newPage();
      await loginAsUser2(user2_page, request);
      await acceptAllInvitationAndVerifySpecificFolder(
        user2_page,
        sharingFolderName,
      );
      await leaveSharedFolderAndVerify(user2_page, sharingFolderName);
    });
  },
);

// Not serial: single test — both folders and the share are prepared over the
// API in beforeEach and purged in afterEach.
test.describe(
  'VFolder Move to Trash - Shared Folder Permission',
  {
    tag: ['@regression', '@vfolder', '@functional', '@requires-manager-v26.9'],
  },
  () => {
    let userApi: APIRequestContext | undefined;
    let user2Api: APIRequestContext | undefined;
    let folderPrefix: string;
    let ownFolderId: string | undefined;
    let sharedFolderId: string | undefined;
    const ownFolderName = () => folderPrefix + 'own';
    const sharedFolderName = () => folderPrefix + 'shared';

    test.beforeEach(async ({ page, request }) => {
      userApi = user2Api = ownFolderId = sharedFolderId = undefined;
      folderPrefix = `e2e-test-trash-perm-${Date.now()}-`;
      await loginAsUser(page, request);
      await skipUnlessManagerVersion(
        page,
        '26.9.0rc1',
        'Move to trash reads VFolder permissions from scopedVFoldersV2 (#10051)',
      );
      userApi = await createUserApiContext(
        userInfo.user.email,
        userInfo.user.password,
      );
      user2Api = await createUserApiContext(
        userInfo.user2.email,
        userInfo.user2.password,
      );
      ownFolderId = await createVFolderViaApi(userApi, ownFolderName());
      // A folder shared read-only by another user: the invitee has no
      // SOFT_DELETE permission on it.
      sharedFolderId = await createVFolderViaApi(user2Api, sharedFolderName());
      await shareVFolderViaApi(
        user2Api,
        userApi,
        sharedFolderName(),
        userInfo.user.email,
        'ro',
      );
    });

    test.afterEach(async () => {
      if (userApi && ownFolderId) {
        await purgeVFolderViaApi(userApi, ownFolderId);
      }
      if (user2Api && sharedFolderId) {
        await purgeVFolderViaApi(user2Api, sharedFolderId);
      }
      await Promise.allSettled([userApi?.dispose(), user2Api?.dispose()]);
    });

    test('User can move only folders with delete permission to trash when a shared read-only folder is selected', async ({
      page,
    }) => {
      await navigateTo(page, 'data');
      await page
        .getByRole('tab', { name: /^Active/ })
        .or(page.getByRole('button', { name: /^Active/ }))
        .first()
        .click();
      await selectPropertyFilter(page, 'Name', folderPrefix);

      const ownRow = getVFolderRow(page, ownFolderName());
      const sharedRow = getVFolderRow(page, sharedFolderName());
      await retryWithTableRefresh(page, async () => {
        await expect(ownRow).toBeVisible({ timeout: 2500 });
        await expect(sharedRow).toBeVisible({ timeout: 2500 });
      });
      await expect(
        sharedRow.getByRole('button', { name: 'Move to trash bin' }),
      ).toBeDisabled();

      await ownRow.getByRole('checkbox').check();
      await sharedRow.getByRole('checkbox').check();

      // The bulk action renders next to the selection label, above the table.
      const selectionBar = page
        .locator('div')
        .filter({ has: page.getByText('2 selected', { exact: true }) })
        .filter({
          has: page.getByRole('button', { name: 'Move to trash bin' }),
        })
        .last();
      await expect(selectionBar).toBeVisible();
      await selectionBar
        .getByRole('button', { name: 'Move to trash bin' })
        .click();

      const dialog = page.getByRole('dialog', { name: 'Move to trash bin' });
      await expect(dialog).toBeVisible();
      const excludedAlert = dialog.getByRole('status').filter({
        hasText:
          'The following folder(s) without delete permission will be excluded.',
      });
      await expect(excludedAlert).toBeVisible();
      await expect(
        excludedAlert.getByRole('listitem').filter({
          hasText: sharedFolderName(),
        }),
      ).toBeVisible();
      await expect(excludedAlert).not.toContainText(ownFolderName());
      await expect(dialog).toContainText(
        `Are you sure you want to move "${ownFolderName()}" to trash bin?`,
      );
      await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
      await expect(dialog).toBeHidden({ timeout: 15000 });

      await retryWithTableRefresh(page, async () => {
        await expect(ownRow).toBeHidden({ timeout: 2500 });
        await expect(sharedRow).toBeVisible({ timeout: 2500 });
      });

      await page
        .getByRole('tab', { name: /^Trash/ })
        .or(page.getByRole('button', { name: /^Trash/ }))
        .first()
        .click();
      await retryWithTableRefresh(page, async () => {
        await expect(ownRow).toBeVisible({ timeout: 2500 });
        await expect(sharedRow).toBeHidden({ timeout: 2500 });
      });
    });
  },
);
