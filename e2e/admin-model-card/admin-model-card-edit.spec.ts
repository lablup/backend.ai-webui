// spec: e2e/.agent-output/test-plan-admin-model-card.md
// section: 4. Edit Model Card
import { AdminModelCardPage } from '../utils/classes/AdminModelCardPage';
import { loginAsAdmin, webuiEndpoint } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'Admin Model Card Management - Edit',
  { tag: ['@admin-model-card', '@admin', '@crud'] },
  () => {
    test.setTimeout(60000);
    let testCardName: string;

    test.beforeEach(async ({ page, request }, testInfo) => {
      // Generate unique name per test to avoid parallel worker conflicts
      testCardName = `e2e-test-edit-${testInfo.workerIndex}-${Date.now()}`;
      await loginAsAdmin(page, request);

      // Create a test model card to edit
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      const adminModelCardPage = new AdminModelCardPage(page);
      await adminModelCardPage.waitForTableLoad();

      await adminModelCardPage.getCreateModelCardButton().click();
      const modal = adminModelCardPage.getCreateModal();
      await expect(modal).toBeVisible();

      await modal.getByRole('textbox', { name: 'Name' }).fill(testCardName);
      // In antd v6 with BAISelect, click .ant-select-content to open the dropdown reliably.
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Model Storage Folder' })
        .locator('.ant-select-content')
        .click();
      const vfolderDropdown = page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .first();
      await expect(vfolderDropdown).toBeVisible({ timeout: 10000 });
      await expect(vfolderDropdown.getByText(/Total \d+ items/)).toBeVisible({
        timeout: 10000,
      });
      await vfolderDropdown.locator('.ant-select-item-option').first().click();
      await expect(vfolderDropdown).toBeHidden();

      // Select Access Level (required field). Access level options are "Private" (INTERNAL) and "Public".
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Access Level' })
        .locator('.ant-select-content')
        .click();
      const accessDropdown = page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .first();
      await expect(accessDropdown).toBeVisible();
      await accessDropdown
        .locator('.ant-select-item-option')
        .filter({ hasText: 'Private' })
        .click();

      // In antd v6, Form.Item tooltip icons contribute to the accessible name.
      // Use the form item container to locate the textbox by label text.
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Title' })
        .getByRole('textbox')
        .fill('Original Title');
      await adminModelCardPage.getCreateModalSubmitButton().click();
      await expect(page.getByText('Model card has been created.')).toBeVisible({
        timeout: 15000,
      });
      await expect(modal).toBeHidden();
    });

    test.afterEach(async ({ page }) => {
      // Cleanup: delete the test model card
      try {
        await page.goto(
          `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
        );
        const adminModelCardPage = new AdminModelCardPage(page);
        await adminModelCardPage.waitForTableLoad();
        await adminModelCardPage.applyNameFilter(testCardName);
        // Only delete if the card exists (it may have been deleted by the test)
        const row = adminModelCardPage.getRowByName(testCardName);
        if ((await row.count()) > 0) {
          await adminModelCardPage.deleteModelCardByName(testCardName);
        }
      } catch {
        // Ignore cleanup errors
      }
    });

    // 4.1 Superadmin can open the Edit Model Card modal from a table row
    test('Superadmin can open the Edit Model Card modal from a table row', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();

      // Refresh the table to ensure newly created card is visible
      await adminModelCardPage.getRefreshButton().click();
      await adminModelCardPage.waitForTableLoad();

      // Filter to find the test card
      await adminModelCardPage.applyNameFilter(testCardName);
      // Wait for the filter results — the card may take a moment to appear after creation
      await expect(adminModelCardPage.getRowByName(testCardName)).toBeVisible({
        timeout: 15000,
      });

      // Click the gear icon in the Name cell for the test card
      await adminModelCardPage.openEditModal(testCardName);

      const modal = adminModelCardPage.getEditModal();

      // Verify the modal title is "Edit Model Card"
      await expect(modal.getByText('Edit Model Card')).toBeVisible();

      // Verify Name field is pre-filled
      await expect(adminModelCardPage.getEditModalNameInput()).toHaveValue(
        testCardName,
      );

      // Verify Model Storage Folder shows a link (read-only), not a select
      await expect(modal.getByRole('link')).toBeVisible();

      // Verify Domain field shows plain text (not a select dropdown)
      await expect(modal.getByText('default')).toBeVisible();

      // Verify the modal footer shows an "Update" button
      await expect(adminModelCardPage.getEditModalUpdateButton()).toBeVisible();
    });

    // 4.2 Superadmin can update a model card's metadata fields
    test("Superadmin can update a model card's metadata fields", async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();

      // Refresh the table to ensure newly created card is visible
      await adminModelCardPage.getRefreshButton().click();
      await adminModelCardPage.waitForTableLoad();

      // Filter to find the test card
      await adminModelCardPage.applyNameFilter(testCardName);
      // Wait for the filter results — the card may take a moment to appear after creation
      await expect(adminModelCardPage.getRowByName(testCardName)).toBeVisible({
        timeout: 15000,
      });

      // Open edit modal for the test card
      await adminModelCardPage.openEditModal(testCardName);
      const modal = adminModelCardPage.getEditModal();

      // Clear the Title field and type a new value.
      // In antd v6, tooltip icons alter the accessible name — use form item container.
      const titleInput = modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Title' })
        .getByRole('textbox');
      await titleInput.clear();
      await titleInput.fill('Updated Title');

      // Change Access Level to Public. The form is long, so scroll the field into view
      // before opening the dropdown to ensure the option is also within the viewport.
      const accessLevelFormItem = modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Access Level' });
      await accessLevelFormItem.scrollIntoViewIfNeeded();
      await accessLevelFormItem.locator('.ant-select-content').click();
      const accessDropdown = page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .first();
      await expect(accessDropdown).toBeVisible();
      const publicOption = accessDropdown
        .locator('.ant-select-item-option')
        .filter({ hasText: 'Public' });
      await publicOption.scrollIntoViewIfNeeded();
      await publicOption.click();

      // Click Update
      await adminModelCardPage.getEditModalUpdateButton().click();

      // Verify success message
      await expect(page.getByText('Model card has been updated.')).toBeVisible({
        timeout: 15000,
      });

      // Verify the modal closes
      await expect(modal).toBeHidden();

      // Verify the table row reflects updated data
      const updatedRow = adminModelCardPage.getRowByName(testCardName);
      await expect(
        updatedRow.getByRole('cell', { name: 'Updated Title' }),
      ).toBeVisible({ timeout: 15000 });
      await expect(
        updatedRow.getByRole('cell', { name: 'Public' }),
      ).toBeVisible({ timeout: 15000 });
    });

    // 4.3 Superadmin cannot save an edit when the Name field is cleared
    test('Superadmin cannot save an edit when the Name field is cleared', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();

      // Refresh the table to ensure newly created card is visible
      await adminModelCardPage.getRefreshButton().click();
      await adminModelCardPage.waitForTableLoad();

      // Filter to find the test card
      await adminModelCardPage.applyNameFilter(testCardName);
      // Wait for the filter results — the card may take a moment to appear after creation
      await expect(adminModelCardPage.getRowByName(testCardName)).toBeVisible({
        timeout: 15000,
      });

      // Open edit modal
      await adminModelCardPage.openEditModal(testCardName);
      const modal = adminModelCardPage.getEditModal();

      // Clear the Name field completely
      await adminModelCardPage.getEditModalNameInput().clear();

      // Wait for the form to stabilize after clearing (avoids DOM detachment)
      await expect(adminModelCardPage.getEditModalUpdateButton()).toBeVisible();

      // Click Update
      await adminModelCardPage.getEditModalUpdateButton().click();

      // Verify validation error "Name is required."
      await expect(modal.getByText('Name is required.')).toBeVisible();

      // Verify the modal remains open
      await expect(modal).toBeVisible();
    });

    // 4.4 Superadmin can cancel the Edit modal without saving changes
    test('Superadmin can cancel the Edit modal without saving changes', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();

      // Refresh the table to ensure newly created card is visible
      await adminModelCardPage.getRefreshButton().click();
      await adminModelCardPage.waitForTableLoad();

      // Filter to find the test card
      await adminModelCardPage.applyNameFilter(testCardName);
      // Wait for the filter results — the card may take a moment to appear after creation
      await expect(adminModelCardPage.getRowByName(testCardName)).toBeVisible({
        timeout: 15000,
      });

      // Open edit modal
      await adminModelCardPage.openEditModal(testCardName);
      const modal = adminModelCardPage.getEditModal();

      // Change the Title to a value that should not be saved.
      // In antd v6, tooltip icons alter the accessible name — use form item container.
      const titleInput = modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Title' })
        .getByRole('textbox');
      await titleInput.clear();
      await titleInput.fill('Should Not Save');

      // Click Cancel
      await adminModelCardPage.getEditModalCancelButton().click();

      // Verify the modal closes
      await expect(modal).toBeHidden();

      // Verify the original title is preserved in the table
      const row = adminModelCardPage.getRowByName(testCardName);
      await expect(
        row.getByRole('cell', { name: 'Should Not Save' }),
      ).toBeHidden();
      await expect(
        row.getByRole('cell', { name: 'Original Title' }),
      ).toBeVisible();
    });
  },
);
