// spec: e2e/.agent-output/test-plan-admin-model-card.md
// section: 3. Create Model Card
import { AdminModelCardPage } from '../utils/classes/AdminModelCardPage';
import { loginAsAdmin, webuiEndpoint } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'Admin Model Card Management - Create',
  { tag: ['@admin-model-card', '@admin', '@crud'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    // 3.1 Superadmin can open the Create Model Card modal
    test('Superadmin can open the Create Model Card modal', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Click the Create Model Card button
      await adminModelCardPage.getCreateModelCardButton().click();

      // Verify the modal opens with title "Create Model Card"
      const modal = adminModelCardPage.getCreateModal();
      await expect(modal).toBeVisible();

      // Verify key form fields are present
      await expect(modal.getByRole('textbox', { name: 'Name' })).toBeVisible();
      await expect(modal.getByText('Model Storage Folder')).toBeVisible();
      await expect(modal.getByText('Domain').first()).toBeVisible({
        timeout: 10000,
      });
      await expect(
        modal.getByRole('textbox', { name: 'Author (optional)' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('textbox', { name: 'Title (optional)' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('textbox', { name: 'Model Version (optional)' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('textbox', { name: 'Description (optional)' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('textbox', { name: 'Task (optional)' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('textbox', { name: 'Category (optional)' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('textbox', { name: 'Architecture (optional)' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('textbox', { name: 'License (optional)' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('textbox', { name: 'README.md (optional)' }),
      ).toBeVisible();

      // Verify Access Level is present as a required field (no default value)
      await expect(
        modal.getByRole('combobox', { name: 'Access Level' }),
      ).toBeVisible();

      // Verify the Create and Cancel buttons are present in the modal footer
      await expect(
        adminModelCardPage.getCreateModalSubmitButton(),
      ).toBeVisible();
      await expect(
        adminModelCardPage.getCreateModalCancelButton(),
      ).toBeVisible();
    });

    // 3.2 Superadmin can create a model card with only required fields
    test('Superadmin can create a model card with only required fields', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      const cardName = `e2e-test-required-only-${Date.now()}`;

      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Click the Create Model Card button
      await adminModelCardPage.getCreateModelCardButton().click();
      const modal = adminModelCardPage.getCreateModal();
      await expect(modal).toBeVisible();

      // Fill in the Name field
      await modal.getByRole('textbox', { name: 'Name' }).fill(cardName);

      // Select an available VFolder
      await modal.getByRole('combobox').first().click();
      const vfolderDropdown = page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .first();
      await expect(vfolderDropdown).toBeVisible();
      await expect(vfolderDropdown.getByText(/Total \d+ items/)).toBeVisible({
        timeout: 10000,
      });
      await vfolderDropdown.locator('.ant-select-item-option').first().click();

      // Select Access Level (required)
      await modal.getByRole('combobox', { name: 'Access Level' }).click();
      const accessDropdown = page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .first();
      await expect(accessDropdown).toBeVisible();
      await accessDropdown
        .locator('.ant-select-item-option')
        .filter({ hasText: 'Internal' })
        .click();

      // Click Create
      await adminModelCardPage.getCreateModalSubmitButton().click();

      // Verify success message
      await expect(page.getByText('Model card has been created.')).toBeVisible({
        timeout: 15000,
      });

      // Verify the modal closes
      await expect(modal).toBeHidden();

      // Verify the new model card appears in the table
      await expect(adminModelCardPage.getRowByName(cardName)).toBeVisible({
        timeout: 10000,
      });

      // Cleanup: delete the created model card
      await adminModelCardPage.deleteModelCardByName(cardName);
    });

    // 3.3 Superadmin can create a model card with all fields populated
    test('Superadmin can create a model card with all fields populated', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);
      const cardName = `e2e-test-full-card-${Date.now()}`;

      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Click Create Model Card
      await adminModelCardPage.getCreateModelCardButton().click();
      const modal = adminModelCardPage.getCreateModal();
      await expect(modal).toBeVisible();

      // Fill Name
      await modal.getByRole('textbox', { name: 'Name' }).fill(cardName);

      // Select VFolder
      await modal.getByRole('combobox').first().click();
      const vfolderDropdown = page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .first();
      await expect(vfolderDropdown).toBeVisible();
      await expect(vfolderDropdown.getByText(/Total \d+ items/)).toBeVisible({
        timeout: 10000,
      });
      await vfolderDropdown.locator('.ant-select-item-option').first().click();

      // Fill optional fields
      await modal
        .getByRole('textbox', { name: 'Author (optional)' })
        .fill('Test Author');
      await modal
        .getByRole('textbox', { name: 'Title (optional)' })
        .fill('Test Model Title');
      await modal
        .getByRole('textbox', { name: 'Model Version (optional)' })
        .fill('1.0.0');
      await modal
        .getByRole('textbox', { name: 'Description (optional)' })
        .fill('This is a test model description');
      await modal
        .getByRole('textbox', { name: 'Task (optional)' })
        .fill('text-generation');
      await modal
        .getByRole('textbox', { name: 'Category (optional)' })
        .fill('LLM');
      await modal
        .getByRole('textbox', { name: 'Architecture (optional)' })
        .fill('Transformer');
      await modal
        .getByRole('textbox', { name: 'License (optional)' })
        .fill('Apache-2.0');
      await modal
        .getByRole('textbox', { name: 'README.md (optional)' })
        .fill('# Test Model\nThis is a test model.');

      // Change Access Level to Public
      await modal.getByRole('combobox', { name: 'Access Level' }).click();
      await expect(
        page
          .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
          .first(),
      ).toBeVisible();
      await page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .first()
        .locator('.ant-select-item-option')
        .filter({ hasText: 'Public' })
        .click();

      // Click Create
      await adminModelCardPage.getCreateModalSubmitButton().click();

      // Verify success message
      await expect(
        page.getByText('Model card has been created.'),
      ).toBeVisible();

      // Verify the modal closes
      await expect(modal).toBeHidden();

      // Verify the new row in the table reflects the correct data
      const newRow = adminModelCardPage.getRowByName(cardName);
      await expect(newRow).toBeVisible({ timeout: 10000 });
      await expect(
        newRow.getByRole('cell', { name: 'Test Model Title' }),
      ).toBeVisible();
      await expect(newRow.getByRole('cell', { name: 'LLM' })).toBeVisible();
      await expect(
        newRow.getByRole('cell', { name: 'text-generation' }),
      ).toBeVisible();
      await expect(newRow.getByRole('cell', { name: 'Public' })).toBeVisible();

      // Cleanup: delete the created model card
      await adminModelCardPage.deleteModelCardByName(cardName);
    });

    // 3.4 Superadmin cannot create a model card without a Name
    test('Superadmin cannot create a model card without a Name', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);

      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Open create modal
      await adminModelCardPage.getCreateModelCardButton().click();
      const modal = adminModelCardPage.getCreateModal();
      await expect(modal).toBeVisible();

      // Select a VFolder but leave Name empty
      await modal.getByRole('combobox').first().click();
      const vfolderDropdown = page
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .first();
      await expect(vfolderDropdown).toBeVisible();
      await expect(vfolderDropdown.getByText(/Total \d+ items/)).toBeVisible({
        timeout: 10000,
      });
      await vfolderDropdown.locator('.ant-select-item-option').first().click();

      // Click Create
      await adminModelCardPage.getCreateModalSubmitButton().click();

      // Verify validation error "Name is required."
      await expect(modal.getByText('Name is required.')).toBeVisible();

      // Verify the modal remains open
      await expect(modal).toBeVisible();
    });

    // 3.5 Superadmin cannot create a model card without a Model Storage Folder
    test('Superadmin cannot create a model card without a Model Storage Folder', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);

      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Open create modal
      await adminModelCardPage.getCreateModelCardButton().click();
      const modal = adminModelCardPage.getCreateModal();
      await expect(modal).toBeVisible();

      // Fill Name but leave VFolder empty
      await modal
        .getByRole('textbox', { name: 'Name' })
        .fill('test-no-vfolder');

      // Click Create
      await adminModelCardPage.getCreateModalSubmitButton().click();

      // Verify validation error "VFolder is required."
      await expect(modal.getByText('VFolder is required.')).toBeVisible();

      // Verify the modal remains open
      await expect(modal).toBeVisible();
    });

    // 3.7 Superadmin can cancel the Create Model Card modal without creating anything
    test('Superadmin can cancel the Create Model Card modal without creating anything', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);

      await page.goto(`${webuiEndpoint}/admin-serving?tab=model-store`);
      await adminModelCardPage.waitForTableLoad();

      // Get initial pagination count to verify no change
      const paginationInfo = adminModelCardPage.getPaginationInfo();
      const initialCountText = await paginationInfo.textContent();

      // Open create modal
      await adminModelCardPage.getCreateModelCardButton().click();
      const modal = adminModelCardPage.getCreateModal();
      await expect(modal).toBeVisible();

      // Fill in Name with a unique value per run
      const cancelledName = `test-cancelled-creation-${Date.now()}`;
      await modal.getByRole('textbox', { name: 'Name' }).fill(cancelledName);

      // Click Cancel
      await adminModelCardPage.getCreateModalCancelButton().click();

      // Verify the modal closes
      await expect(modal).toBeHidden();

      // Verify no new model card was created (table count unchanged)
      await expect(paginationInfo).toHaveText(initialCountText!);

      // Verify the cancelled model card name is not in the table
      await expect(
        page.getByRole('cell', {
          name: cancelledName,
          exact: true,
        }),
      ).toBeHidden();
    });
  },
);
