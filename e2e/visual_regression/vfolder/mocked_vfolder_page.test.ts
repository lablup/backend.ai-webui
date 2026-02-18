/**
 * Mocked VFolder Page Visual Regression Tests
 *
 * These tests render the VFolder (Data) page using Playwright network interception
 * to mock ALL Backend.AI REST and GraphQL endpoints. No real cluster is needed.
 *
 * Mock data includes 3 deterministic vfolders:
 * - my-dataset (user, general, rw)
 * - shared-models (group, model, ro)
 * - .automount-config (user, general, rw)
 *
 * Screenshots should be pixel-stable across runs (modulo font rendering).
 */
import { mockLogin } from '../../mocks/mock-api';
import { navigateTo } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.describe(
  'Mocked VFolder - User Role',
  { tag: ['@regression', '@visual', '@mocked'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await page.setViewportSize({ width: 1500, height: 1200 });
      await mockLogin(page, request, { role: 'user' });
      await navigateTo(page, 'data');
      // Wait for the Folder Status panel card to be visible (indicates page loaded)
      await expect(page.getByText('Folder Status')).toBeVisible({
        timeout: 15_000,
      });
    });

    test('vfolder full page - user', async ({ page }) => {
      // Wait for network to settle (data page fetches multiple endpoints)
      await page.waitForLoadState('networkidle');
      // Additional wait for any CSS transitions / skeleton fade-out
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('mocked_vfolder_user.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.07,
      });
    });

    test('create folder modal', async ({ page }) => {
      await page.waitForLoadState('networkidle');

      // Remove webpack dev server overlay that intercepts pointer events
      await page.evaluate(() => {
        const overlay = document.getElementById(
          'webpack-dev-server-client-overlay',
        );
        if (overlay) overlay.remove();
      });

      // Click the "Create Folder" button in the Folders card header
      // There are two "Create Folder" buttons; use the primary button in the card extra
      await page.getByRole('button', { name: 'Create Folder' }).first().click();

      // Wait for the modal dialog to appear
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 10_000 });

      // Wait for form content to load (storage host select, etc.)
      await page.waitForTimeout(1000);

      await expect(dialog).toHaveScreenshot('mocked_create_folder_modal.png', {
        maxDiffPixelRatio: 0.07,
      });
    });

    test('folder explorer modal', async ({ page }) => {
      await page.waitForLoadState('networkidle');

      // Remove webpack dev server overlay that intercepts pointer events
      await page.evaluate(() => {
        const overlay = document.getElementById(
          'webpack-dev-server-client-overlay',
        );
        if (overlay) overlay.remove();
      });

      // Click the first folder name link to open the explorer modal
      await page.getByRole('link', { name: 'my-dataset' }).click();

      // Wait for FolderExplorerModalQuery and file listing REST calls to complete
      await page.waitForLoadState('networkidle');

      // Wait for the folder explorer modal dialog to appear
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 15_000 });

      // Wait for file listing to render (4 mock items: models/, README.md, config.yaml, train.py)
      await expect(dialog.getByText('README.md')).toBeVisible({
        timeout: 10_000,
      });

      // Select the "train.py" file by clicking its row checkbox
      const trainPyRow = dialog.getByRole('row', { name: /train\.py/ });
      await trainPyRow.getByRole('checkbox').click();

      // Wait for selection UI to settle
      await page.waitForTimeout(1000);

      await expect(dialog).toHaveScreenshot(
        'mocked_folder_explorer_modal.png',
        {
          maxDiffPixelRatio: 0.07,
        },
      );
    });

    test('invite folder setting modal', async ({ page }) => {
      await page.waitForLoadState('networkidle');

      // Remove webpack dev server overlay that intercepts pointer events
      await page.evaluate(() => {
        const overlay = document.getElementById(
          'webpack-dev-server-client-overlay',
        );
        if (overlay) overlay.remove();
      });

      // Click the Share button on the first owned folder row (my-dataset)
      // The share button has tooltip "Share" and is in each row's action column
      const myDatasetRow = page.getByRole('row', { name: /my-dataset/ });
      await myDatasetRow.getByRole('button', { name: 'Share' }).click();

      // Wait for the modal dialog to appear
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 10_000 });

      // Wait for invitee list to load (2 mock invitees)
      await expect(dialog.getByText('invited-reader@lablup.com')).toBeVisible({
        timeout: 10_000,
      });

      // Wait for UI to settle
      await page.waitForTimeout(1000);

      await expect(dialog).toHaveScreenshot('mocked_invite_folder_modal.png', {
        maxDiffPixelRatio: 0.07,
      });
    });
  },
);
