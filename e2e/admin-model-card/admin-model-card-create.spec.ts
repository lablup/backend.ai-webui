// spec: e2e/.agent-output/test-plan-admin-model-card.md
// section: 3. Create Model Card
import { AdminModelCardPage } from '../utils/classes/AdminModelCardPage';
import {
  deleteForeverAndVerifyFromTrash,
  loginAsAdmin,
  moveToTrashAndVerify,
  webuiEndpoint,
} from '../utils/test-util';
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
      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();

      // Click the Create Model Card button
      await adminModelCardPage.getCreateModelCardButton().click();

      // Verify the modal opens with title "Create Model Card"
      const modal = adminModelCardPage.getCreateModal();
      await expect(modal).toBeVisible();

      // Verify key form fields are present.
      // In antd v6, Form.Item tooltip icons contribute "question-circle" to the accessible
      // name, so we locate fields by form item label text rather than exact accessible name.
      await expect(modal.getByRole('textbox', { name: 'Name' })).toBeVisible();
      await expect(modal.getByText('Model Storage Folder')).toBeVisible();
      await expect(modal.getByText('Domain').first()).toBeVisible({
        timeout: 10000,
      });
      await expect(
        modal
          .locator('.ant-form-item')
          .filter({ hasText: 'Author' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('.ant-form-item')
          .filter({ hasText: 'Title' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('.ant-form-item')
          .filter({ hasText: 'Model Version' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('.ant-form-item')
          .filter({ hasText: 'Description' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('.ant-form-item')
          .filter({ hasText: 'Task' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('.ant-form-item')
          .filter({ hasText: 'Category' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('.ant-form-item')
          .filter({ hasText: 'Architecture' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('.ant-form-item')
          .filter({ hasText: 'License' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('.ant-form-item')
          .filter({ hasText: 'README.md' })
          .getByRole('textbox'),
      ).toBeVisible();

      // Verify Access Level is present as a required field
      await expect(
        modal
          .locator('.ant-form-item')
          .filter({ hasText: 'Access Level' })
          .locator('.ant-select'),
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
      test.setTimeout(90000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const cardName = `e2e-test-required-only-${timestamp}`;
      const folderName = `e2e-test-required-only-folder-${timestamp}`;

      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();

      // Click the Create Model Card button
      await adminModelCardPage.getCreateModelCardButton().click();
      const modal = adminModelCardPage.getCreateModal();
      await expect(modal).toBeVisible();

      // Fill in the Name field
      await modal.getByRole('textbox', { name: 'Name' }).fill(cardName);

      // Create a new VFolder via the "+" button — self-provisions so no pre-existing
      // group-owned VFolder is required on the test backend.
      await adminModelCardPage.createNewFolderViaPlus(folderName);

      // Select Access Level (required). Access level options are "Private" (INTERNAL) and "Public".
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

      // Cleanup: delete the created model card, then purge the folder
      await adminModelCardPage.deleteModelCardByName(cardName);
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
    });

    // 3.3 Superadmin can create a model card with all fields populated
    test('Superadmin can create a model card with all fields populated', async ({
      page,
    }) => {
      test.setTimeout(90000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const timestamp = Date.now();
      const cardName = `e2e-test-full-card-${timestamp}`;
      const folderName = `e2e-test-full-card-folder-${timestamp}`;

      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();

      // Click Create Model Card
      await adminModelCardPage.getCreateModelCardButton().click();
      const modal = adminModelCardPage.getCreateModal();
      await expect(modal).toBeVisible();

      // Fill Name
      await modal.getByRole('textbox', { name: 'Name' }).fill(cardName);

      // Create a new VFolder via the "+" button — self-provisions so no pre-existing
      // group-owned VFolder is required on the test backend.
      await adminModelCardPage.createNewFolderViaPlus(folderName);

      // Fill optional fields. In antd v6, tooltip icons alter the accessible name so
      // we locate textboxes via their parent form item label.
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Author' })
        .getByRole('textbox')
        .fill('Test Author');
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Title' })
        .getByRole('textbox')
        .fill('Test Model Title');
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Model Version' })
        .getByRole('textbox')
        .fill('1.0.0');
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Description' })
        .getByRole('textbox')
        .fill('This is a test model description');
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Task' })
        .getByRole('textbox')
        .fill('text-generation');
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Category' })
        .getByRole('textbox')
        .fill('LLM');
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Architecture' })
        .getByRole('textbox')
        .fill('Transformer');
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'License' })
        .getByRole('textbox')
        .fill('Apache-2.0');
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'README.md' })
        .getByRole('textbox')
        .fill('# Test Model\nThis is a test model.');

      // Change Access Level to Public
      await modal
        .locator('.ant-form-item')
        .filter({ hasText: 'Access Level' })
        .locator('.ant-select-content')
        .click();
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
      await expect(page.getByText('Model card has been created.')).toBeVisible({
        timeout: 15000,
      });

      // Verify the modal closes
      await expect(modal).toBeHidden({ timeout: 15000 });

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

      // Cleanup: delete the created model card, then purge the folder
      await adminModelCardPage.deleteModelCardByName(cardName);
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
    });

    // 3.4 Superadmin cannot create a model card without a Name
    test('Superadmin cannot create a model card without a Name', async ({
      page,
    }) => {
      test.setTimeout(90000);
      const adminModelCardPage = new AdminModelCardPage(page);
      const folderName = `e2e-test-no-name-folder-${Date.now()}`;

      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();

      // Open create modal
      await adminModelCardPage.getCreateModelCardButton().click();
      const modal = adminModelCardPage.getCreateModal();
      await expect(modal).toBeVisible();

      // Create a new VFolder via the "+" button (leave Name empty) — self-provisions
      // so no pre-existing group-owned VFolder is required on the test backend.
      await adminModelCardPage.createNewFolderViaPlus(folderName);

      // Click Create (Name is empty — validation should fire)
      await adminModelCardPage.getCreateModalSubmitButton().click();

      // Verify validation error "Name is required."
      await expect(modal.getByText('Name is required.')).toBeVisible();

      // Verify the modal remains open
      await expect(modal).toBeVisible();

      // Close the modal and clean up the folder created via "+"
      await adminModelCardPage.getCreateModalCancelButton().click();
      await expect(modal).toBeHidden();
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
    });

    // 3.5 Superadmin cannot create a model card without a Model Storage Folder
    test('Superadmin cannot create a model card without a Model Storage Folder', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);

      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
      await adminModelCardPage.waitForTableLoad();

      // Open create modal
      await adminModelCardPage.getCreateModelCardButton().click();
      const modal = adminModelCardPage.getCreateModal();
      await expect(modal).toBeVisible();

      // Fill Name but leave VFolder empty.
      // Wait for the VFolder select to load out of Suspense before filling the name,
      // so the form field is registered and will fire validation on submit.
      await expect(
        modal
          .locator('.ant-form-item')
          .filter({ hasText: 'Model Storage Folder' })
          .locator('.ant-select-content'),
      ).toBeVisible({ timeout: 15000 });
      await modal
        .getByRole('textbox', { name: 'Name' })
        .fill('test-no-vfolder');

      // Click Create
      await adminModelCardPage.getCreateModalSubmitButton().click();

      // Verify validation error "VFolder is required."
      await expect(modal.getByText('VFolder is required.')).toBeVisible({
        timeout: 10000,
      });

      // Verify the modal remains open
      await expect(modal).toBeVisible();
    });

    // 3.7 Superadmin can cancel the Create Model Card modal without creating anything
    test('Superadmin can cancel the Create Model Card modal without creating anything', async ({
      page,
    }) => {
      const adminModelCardPage = new AdminModelCardPage(page);

      await page.goto(
        `${webuiEndpoint}/admin-deployments?tab=model-store-management`,
      );
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
