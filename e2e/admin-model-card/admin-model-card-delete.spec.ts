// spec: e2e/.agent-output/test-plan-admin-model-card.md
// section: 5. Delete Model Card
import { AdminModelCardPage } from '../utils/classes/AdminModelCardPage';
import {
  deleteForeverAndVerifyFromTrash,
  loginAsAdmin,
  moveToTrashAndVerify,
  webuiEndpoint,
} from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'Admin Model Card Management - Delete',
  { tag: ['@admin-model-card', '@admin', '@crud'] },
  () => {
    test.setTimeout(60000);

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    // 5.1 Superadmin can delete a model card via the trash icon with confirmation
    test('Superadmin can delete a model card via the trash icon with confirmation', async ({
      page,
    }) => {
      test.setTimeout(90000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const folderName = `e2e-test-delete-single-folder-${timestamp}`;
      const cardName = `e2e-test-delete-single-${timestamp}`;

      // Setup: create a dedicated folder and model card
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardName,
        createNewFolderName: folderName,
      });

      // Navigate back and find the row
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(cardName);

      // Click the trash icon
      await adminModelCardPage.clickDeleteForRow(cardName);

      const confirmDialog = adminModelCardPage.getDeleteConfirmDialog();

      // Verify the confirmation dialog shows description and item name
      await expect(
        confirmDialog.getByText(/Are you sure you want to delete/),
      ).toBeVisible();
      await expect(
        confirmDialog.getByText(cardName, { exact: true }).first(),
      ).toBeVisible();
      await expect(
        confirmDialog.getByText('This action cannot be undone.'),
      ).toBeVisible();

      // Verify the Delete (danger) button and Cancel button exist
      await expect(adminModelCardPage.getDeleteConfirmButton()).toBeVisible();
      await expect(adminModelCardPage.getDeleteCancelButton()).toBeVisible();

      // The "Also delete folder" checkbox should be visible (card has an associated folder)
      await expect(
        adminModelCardPage.getAlsoDeleteFolderCheckbox(),
      ).toBeVisible();

      // Type card name to confirm (requireConfirmInput is set on the single-delete modal)
      await adminModelCardPage.getDeleteConfirmInput().fill(cardName);

      // Click Delete to confirm (leave folder checkbox unchecked — folder cleanup handled separately)
      await adminModelCardPage.getDeleteConfirmButton().click();

      // Verify success message
      await expect(page.getByText(/Model card has been deleted/)).toBeVisible({
        timeout: 15000,
      });

      // Verify the row is no longer in the table
      await expect(adminModelCardPage.getPaginationInfo()).toContainText(
        '0 items',
      );

      // Cleanup: move folder to trash then permanently delete
      await moveToTrashAndVerify(page, folderName, 'admin-data');
      await deleteForeverAndVerifyFromTrash(page, folderName, 'admin-data');
    });

    // 5.2 Superadmin can cancel a single-delete confirmation without deleting
    test('Superadmin can cancel a single-delete confirmation without deleting', async ({
      page,
    }) => {
      test.setTimeout(90000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const folderName = `e2e-test-no-delete-folder-${timestamp}`;
      const cardName = `e2e-test-no-delete-${timestamp}`;

      // Setup: create a dedicated folder and model card
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardName,
        createNewFolderName: folderName,
      });

      // Navigate back and filter
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(cardName);

      // Click trash icon
      await adminModelCardPage.clickDeleteForRow(cardName);

      // Click Cancel in the confirmation dialog
      await adminModelCardPage.getDeleteCancelButton().click();

      // Verify the dialog closes
      await expect(adminModelCardPage.getDeleteConfirmDialog()).toBeHidden();

      // Verify the model card is still in the table
      await expect(adminModelCardPage.getRowByName(cardName)).toBeVisible();

      // Cleanup: delete card only, then move folder to trash and permanently delete
      await adminModelCardPage.deleteModelCardByName(cardName);
      await moveToTrashAndVerify(page, folderName, 'admin-data');
      await deleteForeverAndVerifyFromTrash(page, folderName, 'admin-data');
    });

    // 5.3 Superadmin can select multiple model cards and delete them in bulk
    test('Superadmin can select multiple model cards and delete them in bulk', async ({
      page,
    }) => {
      test.setTimeout(300000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const folderName = `e2e-test-bulk-delete-folder-${timestamp}`;
      const filterPrefix = `e2e-test-bulk-delete-${timestamp}`;
      const cardNames = [`${filterPrefix}-1`, `${filterPrefix}-2`];

      // Setup: create a shared folder via the "+" button for the first card,
      // then reuse it for the second card
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[0],
        createNewFolderName: folderName,
      });

      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[1],
        vfolderTitle: folderName,
      });

      // Filter to show only this run's test cards (timestamp ensures uniqueness)
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(filterPrefix);
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible({
        timeout: 30000,
      });

      // Check the header checkbox to select all visible rows
      await adminModelCardPage.getHeaderCheckbox().check();

      // Verify the BAISelectionLabel appears showing selected count
      await expect(adminModelCardPage.getSelectionLabel()).toBeVisible();

      // Click the bulk delete button (danger trash button scoped to bulk-action area)
      await adminModelCardPage.getBulkDeleteButton().click();

      // Verify a confirmation dialog appears with bulk delete message and item list
      const bulkDialog = adminModelCardPage.getBulkDeleteConfirmDialog();
      await expect(bulkDialog).toBeVisible();
      await expect(
        bulkDialog.getByText(/Are you sure you want to delete/),
      ).toBeVisible();
      await expect(
        bulkDialog.getByText('This action cannot be undone.'),
      ).toBeVisible();
      // Verify each card name is listed in the dialog
      for (const name of cardNames) {
        await expect(bulkDialog.getByText(name)).toBeVisible();
      }

      // Type "Delete" in the confirmation input (required for bulk delete)
      await bulkDialog.getByRole('textbox').fill('Delete');

      // Click Delete to confirm
      await bulkDialog.getByRole('button', { name: 'Delete' }).click();

      // Wait for the success toast — under parallel-test load the bulk deletion
      // can be slow, so wait on the visible outcome rather than polling the dialog.
      await expect(
        page.getByText(/\d+ model card\(s\) have been deleted\./i),
      ).toBeVisible({ timeout: 240000 });
      await expect(bulkDialog).toBeHidden();

      // Verify the selection label disappears
      await expect(adminModelCardPage.getSelectionLabel()).toBeHidden();

      // Cleanup: model cards were deleted but the shared folder remains;
      // move it to trash and permanently delete
      await moveToTrashAndVerify(page, folderName, 'admin-data');
      await deleteForeverAndVerifyFromTrash(page, folderName, 'admin-data');
    });

    // 5.4 Superadmin can cancel bulk deletion
    test('Superadmin can cancel bulk deletion', async ({ page }) => {
      test.setTimeout(180000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const folderName = `e2e-test-bulk-cancel-folder-${timestamp}`;
      const filterPrefix = `e2e-test-bulk-cancel-${timestamp}`;
      const cardNames = [`${filterPrefix}-1`, `${filterPrefix}-2`];

      // Setup: create a shared folder via the "+" button for the first card,
      // then reuse it for the second card
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[0],
        createNewFolderName: folderName,
      });

      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[1],
        vfolderTitle: folderName,
      });

      // Filter to show only this run's test cards (timestamp ensures uniqueness)
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(filterPrefix);
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible({
        timeout: 30000,
      });

      // Select all visible rows
      await adminModelCardPage.getHeaderCheckbox().check();

      // Click the bulk delete button (scoped to bulk-action area)
      await adminModelCardPage.getBulkDeleteButton().click();

      // Verify the bulk delete confirmation dialog appears with item list
      const bulkDialog = adminModelCardPage.getBulkDeleteConfirmDialog();
      await expect(bulkDialog).toBeVisible();
      for (const name of cardNames) {
        await expect(bulkDialog.getByText(name)).toBeVisible();
      }

      // Click Cancel without typing confirmation text
      await bulkDialog.getByRole('button', { name: 'Cancel' }).click();

      // Verify the dialog closes
      await expect(bulkDialog).toBeHidden();

      // Verify the model cards are still in the table
      for (const name of cardNames) {
        await expect(adminModelCardPage.getRowByName(name)).toBeVisible();
      }

      // Cleanup: delete each model card (card only), then clean up the shared folder
      for (const name of cardNames) {
        await adminModelCardPage.deleteModelCardByName(name);
      }
      await moveToTrashAndVerify(page, folderName, 'admin-data');
      await deleteForeverAndVerifyFromTrash(page, folderName, 'admin-data');
    });

    // 5.5 Superadmin can clear selection using the BAISelectionLabel clear button
    test('Superadmin can clear selection using the BAISelectionLabel clear button', async ({
      page,
    }) => {
      test.setTimeout(90000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const folderName = `e2e-test-clear-sel-folder-${timestamp}`;
      const cardName = `e2e-test-clear-sel-${timestamp}`;

      // Setup: create a model card so the table has at least one row with a checkbox
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardName,
        createNewFolderName: folderName,
      });

      // Navigate back and filter to the created card to ensure it is visible
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(cardName);
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible({
        timeout: 30000,
      });

      // Check the checkbox for the first row
      const firstRowCheckbox = adminModelCardPage
        .getDataRows()
        .first()
        .getByRole('checkbox');
      await firstRowCheckbox.check();

      // Verify the BAISelectionLabel shows the count
      await expect(adminModelCardPage.getSelectionLabel()).toBeVisible();

      // Click the clear/deselect button on the BAISelectionLabel (aria-label: "Deselect all")
      await page.getByRole('button', { name: 'Deselect all' }).click();

      // Verify all checkboxes are unchecked
      await expect(firstRowCheckbox).not.toBeChecked();

      // Verify the BAISelectionLabel disappears
      await expect(adminModelCardPage.getSelectionLabel()).toBeHidden();

      // Cleanup: delete the model card then clean up the folder
      await adminModelCardPage.deleteModelCardByName(cardName);
      await moveToTrashAndVerify(page, folderName, 'admin-data');
      await deleteForeverAndVerifyFromTrash(page, folderName, 'admin-data');
    });

    // 5.6 Superadmin can select all model cards using the header checkbox
    test('Superadmin can select all model cards on the current page using the header checkbox', async ({
      page,
    }) => {
      test.setTimeout(150000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const folderName = `e2e-test-select-all-folder-${timestamp}`;
      const cardName = `e2e-test-select-all-${timestamp}`;

      // Setup: create a model card so the table has at least one row
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardName,
        createNewFolderName: folderName,
      });

      // Navigate back and filter to ensure the created card is visible
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(cardName);
      // Wait for the specific filtered card to appear, confirming the filter has been applied
      await expect(adminModelCardPage.getRowByName(cardName)).toBeVisible({
        timeout: 15000,
      });

      // Click the "select all" checkbox in the table header
      await adminModelCardPage.getHeaderCheckbox().check();

      // Verify the selection label appears and shows at least 1 item selected.
      // Note: antd table "select all" may select all backend records (not just the
      // filtered/visible rows on the current page), so we assert a positive count
      // rather than comparing to the visible row count.
      await expect(adminModelCardPage.getSelectionLabel()).toBeVisible();
      const selectionText = await adminModelCardPage
        .getSelectionLabel()
        .textContent();
      expect(selectionText).toMatch(/\d+ selected/);
      const selectedCount = parseInt(
        selectionText?.match(/(\d+) selected/)?.[1] ?? '0',
      );
      expect(selectedCount).toBeGreaterThan(0);

      // Cleanup: navigate fresh to reset selection state, then delete the model card
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(cardName);
      await expect(adminModelCardPage.getRowByName(cardName)).toBeVisible({
        timeout: 15000,
      });
      await adminModelCardPage.deleteModelCardByName(cardName);
      await moveToTrashAndVerify(page, folderName, 'admin-data');
      await deleteForeverAndVerifyFromTrash(page, folderName, 'admin-data');
    });

    // 5.7 Superadmin can delete a model card and its associated folder together
    test('Superadmin can delete a model card and its associated folder, and navigate to trash with folder filter', async ({
      page,
    }) => {
      test.setTimeout(90000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const folderName = `e2e-test-delete-folder-${timestamp}`;
      const cardName = `e2e-test-delete-with-folder-${timestamp}`;

      // Create a model card with a new dedicated folder via the "+" button
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardName,
        createNewFolderName: folderName,
      });

      // Navigate back and filter for the created card
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(cardName);
      // Wait for the filtered row to appear before clicking delete
      await expect(adminModelCardPage.getRowByName(cardName)).toBeVisible({
        timeout: 15000,
      });

      // Open the delete confirmation dialog
      await adminModelCardPage.clickDeleteForRow(cardName);

      // Verify the "Also delete the associated model folder" checkbox is visible
      await expect(
        adminModelCardPage.getAlsoDeleteFolderCheckbox(),
      ).toBeVisible();

      // Verify the folder link shows the expected folder name
      const folderLink = adminModelCardPage.getFolderNameLinkInDeleteDialog();
      await expect(folderLink).toBeVisible();
      await expect(folderLink).toHaveText(folderName);

      // Check the "Also delete the associated model folder" checkbox
      await adminModelCardPage.getAlsoDeleteFolderCheckbox().check();
      await expect(
        adminModelCardPage.getAlsoDeleteFolderCheckbox(),
      ).toBeChecked();

      // Type card name to confirm (requireConfirmInput is set on the single-delete modal)
      await adminModelCardPage.getDeleteConfirmInput().fill(cardName);

      // Confirm deletion
      await adminModelCardPage.getDeleteConfirmButton().click();

      // Verify the success notification for card + folder deletion
      await expect(
        page.getByText('Model card and folder have been moved to trash.'),
      ).toBeVisible({ timeout: 30000 });

      // Verify "Go to Data > Trash" link is visible in the notification
      const goToTrashLink = page.getByText('Go to Data > Trash');
      await expect(goToTrashLink).toBeVisible();

      // Click "Go to Data > Trash" and verify URL includes folder filter
      await goToTrashLink.click();
      await page.waitForURL(
        (url) => {
          if (url.pathname !== '/admin-data') return false;
          if (url.searchParams.get('statusCategory') !== 'deleted')
            return false;
          const rawFilter = url.searchParams.get('filter') ?? '';
          return rawFilter === `name == "${folderName}"`;
        },
        { timeout: 30000 },
      );

      // Verify the folder row is visible in the trash list and permanently delete it
      await deleteForeverAndVerifyFromTrash(page, folderName, 'admin-data');
    });

    // 5.8 Superadmin deletes card only: notification shows correct message and Go to Trash navigates correctly
    test('Superadmin can delete a model card only and navigate to trash without folder filter', async ({
      page,
    }) => {
      test.setTimeout(90000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const folderName = `e2e-test-keep-folder-${timestamp}`;
      const cardName = `e2e-test-delete-card-only-${timestamp}`;

      // Create a model card with a new dedicated folder via the "+" button
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardName,
        createNewFolderName: folderName,
      });

      // Navigate back and filter
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(cardName);

      // Open delete dialog
      await adminModelCardPage.clickDeleteForRow(cardName);

      // Leave "Also delete folder" checkbox unchecked (default)
      await expect(
        adminModelCardPage.getAlsoDeleteFolderCheckbox(),
      ).not.toBeChecked();

      // Type card name to confirm (requireConfirmInput is set on the single-delete modal)
      await adminModelCardPage.getDeleteConfirmInput().fill(cardName);

      // Confirm deletion
      await adminModelCardPage.getDeleteConfirmButton().click();

      // Verify the notification message for card-only deletion
      await expect(
        page.getByText(
          'Model card has been deleted. The model folder was not deleted.',
        ),
      ).toBeVisible({ timeout: 15000 });

      // Verify "Go to Data > Trash" link is visible
      const goToTrashLink = page.getByText('Go to Data > Trash');
      await expect(goToTrashLink).toBeVisible();

      // Click "Go to Data > Trash" and verify URL (no folder filter)
      await goToTrashLink.click();
      await page.waitForURL(
        (url) =>
          url.pathname === '/data' &&
          url.searchParams.get('statusCategory') === 'deleted' &&
          !url.searchParams.has('filter'),
        { timeout: 10000 },
      );

      // Cleanup: move the kept test folder to trash then permanently delete it
      await moveToTrashAndVerify(page, folderName, 'admin-data');
      await deleteForeverAndVerifyFromTrash(page, folderName, 'admin-data');
    });

    // 5.9 Superadmin can bulk delete model cards and move their folders to trash
    test('Superadmin can bulk delete model cards and move their associated folders to trash', async ({
      page,
    }) => {
      test.setTimeout(300000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const folderName1 = `e2e-test-bulk-trash-f1-${timestamp}`;
      const folderName2 = `e2e-test-bulk-trash-f2-${timestamp}`;
      const filterPrefix = `e2e-test-bulk-trash-${timestamp}`;
      const cardNames = [`${filterPrefix}-1`, `${filterPrefix}-2`];

      // Register for cleanup — afterEach handles mid-test failure leaks via try-catch.
      // Only push cardNames here; folders are permanently deleted at the end of the test
      // body via deleteForeverAndVerifyFromTrash. If afterEach also tried to
      // moveToTrashAndVerify them it would hang looking for already-gone folders.
      createdResources.push({ cardName: cardNames[0] });
      createdResources.push({ cardName: cardNames[1] });

      // Setup: create card 1 with its own folder
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[0],
        createNewFolderName: folderName1,
      });

      // Setup: create card 2 with its own folder
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[1],
        createNewFolderName: folderName2,
      });

      // Filter to show only this run's test cards
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(filterPrefix);
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible({
        timeout: 30000,
      });

      // Select all visible rows
      await adminModelCardPage.getHeaderCheckbox().click();
      await expect(adminModelCardPage.getSelectionLabel()).toBeVisible();

      // Open bulk delete dialog
      await adminModelCardPage.getBulkDeleteButton().click();
      const bulkDialog = adminModelCardPage.getBulkDeleteConfirmDialog();
      await expect(bulkDialog).toBeVisible();

      // Verify the "Also delete the associated model folders" checkbox is visible and unchecked by default
      const alsoDeleteCheckbox =
        adminModelCardPage.getAlsoDeleteFoldersBulkCheckbox();
      await expect(alsoDeleteCheckbox).toBeVisible();
      await expect(alsoDeleteCheckbox).not.toBeChecked();

      // Check the checkbox to also move folders to trash
      await alsoDeleteCheckbox.check();
      await expect(alsoDeleteCheckbox).toBeChecked();

      // Type "Delete" to confirm
      await bulkDialog.getByLabel(/Type.*to confirm/i).fill('Delete');

      // Confirm deletion
      await bulkDialog.getByRole('button', { name: 'Delete' }).click();

      // Wait for the success notification — card delete + folder soft-delete run
      // sequentially; under parallel-test load the combined mutation can be slow,
      // so we wait directly on the visible outcome rather than polling the dialog.
      await expect(
        page.getByText(
          /model card\(s\) and their folders have been moved to trash/i,
        ),
      ).toBeVisible({ timeout: 240000 });

      // Dialog must be hidden once the notification is shown
      await expect(bulkDialog).toBeHidden();

      // Verify "Go to Data > Trash" link is visible
      const goToTrashLink = page.getByText('Go to Data > Trash');
      await expect(goToTrashLink).toBeVisible();

      // Click the link and verify navigation to trash tab without folder filter
      await goToTrashLink.click();
      await page.waitForURL(
        (url) => {
          if (url.pathname !== '/admin-data') return false;
          return url.searchParams.get('statusCategory') === 'deleted';
        },
        { timeout: 30000 },
      );

      // Permanently delete both folders from trash for cleanup
      await deleteForeverAndVerifyFromTrash(page, folderName1, 'admin-data');
      await deleteForeverAndVerifyFromTrash(page, folderName2, 'admin-data');
    });

    // 5.10 Superadmin can bulk delete model cards without moving their folders to trash
    test('Superadmin can bulk delete model cards without moving their folders to trash', async ({
      page,
    }) => {
      test.setTimeout(300000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const folderName = `e2e-test-bulk-notrash-folder-${timestamp}`;
      const filterPrefix = `e2e-test-bulk-notrash-${timestamp}`;
      const cardNames = [`${filterPrefix}-1`, `${filterPrefix}-2`];

      // Track folder for cleanup (cards deleted by test; folder stays active)
      createdResources.push({ folderName });

      // Setup: create card 1 with a new folder
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[0],
        createNewFolderName: folderName,
      });

      // Setup: create card 2 sharing the same folder
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[1],
        vfolderTitle: folderName,
      });

      // Filter to show only this run's test cards
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(filterPrefix);
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible({
        timeout: 30000,
      });

      // Select all visible rows
      await adminModelCardPage.getHeaderCheckbox().click();
      await expect(adminModelCardPage.getSelectionLabel()).toBeVisible();

      // Open bulk delete dialog
      await adminModelCardPage.getBulkDeleteButton().click();
      const bulkDialog = adminModelCardPage.getBulkDeleteConfirmDialog();
      await expect(bulkDialog).toBeVisible();

      // Verify the checkbox is visible but leave it unchecked (default)
      const alsoDeleteCheckbox =
        adminModelCardPage.getAlsoDeleteFoldersBulkCheckbox();
      await expect(alsoDeleteCheckbox).toBeVisible();
      await expect(alsoDeleteCheckbox).not.toBeChecked();

      // Type "Delete" to confirm (checkbox unchecked)
      await bulkDialog.getByLabel(/Type.*to confirm/i).fill('Delete');

      // Confirm deletion
      await bulkDialog.getByRole('button', { name: 'Delete' }).click();

      // Wait for the success toast — under parallel-test load the bulk deletion
      // can be slow, so wait on the visible outcome rather than polling the dialog.
      await expect(
        page.getByText(/\d+ model card\(s\) have been deleted\./i),
      ).toBeVisible({ timeout: 240000 });
      await expect(bulkDialog).toBeHidden();

      // Verify no "Go to Data > Trash" link appears
      await expect(page.getByText('Go to Data > Trash')).not.toBeVisible();

      // Verify selection label has cleared (cards were deleted)
      await expect(adminModelCardPage.getSelectionLabel()).toBeHidden();

      // afterEach handles folder cleanup (folder remains in active state)
    });
  },
);
