// spec: FolderExplorerModal-Test-Plan.md
import { createAccountApiContext } from '../../utils/admin-api';
import { FolderExplorerModal } from '../../utils/classes/vfolder/FolderExplorerModal';
import { cleanupVFolderSafely } from '../../utils/cleanup-util';
import { getE2EVFolderHost } from '../../utils/e2e-scope';
import { skipUnlessLabelableEntityType } from '../../utils/feature-gate-util';
import {
  loginAsUser,
  navigateTo,
  createVFolderAndVerify,
  moveToTrashAndVerify,
  deleteForeverAndVerifyFromTrash,
  modifyConfigToml,
  userInfo,
  webuiEndpoint,
} from '../../utils/test-util';
import { test, expect, APIRequestContext, Page } from '@playwright/test';

// The folder default is read-only (#10647), but the manager gives the creator
// of a project folder a read & write mount policy of their own.
const CREATOR_MOUNT_PERMISSION = 'Read & Write';

const openFolderExplorer = async (
  page: Page,
  folderName: string,
): Promise<FolderExplorerModal> => {
  await navigateTo(page, 'data');
  await page.waitForLoadState('networkidle');
  const folderLink = page.getByRole('link', { name: folderName }).first();
  await expect(folderLink).toBeVisible({ timeout: 15000 });
  await folderLink.click();
  const modal = new FolderExplorerModal(page);
  await modal.waitForOpen();
  await modal.verifyFileExplorerLoaded();
  return modal;
};

// Not serial: each test provisions its own uniquely-named folder (or uses
// none) and deletes it at the end of its body, so a failure doesn't cascade.
// A mid-test failure can leave its folder behind, but names are unique per
// run so later tests/runs are unaffected. mode: 'default' keeps tests
// sequential on one worker to limit backend load.
test.describe(
  'VFolder Explorer Modal',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
    test.describe.configure({ mode: 'default' });

    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
      await navigateTo(page, 'data');
    });

    test('User can create folders and upload files in VFolder with write permissions', async ({
      page,
    }) => {
      test.setTimeout(120000);
      const rwFolderName = 'e2e-test-folder-rw-' + new Date().getTime();

      // 1. Create a VFolder; its owner always mounts it read & write, whatever
      //    the shared-user default is (#10647 creates every folder read-only).
      await createVFolderAndVerify(page, rwFolderName);

      // 2. Open the VFolder in FolderExplorerModal
      const modal = await openFolderExplorer(page, rwFolderName);

      // 3. Verify modal opens successfully with proper layout
      await modal.verifyFolderName(rwFolderName);

      // 4. Verify file explorer loads without errors
      await modal.verifyFileExplorerLoaded();

      // 5. Ownership decides whether the mount permission row is shown.
      await modal.verifyFolderDetails(
        userInfo.user.email,
        CREATOR_MOUNT_PERMISSION,
      );

      // 6. Verify upload functionality is available (Write permission)
      const uploadButton = await modal.getUploadButton();
      await expect(uploadButton).toBeEnabled();

      // 7. Verify create folder functionality is available (Write permission)
      const createButton = await modal.getCreateFolderButton();
      await expect(createButton).toBeEnabled();

      // 8. Close modal
      await modal.close();

      // 9. Cleanup
      await moveToTrashAndVerify(page, rwFolderName, 'data', {
        skipTrashVerify: true,
      });
      await deleteForeverAndVerifyFromTrash(page, rwFolderName);
    });

    test('User sees Read & Write mount permission on a project folder they created', async ({
      page,
    }) => {
      test.setTimeout(120000);
      const roFolderName = 'e2e-test-folder-ro-' + new Date().getTime();

      // 1. Create a VFolder: new folders are read-only for shared users
      //    (#10647), so no permission choice is made here.
      await createVFolderAndVerify(page, roFolderName);

      // 2. Open the VFolder in FolderExplorerModal (the list has no mount
      //    permission column any more)
      await navigateTo(page, 'data');
      const modal = await openFolderExplorer(page, roFolderName);

      // 3. Verify modal opens successfully
      await modal.verifyFolderName(roFolderName);

      // 4. Ownership decides whether the mount permission row is shown.
      await modal.verifyFolderDetails(
        userInfo.user.email,
        CREATOR_MOUNT_PERMISSION,
      );

      // 5. Verify file explorer loads
      await modal.verifyFileExplorerLoaded();

      // 6. Close modal
      await modal.close();

      // 7. Cleanup
      await moveToTrashAndVerify(page, roFolderName, 'data', {
        skipTrashVerify: true,
      });
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

      // 2. Verify error message is displayed in modal. The manager answers an
      // unknown id with a field error on `vfolderV2`, which
      // `FolderExplorerModalV2` reports as "Folder details are unavailable"
      // since #10051; "Folder not found or access denied" is kept for a plain
      // `null` node.
      await modal.verifyErrorMessage('Folder details are unavailable');

      // 3. Verify file explorer table is not within the modal body
      // Check that BAIFileExplorer's table is not rendered
      await modal.verifyFileExplorerNotLoaded();

      // 4. Verify modal can still be closed
      const closeButton = await modal.getCloseButton();
      // For React development mode, the button may be covered by Red screen; use force click
      await closeButton.click({ force: true });
    });
  },
);

