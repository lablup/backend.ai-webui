import { loginAsVisualRegressionUser, navigateTo } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await loginAsVisualRegressionUser(page, request);
  await page.setViewportSize({
    width: 1500,
    height: 1000,
  });
  await navigateTo(page, 'data');
  await page.getByText('This storage backend').waitFor();
});

test.describe(
  'Vfolder page Visual Regression Test',
  { tag: ['@regression', '@vfolder', '@visual'] },
  () => {
    test('Full page', async ({ page }) => {
      await expect(page).toHaveScreenshot('vfolder_page.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });

    // FIXME: Modal not visible - dialog locator times out
    // The modal might not render or the Create Folder button flow has changed
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
      // FIXME: Test timeout - 'model_folder' link cannot be clicked
      // The test folder might not exist or the link locator changed
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

      // FIXME: Test timeout - 'model_folder' row button cannot be clicked
      // The test folder might not exist or the row locator changed
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
