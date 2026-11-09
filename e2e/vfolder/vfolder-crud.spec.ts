import { FolderCreationModal } from '../utils/classes/vfolder/FolderCreationModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import { getE2EVFolderHost } from '../utils/e2e-scope';
import { skipUnlessLabelableEntityType } from '../utils/feature-gate-util';
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
  selectPropertyFilter,
  shareVFolderAndVerify,
  userInfo,
} from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

// The Labels column on the Data page starts hidden; turn it on through Table
// Settings.
async function showLabelsColumn(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Table Settings' }).click();
  const settings = page
    .getByRole('dialog')
    .filter({ has: page.getByRole('checkbox', { name: 'Labels' }) });
  await expect(settings).toBeVisible();
  await settings.getByRole('checkbox', { name: 'Labels' }).setChecked(true);
  await settings.getByRole('button', { name: 'Apply' }).click();
  await expect(settings).toBeHidden({ timeout: 30000 });
}

async function fillLabelAndSave(
  page: Page,
  dialogTitle: string | RegExp,
  key: string,
  value: string,
): Promise<void> {
  const modal = page.getByRole('dialog', { name: dialogTitle });
  await expect(modal).toBeVisible();
  await modal.getByRole('textbox', { name: 'Key' }).fill(key);
  await modal.getByRole('textbox', { name: 'Value' }).fill(value);
  await modal.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Labels saved.').first()).toBeVisible();
  await expect(modal).toBeHidden({ timeout: 30000 });
}

// Waits for the folder list query `action` triggers and for the grid to
// leave its busy state, since the page keeps showing the previous rows while
// the deferred refetch is in flight.
async function settleFolderListAfter(
  page: Page,
  action: () => Promise<void>,
): Promise<void> {
  const refetch = page.waitForResponse(
    (response) =>
      (response.request().postData() ?? '').includes(
        'VFolderNodeListPageQuery',
      ),
    { timeout: 20000 },
  );
  await action();
  await refetch;
  await expect(
    page.locator('.uic-data-grid__body[aria-busy="true"]'),
  ).toHaveCount(0, { timeout: 20000 });
}