test.describe(
  'FolderExplorerModal - User Modal Interaction',
  { tag: ['@critical', '@vfolder', '@functional'] },
  () => {
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
      test.setTimeout(90_000);
      // Create a new context and page for cleanup
      const context = await browser.newContext();
      const page = await context.newPage();

      await loginAsUser(page, request);

      // Clean up folder created during tests
      await cleanupVFolderSafely(page, testFolderName);

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
        timeout: 5000,
      });

      // 6. Verify URL no longer has folder parameter
      await expect(page).toHaveURL(/\/data\/?($|\?(?!.*folder=))/);
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

    test(
      'File Browser button falls back to an installed image when defaultFileBrowserImage is unset',
      { tag: ['@requires-image-filebrowser'] },
      async ({ page, request }) => {
        test.setTimeout(120000);

        // Clear the configured default File Browser image. With
        // `general.defaultFileBrowserImage` empty, `_.isEmpty(...)` is true, so
        // `useDefaultFileBrowserImageWithFallback`
        // (react/src/hooks/useDefaultImagesWithFallback.ts) must fall back to
        // querying installed images whose `ai.backend.service-ports` label includes
        // `filebrowser` and use the first match. This is the scenario the empty
        // FR-1714 `test.fixme` stub never covered. See FR-3118.
        await modifyConfigToml(page, request, {
          general: {
            defaultFileBrowserImage: '',
          },
        });

        // 1. Open the VFolder explorer modal.
        const modal = await openFolderExplorer(page, testFolderName);

        // 2. The File Browser button is visible but stays disabled until the
        //    fallback images query resolves an image, so allow it time to settle.
        const fileBrowserButton = await modal.getFileBrowserButton();

        let fellBackToInstalledImage = false;
        try {
          await expect(fileBrowserButton).toBeEnabled({ timeout: 20000 });
          fellBackToInstalledImage = true;
        } catch {
          fellBackToInstalledImage = false;
        }

        // Environment gate (FR-3114 style, @requires-image-filebrowser): the
        // fallback can only enable the button when the deployment has at least one
        // installed filebrowser-capable image. When none exists there is nothing to
        // fall back to and the button stays disabled, so skip with a documented
        // reason (cluster image provisioning is tracked in FR-3119) rather than
        // reporting a false failure.
        test.skip(
          !fellBackToInstalledImage,
          "File Browser fallback requires at least one installed image whose 'ai.backend.service-ports' label includes 'filebrowser' (@requires-image-filebrowser); none available on this backend",
        );

        // 3. With no configured default image, the button is enabled — the fallback
        //    resolved an installed filebrowser image — so File Browser remains usable.
        //    Keep an explicit timeout (matching the gate above) so the assertion
        //    tolerates a slow fallback images query instead of using expect's 5s default.
        await expect(fileBrowserButton).toBeEnabled({ timeout: 20000 });

        // 4. Close modal.
        await modal.close();
      },
    );

    test('User can view VFolder details in the explorer modal', async ({
      page,
    }) => {
      // 1. Open modal
      const modal = await openFolderExplorer(page, testFolderName);

      // 2. Verify essential folder details are displayed
      await modal.verifyFolderDetails(
        userInfo.user.email,
        CREATOR_MOUNT_PERMISSION,
      );

      // 3. Close modal
      await modal.close();
    });
  },
);

