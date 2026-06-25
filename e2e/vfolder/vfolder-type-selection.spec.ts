import { FolderCreationModal } from '../utils/classes/vfolder/FolderCreationModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import {
  getClientProperty,
  skipUnlessAllowedVFolderType,
} from '../utils/feature-gate-util';
import { loginAsAdmin, loginAsUser, navigateTo } from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

/**
 * Navigate to the regular Data page and open the Create Folder modal.
 * Used by user-role tests where only the User-type radio should be visible.
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
 * Folder modal. This page uses folderType="project" which renders both the User
 * and Project type radios, making it the correct page for admin Project-type
 * vfolder tests.
 *
 * Note: On the /data page (VFolderNodeListPage), allowCreateProjectFolder is
 * false (default), so the Project radio never renders — even for admin users.
 * The /project-data page (ProjectAdminDataPage) uses folderType="project" which
 * satisfies the rendering condition in FolderCreateModalV2.
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
  'VFolder Type Selection',
  { tag: ['@vfolder', '@functional'] },
  () => {
    test.describe('User-type vfolder creation', () => {
      let folderName: string;

      test.beforeEach(async ({ page, request }, testInfo) => {
        folderName = `e2e-test-user-type-folder-${Date.now()}-${testInfo.workerIndex}`;
        await loginAsUser(page, request);
      });

      test.afterEach(async ({ page }) => {
        await cleanupVFolderSafely(page, folderName);
      });

      test('User can create a User-type vfolder with default selection', async ({
        page,
      }) => {
        const modal = await openCreateFolderModal(page);
        await modal.fillFolderName(folderName);

        // User-type radio should be visible and selected by default
        const userTypeRadio = await modal.getUserTypeRadio();
        await expect(userTypeRadio).toBeVisible();
        await expect(userTypeRadio).toBeChecked();

        await (await modal.getCreateButton()).click();
      });
    });

    test.describe('Project-type vfolder creation (admin)', () => {
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
        'Admin can create a Project-type vfolder',
        { tag: ['@requires-vfolder-type-group'] },
        async ({ page }) => {
          // Declarative environment gate (FR-3114): Project-type vfolders are
          // only offered when the cluster's etcd `volumes/_types` config
          // includes 'group' (FolderCreateModal reads it via
          // `baiClient.vfolder.list_allowed_types()`).
          await skipUnlessAllowedVFolderType(
            page,
            'group',
            "Project-type vfolder creation requires the 'group' vfolder type in the cluster's etcd `volumes/_types` config (@requires-vfolder-type-group)",
          );

          const modal = await openCreateFolderModalAsAdmin(page);
          await modal.fillFolderName(folderName);

          // The environment allows 'group' — the Project-type radio MUST be
          // present and selectable; a disabled radio here is a real failure.
          const projectTypeRadio = await modal.getProjectTypeRadio();
          await expect(projectTypeRadio).toBeVisible();
          await expect(projectTypeRadio).toBeEnabled();

          await projectTypeRadio.check();
          await expect(projectTypeRadio).toBeChecked();

          await (await modal.getCreateButton()).click();
        },
      );
    });

    test.describe('Project radio disabled states (admin)', () => {
      let folderName: string;

      test.beforeEach(async ({ page, request }, testInfo) => {
        folderName = `e2e-test-disabled-project-type-${Date.now()}-${testInfo.workerIndex}`;
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

      test('Project radio is disabled when usage mode is model (non-model-store project)', async ({
        page,
      }) => {
        // Declarative environment gate (FR-3114): this disabled-state
        // assertion only holds when the admin's active project is NOT the
        // model-store project (`FolderCreateModal` enables the Project radio
        // in model mode when `currentProject.name === 'model-store'`). Gate
        // on the actual capability source (`baiClient.current_group`) instead
        // of probing the radio's enabled state.
        const currentProjectName = await getClientProperty(
          page,
          'current_group',
        );
        test.skip(
          currentProjectName === 'model-store',
          "Disabled-state assertion assumes a non-model-store project; the admin's active project is the model-store project.",
        );

        const modal = new FolderCreationModal(page);
        await modal.modalToBeVisible();
        await modal.fillFolderName(folderName);

        // Select model usage mode
        const modelUsageModeRadio = await modal.getModelUsageModeRadio();
        await modelUsageModeRadio.check();
        await expect(modelUsageModeRadio).toBeChecked();

        // Project-type radio should be visible for admin
        const projectTypeRadio = await modal.getProjectTypeRadio();
        await expect(projectTypeRadio).toBeVisible();

        // Project radio should be disabled when model mode is selected
        // and current project is not model-store
        await expect(projectTypeRadio).toBeDisabled();

        // Hover the project radio label to surface its tooltip. Ant Design's
        // disabled wrapper intercepts pointer events, so force the hover.
        const typeFormItem = await modal.getTypeFormItem();
        const projectRadioLabel = typeFormItem.locator(
          '[data-testid="project-type"]',
        );
        await projectRadioLabel.hover({ force: true });

        // Cancel the modal since we're only testing the disabled state
        await (await modal.getCancelButton()).click();
      });

      test('Project radio is disabled when usage mode is automount', async ({
        page,
      }) => {
        // The Project-type radio is only exposed via the /project-data page
        // (ProjectAdminDataPage with folderType="project"). On that page the
        // Auto Mount usage-mode radio is itself disabled (folderType="project"
        // disables it in FolderCreateModalV2), so we cannot drive the UI into
        // the automount state to verify this interaction. There is no other
        // page in the current app where both the Project radio is visible and
        // the automount radio is selectable.
        test.fixme(
          true,
          'Automount radio is disabled on /project-data (folderType="project"), ' +
            'preventing selection needed to assert project-radio disabled state.',
        );

        const modal = new FolderCreationModal(page);
        await modal.modalToBeVisible();
        await modal.fillFolderName(folderName);

        // Select auto mount usage mode
        const autoMountRadio = await modal.getAutoMountUsageModeRadio();
        await autoMountRadio.check();
        await expect(autoMountRadio).toBeChecked();

        // Project-type radio should be visible for admin
        const projectTypeRadio = await modal.getProjectTypeRadio();
        await expect(projectTypeRadio).toBeVisible();

        // Project radio should be disabled when automount mode is selected
        await expect(projectTypeRadio).toBeDisabled();

        // Cancel the modal since we're only testing the disabled state
        await (await modal.getCancelButton()).click();
      });

      test('Project radio is enabled when usage mode is general', async ({
        page,
      }) => {
        const modal = new FolderCreationModal(page);
        await modal.modalToBeVisible();
        await modal.fillFolderName(folderName);

        // General mode should be selected by default
        const generalUsageModeRadio = await modal.getGeneralUsageModeRadio();
        await expect(generalUsageModeRadio).toBeChecked();

        // Project-type radio should be enabled for admin in general mode
        const projectTypeRadio = await modal.getProjectTypeRadio();
        await expect(projectTypeRadio).toBeVisible();
        await expect(projectTypeRadio).not.toBeDisabled();

        // Cancel the modal
        await (await modal.getCancelButton()).click();
      });
    });

    test.describe('Type field visibility per role', () => {
      test('Regular user sees only User-type radio (no Project radio)', async ({
        page,
        request,
      }) => {
        await loginAsUser(page, request);
        const modal = await openCreateFolderModal(page);

        // User-type radio should be visible
        const typeFormItem = await modal.getTypeFormItem();
        const userTypeRadio = typeFormItem.locator('[data-testid="user-type"]');
        await expect(userTypeRadio).toBeVisible();

        // Project-type radio should NOT be visible for regular users
        const projectTypeRadio = typeFormItem.locator(
          '[data-testid="project-type"]',
        );
        await expect(projectTypeRadio).toBeHidden();

        await (await modal.getCancelButton()).click();
      });

      test('Admin sees both User-type and Project-type radios', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        const modal = await openCreateFolderModalAsAdmin(page);

        // Both type radios should be visible for admin
        const userTypeRadio = await modal.getUserTypeRadio();
        await expect(userTypeRadio).toBeVisible();

        const projectTypeRadio = await modal.getProjectTypeRadio();
        await expect(projectTypeRadio).toBeVisible();

        await (await modal.getCancelButton()).click();
      });
    });
  },
);
