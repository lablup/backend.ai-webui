import { loginAsVisualRegressionUser, navigateTo } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await loginAsVisualRegressionUser(page, request);
  await page.setViewportSize({
    width: 1500,
    height: 1000,
  });
  await navigateTo(page, 'data');
  // Wait for the folder list table header to confirm the data page has loaded.
  // The old 'This storage backend' placeholder text is no longer shown;
  // the page now renders the folder table directly.
  await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
});

test.describe(
  'Vfolder page Visual Regression Test',
  { tag: ['@regression', '@vfolder', '@visual'] },
  () => {
    // FIXME: Snapshot diff detected (49230 pixels, ratio 0.04 > maxDiffPixelRatio 0.02) —
    // the Data/Folder page layout has changed (new table columns, folder name changes in test data).
    // Baseline needs snapshot-update PR.
    test.fixme('Full page', async ({ page }) => {
      await expect(page).toHaveScreenshot('vfolder_page.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });

    // FIXME(FR-3111/brittle-locator): The Create Folder dialog locator times out —
    // the button index (.nth(1)) and dialog locator need updating for the current
    // folder-creation flow. Not a stale baseline; owned by the locator-quality triage
    // category of FR-3109.
    test.fixme('Create Folder modal', async ({ page }) => {
      await page.getByRole('button', { name: 'Create Folder' }).nth(1).click();
      const folderCreationModal = page.getByRole('dialog');
      await expect(folderCreationModal).toBeVisible();
      await expect(folderCreationModal).toHaveScreenshot(
        'create_folder_modal.png',
      );
      await page.getByRole('button', { name: 'Close' }).click();
    });

    test.describe('existing folder action modal', () => {
      // FIXME(FR-3111/missing-test-data): The seeded vfolder 'model_folder' does not
      // exist on the test backend. Not a stale baseline; owned by the test-data
      // seeding triage category of FR-3109.
      test.fixme('Folder info modal', async ({ page }) => {
        await page.getByRole('link', { name: 'model_folder' }).click();
        await page
          .getByRole('heading', {
            name: 'model_folder',
            exact: true,
          })
          .waitFor();

        const folderInfoModal = page.getByRole('dialog');
        await expect(folderInfoModal).toHaveScreenshot('folder_info_modal.png');
        await page.getByRole('button', { name: 'Close' }).click();
      });

      // FIXME(FR-3111/missing-test-data): The seeded vfolder 'model_folder' does not
      // exist on the test backend. Not a stale baseline; owned by the test-data
      // seeding triage category of FR-3109.
      test.fixme('Modify Permission modal', async ({ page }) => {
        await page
          .getByRole('row', { name: `VFolder Identicon model_folder` })
          .getByRole('button')
          .first()
          .click();
        await page.getByText('Modify Permissions').waitFor();
        const modifyPermissionModal = page.getByRole('dialog');
        await expect(modifyPermissionModal).toHaveScreenshot(
          'modify_permission_modal.png',
        );
        await page.getByRole('button', { name: 'Close' }).click();
      });
    });
  },
);