const uniqueSuffix = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

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
        // A host the user is actually allowed (not `local` on every cluster).
        const host = await getE2EVFolderHost(userInfo.user);
        await folderCreationModal.fillLocationSelector(host);
        await folderCreationModal.selectLocationOptionByText(host);
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
      // #10501: a folder created in a general project is a project folder its
      // members can see, so creation asks for confirmation first.
      test('User can create a project folder in a general project after confirming its visibility', async ({
        page,
      }) => {
        // A saved "Don't ask again" on the shared account would skip the
        // confirm modal; report it unset without touching the stored value.
        await page.route('**/admin/gql', async (route) => {
          if (
            !(route.request().postData() ?? '').includes('useAppConfigMyQuery')
          ) {
            await route.fallback();
            return;
          }
          const response = await route.fetch();
          const body = await response.json();
          for (const entry of body?.data?.myAppConfigs ?? []) {
            if (entry?.configName !== 'userConfig') continue;
            const isString = typeof entry.config === 'string';
            const config = isString
              ? JSON.parse(entry.config || '{}')
              : (entry.config ?? {});
            config.skip_project_folder_confirm = false;
            entry.config = isString ? JSON.stringify(config) : config;
          }
          await route.fulfill({ response, json: body });
        });
        // Reload so the modal reads the config through the route.
        await page.reload();
        await page
          .getByRole('button', { name: 'Create Folder' })
          .first()
          .click();
        const currentProject = (
          await page.getByRole('button', { name: 'Select Project' }).innerText()
        ).trim();
        const folderCreationModal = new FolderCreationModal(page);
        await folderCreationModal.modalToBeVisible();
        const creationDialog = page
          .getByRole('dialog', { name: 'Create a new storage folder' })
          .filter({ has: page.getByTestId('create-folder-button') });
        await expect(
          creationDialog.getByRole('status').filter({
            hasText: "can be seen by the project's other members",
          }),
        ).toBeVisible();
        await folderCreationModal.fillFolderName(creationFolderName);
        await (await folderCreationModal.getCreateButton()).click();

        const confirmModal = page.getByTestId('shared-folder-confirm-modal');
        await expect(confirmModal).toBeVisible();
        await expect(confirmModal).toContainText(
          'Other members of this project will also be able to see this folder.',
        );
        await expect(
          confirmModal.getByRole('checkbox', { name: "Don't ask again" }),
        ).not.toBeChecked();
        await confirmModal
          .getByRole('button', { name: 'Create', exact: true })
          .click();
        await expect(confirmModal).toBeHidden();
        await expect(creationDialog).toBeHidden({ timeout: 30000 });

        const folderRow = getVFolderRow(page, creationFolderName);
        await expect(folderRow).toBeVisible({ timeout: 20000 });
        await folderRow
          .getByRole('link', { name: creationFolderName, exact: true })
          .click();
        const folderInfo = page.getByRole('dialog').filter({
          has: page.getByRole('heading', { name: creationFolderName }),
        });
        await expect(folderInfo).toBeVisible();
        const definitionOf = (term: string) =>
          folderInfo
            .getByRole('term')
            .filter({ hasText: new RegExp(`^${term}$`) })
            .locator('xpath=following-sibling::*[1]');
        await expect(definitionOf('Ownership')).toHaveText('Project');
        await expect(definitionOf('Project')).toHaveText(currentProject);
        await page.keyboard.press('Escape');
        await expect(folderInfo).toBeHidden();
      });
    });
    // Not serial: single test — it creates no folder.
    test.describe('vFolder Creation modal', () => {
      test('User can reopen the folder creation modal with an empty form after canceling', async ({
        page,
      }) => {
        await page.getByRole('link', { name: 'Data' }).click();
        const createFolderButton = page
          .getByRole('button', { name: 'Create Folder' })
          .first();
        await createFolderButton.click();
        const folderCreationModal = new FolderCreationModal(page);
        await folderCreationModal.modalToBeVisible();
        await folderCreationModal.fillFolderName(
          `e2e-test-folder-cancel-${uniqueSuffix()}`,
        );
        await (await folderCreationModal.getCancelButton()).click();
        await expect(
          page.getByRole('dialog', { name: 'Create a new storage folder' }),
        ).toBeHidden();

        await createFolderButton.click();
        await folderCreationModal.modalToBeVisible();
        await expect(
          await folderCreationModal.getFolderNameInput(),
        ).toHaveValue('');
        await (await folderCreationModal.getCancelButton()).click();
      });
    });
    // Auto Mount uses a dedicated folder name (dot-prefixed) that is independent.
    // Not serial: single test — no ordering dependency.
    // #10501: Auto Mount is offered only while the personal project is selected.
    test.describe('Auto Mount vFolder Creation', () => {
      const folderName = '.e2e-test-folder-auto-mount' + new Date().getTime();
      let sharedProject = '';
      let personalProjectSlug: string | undefined;
      test.beforeEach(async ({ page }) => {
        personalProjectSlug = undefined;
        await page.getByRole('link', { name: 'Data' }).click();
        const projectSelector = page.getByRole('button', {
          name: 'Select Project',
        });
        await expect(projectSelector).toBeVisible({ timeout: 15000 });
        sharedProject = (await projectSelector.innerText()).trim();
        const previousSlug = new URL(page.url()).pathname.split('/')[2];
        await projectSelector.click();
        const personalOption = page
          .getByRole('listbox', { name: 'Select Project' })
          .getByRole('group', { name: 'Personal' })
          .getByRole('option')
          .first();
        await expect(personalOption).toBeVisible({ timeout: 15000 });
        await personalOption.click();
        await expect(page).toHaveURL((url) => {
          const [, segment, slug, subPath] = url.pathname.split('/');
          return (
            segment === 'project' && subPath === 'data' && slug !== previousSlug
          );
        });
        personalProjectSlug = new URL(page.url()).pathname.split('/')[2];
        await page
          .getByRole('button', { name: 'Create Folder' })
          .first()
          .click();
      });
      test.afterEach(async ({ page }) => {
        if (personalProjectSlug) {
          await cleanupVFolderSafely(
            page,
            folderName,
            `project/${personalProjectSlug}/data`,
          );
        }
        // Leave the user on the shared project the other tests expect.
        if (sharedProject) {
          await navigateTo(page, `project/${sharedProject}/data`);
        }
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
        await expect(
          page.getByRole('dialog', { name: 'Create a new storage folder' }),
        ).toBeHidden({ timeout: 30000 });
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

    test('Invitee can leave a shared vFolder', async ({
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

// Entity labels on the Data page added in #10166: editing a folder's labels,
// filtering by a label token, and the bulk Add labels action.
// Not serial: each test creates its own uniquely named folders and removes
// them in afterEach.
test.describe(
  'VFolder Labels',
  {
    tag: ['@vfolder', '@functional', '@regression', '@requires-manager-v26.9'],
  },
  () => {
    test.setTimeout(240_000);
    let labelFolderNames: string[];

    test.beforeEach(async ({ page, request }) => {
      labelFolderNames = [];
      await loginAsUser(page, request);
      await skipUnlessLabelableEntityType(
        page,
        'vfolder',
        'Folder labels require a manager that accepts vfolder labels (#10166)',
      );
    });

    test.afterEach(async ({ page }) => {
      for (const name of labelFolderNames) {
        await cleanupVFolderSafely(page, name);
      }
    });

    test('User can edit labels on a folder and filter the list by a label', async ({
      page,
    }) => {
      const folderName = `e2e-test-folder-label-${uniqueSuffix()}`;
      labelFolderNames.push(folderName);
      await createVFolderAndVerify(page, folderName);

      await navigateTo(page, 'data');
      await showLabelsColumn(page);
      await selectPropertyFilter(page, 'Name', folderName);
      const row = getVFolderRow(page, folderName);
      await expect(row).toBeVisible({ timeout: 30000 });

      // Act: Edit labels is a hover action whose area has no width until its
      // cell is hovered.
      await row
        .getByRole('cell')
        .filter({ has: page.getByRole('button', { name: 'Edit labels' }) })
        .hover();
      await row.getByRole('button', { name: 'Edit labels' }).click();
      await fillLabelAndSave(page, 'Edit labels', 'env', 'prod');

      const labelToken = row.getByRole('button', {
        name: 'env=prod',
        exact: true,
      });
      await expect(labelToken).toBeVisible({ timeout: 30000 });

      // Clicking the token filters the list by that label.
      await settleFolderListAfter(page, () => labelToken.click());
      const filterGroup = page
        .getByRole('group', { name: 'Search filters' })
        .first();
      await expect(
        filterGroup.getByRole('button', { name: /^Label key/ }),
      ).toBeVisible();
      await expect(
        filterGroup.getByRole('button', { name: /^Label value/ }),
      ).toBeVisible();
      await expect(row).toBeVisible({ timeout: 30000 });
      const rows = page.locator('tbody tr').filter({ hasText: /\S/ });
      await expect(async () => {
        const texts = await rows.allTextContents();
        expect(texts.length).toBeGreaterThan(0);
        for (const text of texts) {
          expect(text).toContain('env=prod');
        }
      }).toPass({ timeout: 30000 });
    });

    test('User can add labels to multiple selected folders', async ({
      page,
    }) => {
      const suffix = uniqueSuffix();
      const prefix = `e2e-test-folder-bulk-label-${suffix}`;
      labelFolderNames.push(`${prefix}-a`, `${prefix}-b`);
      for (const name of labelFolderNames) {
        await createVFolderAndVerify(page, name);
      }
      const labelValue = suffix.slice(-11);

      await navigateTo(page, 'data');
      await showLabelsColumn(page);
      await selectPropertyFilter(page, 'Name', prefix);
      const rows = labelFolderNames.map((name) => getVFolderRow(page, name));
      for (const row of rows) {
        await expect(row).toBeVisible({ timeout: 30000 });
        await row.getByRole('checkbox').check();
      }

      // Act: add one label to both through the selection toolbar.
      await page.getByRole('button', { name: 'Add labels' }).click();
      await fillLabelAndSave(
        page,
        'Add labels (2 selected)',
        'e2e-bulk',
        labelValue,
      );

      for (const row of rows) {
        await expect(
          row.getByRole('button', {
            name: `e2e-bulk=${labelValue}`,
            exact: true,
          }),
        ).toBeVisible({ timeout: 30000 });
      }
    });
  },
);
