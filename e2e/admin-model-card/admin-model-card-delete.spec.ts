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
        confirmDialog.getByText(cardName, { exact: true }),
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
      test.setTimeout(120000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const folderName = `e2e-test-bulk-delete-folder-${timestamp}`;
      const filterPrefix = `e2e-test-bulk-delete-${timestamp}`;
      const cardNames = [
        `${filterPrefix}-1`,
        `${filterPrefix}-2`,
        `${filterPrefix}-3`,
      ];

      // Setup: create a shared folder via the "+" button for the first card,
      // then reuse it for the remaining cards
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[0],
        createNewFolderName: folderName,
      });

      for (const name of cardNames.slice(1)) {
        await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
        await adminModelCardPage.waitForTableLoad();
        await adminModelCardPage.createModelCard({
          name,
          vfolderTitle: folderName,
        });
      }

      // Filter to show only this run's test cards (timestamp ensures uniqueness)
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(filterPrefix);
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible({
        timeout: 10000,
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

      // Wait for bulk delete to complete — dialog closes when all mutations finish
      await expect(bulkDialog).toBeHidden({ timeout: 45000 });

      // Verify the selection label disappears
      await expect(adminModelCardPage.getSelectionLabel()).toBeHidden();

      // Cleanup: model cards were deleted but the shared folder remains;
      // move it to trash and permanently delete
      await moveToTrashAndVerify(page, folderName, 'admin-data');
      await deleteForeverAndVerifyFromTrash(page, folderName, 'admin-data');
    });

    // 5.4 Superadmin can cancel bulk deletion
    test('Superadmin can cancel bulk deletion', async ({ page }) => {
      test.setTimeout(120000);
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
        timeout: 10000,
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
        timeout: 10000,
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
      test.setTimeout(90000);
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
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible({
        timeout: 10000,
      });

      // Click the "select all" checkbox in the table header
      await adminModelCardPage.getHeaderCheckbox().check();

      // Verify the selection label appears
      await expect(adminModelCardPage.getSelectionLabel()).toBeVisible();

      // Verify the selection count matches the number of rows on the page
      const rowCount = await adminModelCardPage.getDataRows().count();
      await expect(adminModelCardPage.getSelectionLabel()).toContainText(
        `${rowCount} selected`,
      );

      // Cleanup: delete the model card then clean up the folder
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

      // Confirm deletion
      await adminModelCardPage.getDeleteConfirmButton().click();

      // Verify the success notification for card + folder deletion
      await expect(
        page.getByText('Model card and folder have been moved to trash.'),
      ).toBeVisible({ timeout: 15000 });

      // Verify "Go to Data > Trash" link is visible in the notification
      const goToTrashLink = page.getByText('Go to Data > Trash');
      await expect(goToTrashLink).toBeVisible();

      // Click "Go to Data > Trash" and verify URL includes folder filter
      await goToTrashLink.click();
      await page.waitForURL(
        (url) =>
          url.pathname === '/data' &&
          url.searchParams.get('statusCategory') === 'deleted' &&
          url.searchParams.get('filter') === `name == "${folderName}"`,
        { timeout: 10000 },
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
  },
);
