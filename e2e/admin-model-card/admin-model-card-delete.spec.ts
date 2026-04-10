// spec: e2e/.agent-output/test-plan-admin-model-card.md
// section: 5. Delete Model Card
import { AdminModelCardPage } from '../utils/classes/AdminModelCardPage';
import { loginAsAdmin, webuiEndpoint } from '../utils/test-util';
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
      const adminModelCardPage = new AdminModelCardPage(page);
      const cardName = `e2e-test-delete-single-${Date.now()}`;

      // Setup: create a model card to delete
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({ name: cardName });

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

      // Click Delete to confirm
      await adminModelCardPage.getDeleteConfirmButton().click();

      // Verify success message
      await expect(page.getByText('Model card has been deleted.')).toBeVisible({
        timeout: 15000,
      });

      // Verify the row is no longer in the table
      await expect(adminModelCardPage.getPaginationInfo()).toContainText(
        '0 items',
      );
    });

    // 5.2 Superadmin can cancel a single-delete confirmation without deleting
    test('Superadmin can cancel a single-delete confirmation without deleting', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      const cardName = `e2e-test-no-delete-${Date.now()}`;

      // Setup: create a model card to keep
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      await adminModelCardPage.createModelCard({ name: cardName });

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

      // Cleanup: delete the test model card
      await adminModelCardPage.deleteModelCardByName(cardName);
    });

    // 5.3 Superadmin can select multiple model cards and delete them in bulk
    test('Superadmin can select multiple model cards and delete them in bulk', async ({
      page,
    }) => {
      test.setTimeout(90000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const filterPrefix = `e2e-test-bulk-delete-${timestamp}`;
      const cardNames = [
        `${filterPrefix}-1`,
        `${filterPrefix}-2`,
        `${filterPrefix}-3`,
      ];

      // Setup: create three model cards
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      for (const name of cardNames) {
        await adminModelCardPage.createModelCard({ name });
        await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
        await adminModelCardPage.waitForTableLoad();
      }

      // Filter to show only this run's test cards (timestamp ensures uniqueness)
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
    });

    // 5.4 Superadmin can cancel bulk deletion
    test('Superadmin can cancel bulk deletion', async ({ page }) => {
      test.setTimeout(90000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const filterPrefix = `e2e-test-bulk-cancel-${timestamp}`;
      const cardNames = [`${filterPrefix}-1`, `${filterPrefix}-2`];

      // Setup: create two model cards
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();
      for (const name of cardNames) {
        await adminModelCardPage.createModelCard({ name });
        await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
        await adminModelCardPage.waitForTableLoad();
      }

      // Filter to show only this run's test cards (timestamp ensures uniqueness)
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

      // Cleanup: delete the test model cards
      for (const name of cardNames) {
        await adminModelCardPage.deleteModelCardByName(name);
      }
    });

    // 5.5 Superadmin can clear selection using the BAISelectionLabel clear button
    test('Superadmin can clear selection using the BAISelectionLabel clear button', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);

      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

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
    });

    // 5.6 Superadmin can select all model cards using the header checkbox
    test('Superadmin can select all model cards on the current page using the header checkbox', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);

      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Click the "select all" checkbox in the table header
      await adminModelCardPage.getHeaderCheckbox().check();

      // Verify the selection label appears
      await expect(adminModelCardPage.getSelectionLabel()).toBeVisible();

      // Verify the selection count matches the number of rows on the page
      const rowCount = await adminModelCardPage.getDataRows().count();
      await expect(adminModelCardPage.getSelectionLabel()).toContainText(
        `${rowCount} selected`,
      );
    });
  },
);