// #10388: the explorer's Metadata tab carries a Labels row whose hover
// action edits the folder's labels. Each test creates its own user folder
// through the API and purges it in afterEach.
test.describe(
  'VFolder Explorer Modal - Labels',
  {
    tag: ['@vfolder', '@functional', '@regression', '@requires-manager-v26.9'],
  },
  () => {
    let api: APIRequestContext | undefined;
    let folderId: string | undefined;
    let folderName: string | undefined;

    const createFolderAndOpenExplorer = async (page: Page) => {
      // Set before the create call so afterEach can find a folder whose
      // create response was lost.
      folderName = `e2e-test-folder-explorer-label-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      api = await createAccountApiContext(userInfo.user);
      const created = await api.post('/func/folders', {
        data: {
          name: folderName,
          host: await getE2EVFolderHost(),
          usage_mode: 'general',
          permission: 'rw',
        },
      });
      expect(created.ok()).toBeTruthy();
      folderId = (await created.json()).id;

      await navigateTo(page, `data?folder=${folderId}`);
      const modal = new FolderExplorerModal(page);
      await modal.waitForOpen();
      await modal.verifyFolderName(folderName);
      const dialog = page
        .getByRole('dialog')
        .filter({ has: page.getByRole('heading', { name: folderName }) });
      await expect(
        dialog.getByRole('button', { name: 'Metadata', exact: true }),
      ).toBeVisible();
      await expect(
        dialog.getByRole('term').filter({ hasText: /^Labels$/ }),
      ).toBeVisible({ timeout: 20000 });
      // Edit labels is a hover action of the Labels definition.
      const labelsRow = dialog
        .getByRole('definition')
        .filter({ has: page.getByRole('button', { name: 'Edit labels' }) });
      await labelsRow.hover();
      return {
        labelsRow,
        editButton: labelsRow.getByRole('button', { name: 'Edit labels' }),
      };
    };

    test.beforeEach(async ({ page, request }) => {
      api = undefined;
      folderId = undefined;
      folderName = undefined;
      await loginAsUser(page, request);
      await skipUnlessLabelableEntityType(
        page,
        'vfolder',
        'Folder labels require a manager that accepts vfolder labels (#10166)',
      );
    });

    test.afterEach(async () => {
      if (!api) return;
      const userApi = api;
      api = undefined;
      try {
        if (!folderId && folderName) {
          const list = await userApi.get('/func/folders').catch(() => null);
          const folders = list?.ok() ? await list.json() : [];
          folderId = folders.find(
            (folder: { name: string }) => folder.name === folderName,
          )?.id;
        }
        if (folderId) {
          for (const [method, path] of [
            ['delete', '/func/folders'],
            ['post', '/func/folders/delete-from-trash-bin'],
          ] as const) {
            const res = await userApi[method](path, {
              data: { vfolder_id: folderId },
            }).catch(() => null);
            if (!res?.ok()) {
              console.warn(
                `could not clean up folder ${folderId} (${path}, status=${res?.status()})`,
              );
            }
          }
        }
      } finally {
        await userApi.dispose();
      }
    });

    test('User can edit folder labels from the explorer Metadata tab', async ({
      page,
    }) => {
      const { labelsRow, editButton } = await createFolderAndOpenExplorer(page);
      await expect(labelsRow).toHaveText(/^-/);

      await editButton.click();
      const labelModal = page.getByRole('dialog', { name: 'Edit labels' });
      await expect(labelModal).toBeVisible();
      await labelModal.getByRole('textbox', { name: 'Key' }).fill('env');
      await labelModal.getByRole('textbox', { name: 'Value' }).fill('prod');
      await labelModal.getByRole('button', { name: 'Save' }).click();
      await expect(page.getByText('Labels saved.').first()).toBeVisible();
      await expect(labelModal).toBeHidden({ timeout: 30000 });

      // The tokens are display-only here, not filter buttons.
      await expect(
        labelsRow.getByText('env=prod', { exact: true }),
      ).toBeVisible({ timeout: 30000 });
    });

    test('User cannot edit labels of a folder without update permission in the explorer', async ({
      page,
    }) => {
      // Report the folder without UPDATE so the explorer treats it as a
      // folder the user may only read; this checks the UI gating only.
      await page.route('**/admin/gql', async (route) => {
        if (
          !(route.request().postData() ?? '').includes(
            'FolderExplorerModalV2Query',
          )
        ) {
          await route.fallback();
          return;
        }
        const response = await route.fetch();
        const body = await response.json();
        const node = body?.data?.vfolderNode;
        if (Array.isArray(node?.permissions)) {
          node.permissions = node.permissions.filter(
            (permission: string) => permission !== 'UPDATE',
          );
        }
        await route.fulfill({ response, json: body });
      });

      const { editButton } = await createFolderAndOpenExplorer(page);
      await expect(editButton).toBeDisabled();
    });
  },
);
