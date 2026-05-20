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
    // Run sequentially: tests create and query server-side resources; parallel
    // execution under fullyParallel:true causes filter results to be empty
    // because the server is slow to index newly created cards under load.
    test.describe.configure({ mode: 'serial' });
    test.setTimeout(60000);

    // Tracking arrays for afterEach cleanup.
    // Each test sets these before creating resources so cleanup always runs
    // even if the test fails mid-way.
    let foldersToClean: string[] = [];
    let cardsToClean: string[] = [];

    test.beforeEach(async ({ page, request }) => {
      foldersToClean = [];
      cardsToClean = [];
      await loginAsAdmin(page, request);
    });

    test.afterEach(async ({ page }) => {
      // Delete any model cards that are still alive (cancel / no-delete scenarios).
      // Navigates fresh for each card to ensure the filter is applied cleanly.
      for (const cardName of cardsToClean) {
        try {
          const adminModelCardPage = new AdminModelCardPage(page);
          await page.goto(
            `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
          );
          await adminModelCardPage.waitForTableLoad();
          await adminModelCardPage.applyNameFilter(cardName);
          const row = adminModelCardPage.getRowByName(cardName);
          if ((await row.count()) > 0) {
            await adminModelCardPage.deleteModelCardByName(cardName);
          }
        } catch {
          // Ignore per-card errors; proceed to next card
        }
      }

      // Permanently delete each tracked folder from admin-data regardless of its
      // current state (Active or Trash):
      //   1. Try to move from Active → Trash. If the folder is already in Trash
      //      (e.g. the test itself moved it via "Also delete folder") or does not
      //      exist, moveToTrashAndVerify will throw — we catch and continue.
      //   2. Try to purge from Trash. If the folder was not found in step 1 and
      //      is not in Trash either, deleteForeverAndVerifyFromTrash will throw —
      //      we catch and continue.
      for (const folderName of foldersToClean) {
        try {
          await moveToTrashAndVerify(page, folderName, 'admin-data');
        } catch {
          // Folder may already be in Trash or may not exist
        }
        try {
          await deleteForeverAndVerifyFromTrash(page, folderName, 'admin-data');
        } catch {
          // Folder may not be in Trash (already purged or never created)
        }
      }
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
      foldersToClean = [folderName];
      cardsToClean = [cardName];

      // Setup: create a dedicated folder and model card
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardName,
        createNewFolderName: folderName,
      });

      // Navigate back and find the row
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
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

      // Click Delete to confirm (leave folder checkbox unchecked — folder purge handled by afterEach)
      await adminModelCardPage.getDeleteConfirmButton().click();

      // Verify success message
      await expect(page.getByText(/Model card has been deleted/)).toBeVisible({
        timeout: 15000,
      });

      // Verify the row is no longer in the table
      await expect(adminModelCardPage.getPaginationInfo()).toContainText(
        '0 items',
      );
      // afterEach moves the folder (still Active) to Trash and permanently deletes it
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
      foldersToClean = [folderName];
      cardsToClean = [cardName]; // Card remains after cancel — afterEach deletes it

      // Setup: create a dedicated folder and model card
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardName,
        createNewFolderName: folderName,
      });

      // Navigate back and filter
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
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
      // afterEach deletes the card then purges the folder
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
      foldersToClean = [folderName];
      cardsToClean = [...cardNames];

      // Setup: create a shared folder via the "+" button for the first card,
      // then reuse it for the second card
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[0],
        createNewFolderName: folderName,
      });

      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[1],
        vfolderTitle: folderName,
      });

      // Filter to show only this run's test cards (timestamp ensures uniqueness)
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(filterPrefix);
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible({
        timeout: 30000,
      });

      // Click the header checkbox to select all visible rows.
      // Use .click() instead of .check(): Ant Design's "select all" header checkbox starts
      // in an unchecked-but-may-be-indeterminate state. Playwright's .check() fails when
      // the checkbox is already in an indeterminate state; .click() works unconditionally.
      await adminModelCardPage.getHeaderCheckbox().click();

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

      // Wait for Form.useWatch to re-render and enable the button before clicking.
      const deleteButton = bulkDialog.getByRole('button', {
        name: 'Delete',
      });
      await expect(deleteButton).not.toBeDisabled({ timeout: 5000 });
      await deleteButton.click();

      // Wait for the success toast — under parallel-test load the bulk deletion
      // can be slow, so wait on the visible outcome rather than polling the dialog.
      await expect(
        page.getByText(/\d+ model card\(s\) have been deleted\./i),
      ).toBeVisible({ timeout: 240000 });
      await expect(bulkDialog).toBeHidden();

      // Verify the selection label disappears
      await expect(adminModelCardPage.getSelectionLabel()).toBeHidden();
      // afterEach skips card deletion (already deleted) and purges the shared folder
    });

    // 5.4 Superadmin can cancel bulk deletion
    test('Superadmin can cancel bulk deletion', async ({ page }) => {
      test.setTimeout(180000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const folderName = `e2e-test-bulk-cancel-folder-${timestamp}`;
      const filterPrefix = `e2e-test-bulk-cancel-${timestamp}`;
      const cardNames = [`${filterPrefix}-1`, `${filterPrefix}-2`];
      foldersToClean = [folderName];
      cardsToClean = [...cardNames]; // Cards remain after cancel — afterEach deletes them

      // Setup: create a shared folder via the "+" button for the first card,
      // then reuse it for the second card
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[0],
        createNewFolderName: folderName,
      });

      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[1],
        vfolderTitle: folderName,
      });

      // Filter to show only this run's test cards (timestamp ensures uniqueness)
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(filterPrefix);
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible({
        timeout: 30000,
      });

      // Click the header checkbox to select all visible rows.
      // Use .click() instead of .check(): Ant Design's "select all" header checkbox starts
      // in an unchecked-but-may-be-indeterminate state. Playwright's .check() fails when
      // the checkbox is already in an indeterminate state; .click() works unconditionally.
      await adminModelCardPage.getHeaderCheckbox().click();

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

      // Verify the model cards are still in the table (table may briefly re-render
      // after dialog close, so allow extra time beyond the default 5 s).
      for (const name of cardNames) {
        await expect(adminModelCardPage.getRowByName(name)).toBeVisible({
          timeout: 15000,
        });
      }
      // afterEach deletes both cards then purges the shared folder
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
      foldersToClean = [folderName];
      cardsToClean = [cardName]; // Card remains — afterEach deletes it

      // Setup: create a model card so the table has at least one row with a checkbox
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardName,
        createNewFolderName: folderName,
      });

      // Navigate back and filter to the created card to ensure it is visible
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
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
      // afterEach deletes the card then purges the folder
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
      foldersToClean = [folderName];
      cardsToClean = [cardName]; // Card remains — afterEach deletes it

      // Setup: create a model card so the table has at least one row
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardName,
        createNewFolderName: folderName,
      });

      // Navigate back and filter to ensure the created card is visible
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(cardName);
      // Wait for the specific filtered card to appear, confirming the filter has been applied
      await expect(adminModelCardPage.getRowByName(cardName)).toBeVisible({
        timeout: 15000,
      });

      // Click the "select all" checkbox in the table header.
      // Use .click() instead of .check(): Ant Design's "select all" header checkbox starts
      // in an unchecked-but-may-be-indeterminate state. Playwright's .check() fails when
      // the checkbox is already in an indeterminate state; .click() works unconditionally.
      await adminModelCardPage.getHeaderCheckbox().click();

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
      // afterEach deletes the card then purges the folder
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
      foldersToClean = [folderName];
      cardsToClean = [cardName];
      // Note: the "Also delete folder" action moves the folder to Trash during the test.
      // afterEach handles it correctly: moveToTrashAndVerify will fail (folder already in
      // Trash) and the catch is silently ignored; deleteForeverAndVerifyFromTrash then
      // purges it completely.

      // Create a model card with a new dedicated folder via the "+" button
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardName,
        createNewFolderName: folderName,
      });

      // Navigate back and filter for the created card
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
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
        page.getByText(
          'Model card and its associated folder have been moved to trash.',
        ),
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
      // afterEach permanently deletes the folder from Trash (moveToTrash is skipped
      // since the folder is already in Trash, then deleteForever purges it)
    });

    // 5.8 Superadmin deletes card only: card-only deletion shows success message (no trash link)
    // When "Also delete folder" is left unchecked, the app calls message.success() which is
    // a simple toast with no navigation link — unlike the folder-deletion flow which uses
    // upsertNotification() with a "Go to Data > Trash" link.
    test('Superadmin can delete a model card only and see a success message without a trash link', async ({
      page,
    }) => {
      test.setTimeout(90000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const folderName = `e2e-test-keep-folder-${timestamp}`;
      const cardName = `e2e-test-delete-card-only-${timestamp}`;
      foldersToClean = [folderName];
      cardsToClean = [cardName];

      // Create a model card with a new dedicated folder via the "+" button
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardName,
        createNewFolderName: folderName,
      });

      // Navigate back and filter
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
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

      // Verify the notification message for card-only deletion.
      // Card-only deletion uses message.success() — a plain toast with no navigation link.
      await expect(
        page.getByText(
          'Model card has been deleted. The model folder was not deleted.',
        ),
      ).toBeVisible({ timeout: 15000 });

      // Verify the model card row is removed from the filtered table
      await expect(adminModelCardPage.getPaginationInfo()).toContainText(
        '0 items',
      );
      // afterEach moves the folder (still Active) to Trash and permanently deletes it
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
      foldersToClean = [folderName1, folderName2];
      cardsToClean = [...cardNames];
      // Note: the "Also delete folders" action moves both folders to Trash during the test.
      // afterEach handles them correctly: moveToTrashAndVerify fails (already in Trash) and
      // is silently ignored; deleteForeverAndVerifyFromTrash then purges each one.

      // Setup: create card 1 with its own folder
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[0],
        createNewFolderName: folderName1,
      });

      // Setup: create card 2 with its own folder
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[1],
        createNewFolderName: folderName2,
      });

      // Filter to show only this run's test cards
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(filterPrefix);
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible({
        timeout: 60000,
      });

      // Click the header checkbox to select all visible rows.
      // Use .click() instead of .check(): Ant Design's "select all" header checkbox starts
      // in an unchecked-but-may-be-indeterminate state. Playwright's .check() fails when
      // the checkbox is already in an indeterminate state; .click() works unconditionally.
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
      await bulkDialog.getByRole('textbox').fill('Delete');

      // Wait for Form.useWatch to re-render and enable the button before clicking.
      const deleteButton = bulkDialog.getByRole('button', {
        name: 'Delete',
      });
      await expect(deleteButton).not.toBeDisabled({ timeout: 5000 });
      await deleteButton.click();

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
      // afterEach permanently deletes both folders from Trash (moveToTrash is skipped
      // since they are already in Trash, then deleteForever purges each one)
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
      foldersToClean = [folderName];
      cardsToClean = [...cardNames];

      // Setup: create card 1 with a new folder
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[0],
        createNewFolderName: folderName,
      });

      // Setup: create card 2 sharing the same folder
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({
        name: cardNames[1],
        vfolderTitle: folderName,
      });

      // Filter to show only this run's test cards
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.applyNameFilter(filterPrefix);
      await expect(adminModelCardPage.getDataRows().first()).toBeVisible({
        timeout: 60000,
      });

      // Click the header checkbox to select all visible rows.
      // Use .click() instead of .check(): Ant Design's "select all" header checkbox starts
      // in an unchecked-but-may-be-indeterminate state. Playwright's .check() fails when
      // the checkbox is already in an indeterminate state; .click() works unconditionally.
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
      await bulkDialog.getByRole('textbox').fill('Delete');

      // Wait for Form.useWatch to re-render and enable the button before clicking.
      const deleteButton = bulkDialog.getByRole('button', {
        name: 'Delete',
      });
      await expect(deleteButton).not.toBeDisabled({ timeout: 5000 });
      await deleteButton.click();

      // Wait for the success toast — under parallel-test load the bulk deletion
      // can be slow, so wait on the visible outcome rather than polling the dialog.
      await expect(
        page.getByText(/\d+ model card\(s\) have been deleted\./i),
      ).toBeVisible({ timeout: 240000 });
      await expect(bulkDialog).toBeHidden();

      // Verify no "Go to Data > Trash" link appears (folders were kept active)
      await expect(page.getByText('Go to Data > Trash')).not.toBeVisible();

      // Verify selection label has cleared (cards were deleted)
      await expect(adminModelCardPage.getSelectionLabel()).toBeHidden();
      // afterEach moves the folder (still Active) to Trash and permanently deletes it
    });
  },
);
