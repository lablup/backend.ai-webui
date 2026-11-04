import { FolderCreationModal } from '../utils/classes/vfolder/FolderCreationModal';
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import {
  getVFolderRow,
  loginAsUser,
  navigateTo,
  selectPropertyFilter,
} from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

/**
 * The folder creation modal has no Type (User/Project) radio: every folder is
 * created as a project folder of the page's project (#10501).
 */

/** Picks a project in the header project selector and returns its URL slug. */
async function switchProject(
  page: Page,
  group: 'General' | 'Personal',
  projectName?: string,
): Promise<string> {
  const selector = page.getByRole('button', { name: 'Select Project' });
  await expect(selector).toBeVisible({ timeout: 15000 });
  const previousSlug = new URL(page.url()).pathname.split('/')[2];
  await selector.click();
  const options = page
    .getByRole('listbox', { name: 'Select Project' })
    .getByRole('group', { name: group })
    .getByRole('option', projectName ? { name: projectName, exact: true } : {});
  await expect(options.first()).toBeVisible({ timeout: 15000 });
  const optionName = (await options.first().innerText()).trim();
  await options.first().click();
  await expect(selector).toHaveText(optionName);
  // The header label updates before navigation commits; wait for the URL to
  // reach the other project's Data page.
  await expect(page).toHaveURL((url) => {
    const [, segment, slug, subPath] = url.pathname.split('/');
    return segment === 'project' && subPath === 'data' && slug !== previousSlug;
  });
  return new URL(page.url()).pathname.split('/')[2];
}

test.describe(
  'VFolder ownership by page context',
  { tag: ['@vfolder', '@functional'] },
  () => {
    // #10501: Auto Mount folders are personal, so the Data page offers the
    // mode only while the personal project is selected.
    test.describe(
      'Auto Mount availability by project (Data page)',
      { tag: ['@regression', '@requires-manager-v26.9'] },
      () => {
        let folderName: string;
        let sharedProject: string;
        let personalProjectSlug: string | undefined;

        test.beforeEach(async ({ page, request }, testInfo) => {
          folderName = `.e2e-test-personal-automount-${Date.now()}-${testInfo.workerIndex}`;
          personalProjectSlug = undefined;
          sharedProject = '';
          await loginAsUser(page, request);
          await navigateTo(page, 'data');
          sharedProject = (
            await page
              .getByRole('button', { name: 'Select Project' })
              .innerText()
          ).trim();
        });

        test.afterEach(async ({ page }) => {
          if (personalProjectSlug) {
            await cleanupVFolderSafely(
              page,
              folderName,
              `project/${personalProjectSlug}/data`,
            );
          }
          // Leave the user on the shared project the other specs expect.
          if (sharedProject) {
            await navigateTo(page, `project/${sharedProject}/data`);
          }
        });

        test('User can create an Auto Mount folder only in the personal project', async ({
          page,
        }) => {
          personalProjectSlug = await switchProject(page, 'Personal');
          await page
            .getByRole('button', { name: 'Create Folder' })
            .first()
            .click();
          const modal = new FolderCreationModal(page);
          await modal.modalToBeVisible();
          const autoMountRadio = await modal.getAutoMountUsageModeRadio();
          await expect(autoMountRadio).toBeVisible();
          await autoMountRadio.check();
          await expect(autoMountRadio).toBeChecked();
          await modal.fillFolderName(folderName);
          await (await modal.getCreateButton()).click();
          await expect(
            page.getByRole('dialog', { name: 'Create a new storage folder' }),
          ).toBeHidden({ timeout: 30000 });

          await page.getByRole('radio', { name: 'Auto Mount' }).check();
          await selectPropertyFilter(page, 'Name', folderName);
          await expect(getVFolderRow(page, folderName)).toBeVisible({
            timeout: 20000,
          });

          await switchProject(page, 'General', sharedProject);
          await page
            .getByRole('button', { name: 'Create Folder' })
            .first()
            .click();
          await modal.modalToBeVisible();
          await expect(await modal.getGeneralUsageModeRadio()).toBeVisible();
          await expect(await modal.getAutoMountUsageModeRadio()).toHaveCount(0);
          await (await modal.getCancelButton()).click();
        });
      },
    );
  },
);
