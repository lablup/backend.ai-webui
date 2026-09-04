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
      // The label text renders twice: once as the form-item label, once as the
      // ComplexSelector trigger's own internal label — scope to .first().
      await expect(modal.getByText('Model Storage Folder').first()).toBeVisible();
      await expect(modal.getByText('Domain').first()).toBeVisible({
        timeout: 10000,
      });
      await expect(
        modal
          .locator('[data-bai-form-item]')
          .filter({ hasText: 'Author' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('[data-bai-form-item]')
          .filter({ hasText: 'Title' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('[data-bai-form-item]')
          .filter({ hasText: 'Model Version' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('[data-bai-form-item]')
          .filter({ hasText: 'Description' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('[data-bai-form-item]')
          .filter({ hasText: 'Task' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('[data-bai-form-item]')
          .filter({ hasText: 'Category' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('[data-bai-form-item]')
          .filter({ hasText: 'Architecture' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('[data-bai-form-item]')
          .filter({ hasText: 'License' })
          .getByRole('textbox'),
      ).toBeVisible();
      await expect(
        modal
          .locator('[data-bai-form-item]')
          .filter({ hasText: 'README.md' })
          .getByRole('textbox'),
      ).toBeVisible();

      // Verify Access Level is present as a required field.
      // Access Level is a plain Astryx `Selector` rendered as a combobox.
      await expect(
        modal
          .locator('[data-bai-form-item]')
          .filter({ hasText: 'Access Level' })
          .getByRole('combobox'),
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
    // BLOCKED BY BACKEND: `adminCreateModelCardV2` currently fails server-side
    // with "ModelCardGQL.__init__() got an unexpected keyword argument
    // 'min_resource'" (backendai_generic_internal-error). The locators in this
    // test are correct; the mutation itself cannot succeed until the manager
    // is fixed.
    test.fixme(
      'Superadmin can create a model card with only required fields',
      async ({ page }) => {
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
      // Access Level is a plain Astryx `Selector` (role="combobox" trigger,
      // role="listbox"/"option" popup).
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Access Level' })
        .getByRole('combobox')
        .click();
      await page.getByRole('option', { name: 'Private', exact: true }).click();

      // Synchronize on the mutation response itself (not just the toast) so a
      // server-side mutation failure surfaces as a clear thrown error instead
      // of an opaque "toast never appeared" timeout.
      const createResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/admin/gql') &&
          (response.request().postData() ?? '').includes(
            'AdminModelCardSettingModalCreateMutation',
          ),
        { timeout: 30000 },
      );
      await adminModelCardPage.getCreateModalSubmitButton().click();
      const createResponse = await createResponsePromise;
      if (!createResponse.ok()) {
        throw new Error(
          `Model card create mutation returned ${createResponse.status()}: ${await createResponse.text()}`,
        );
      }
      const createBody = await createResponse.json();
      if (createBody.errors) {
        throw new Error(
          `Model card create mutation returned errors: ${JSON.stringify(createBody.errors)}`,
        );
      }

      // Verify success message
      await expect(page.getByText('Model card has been created.')).toBeVisible({
        timeout: 15000,
      });

      // Verify the modal closes
      await expect(modal).toBeHidden({ timeout: 30000 });

      // Verify the new model card appears in the table
      await expect(adminModelCardPage.getRowByName(cardName)).toBeVisible({
        timeout: 10000,
      });

      // Cleanup: delete the created model card, then purge the folder
      await adminModelCardPage.deleteModelCardByName(cardName);
      try {
        await moveToTrashAndVerify(page, folderName, 'admin-data', {
          skipTrashVerify: true,
        });
      } catch {
        // Folder may already be in Trash or may not exist
      }
      try {
        await deleteForeverAndVerifyFromTrash(page, folderName, 'admin-data');
      } catch {
        // Folder may not be in Trash (already purged or never created)
      }
      },
    );

    // 3.3 Superadmin can create a model card with all fields populated
    // BLOCKED BY BACKEND: `adminCreateModelCardV2` currently fails server-side
    // with "ModelCardGQL.__init__() got an unexpected keyword argument
    // 'min_resource'" (backendai_generic_internal-error). The locators in this
    // test are correct; the mutation itself cannot succeed until the manager
    // is fixed.
    test.fixme(
      'Superadmin can create a model card with all fields populated',
      async ({ page }) => {
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
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Author' })
        .getByRole('textbox')
        .fill('Test Author');
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Title' })
        .getByRole('textbox')
        .fill('Test Model Title');
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Model Version' })
        .getByRole('textbox')
        .fill('1.0.0');
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Description' })
        .getByRole('textbox')
        .fill('This is a test model description');
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Task' })
        .getByRole('textbox')
        .fill('text-generation');
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Category' })
        .getByRole('textbox')
        .fill('LLM');
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Architecture' })
        .getByRole('textbox')
        .fill('Transformer');
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'License' })
        .getByRole('textbox')
        .fill('Apache-2.0');
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'README.md' })
        .getByRole('textbox')
        .fill('# Test Model\nThis is a test model.');

      // Change Access Level to Public.
      // Access Level is a plain Astryx `Selector` (role="combobox" trigger,
      // role="listbox"/"option" popup).
      await modal
        .locator('[data-bai-form-item]')
        .filter({ hasText: 'Access Level' })
        .getByRole('combobox')
        .click();
      await page.getByRole('option', { name: 'Public', exact: true }).click();

      // Synchronize on the mutation response itself (not just the toast) so a
      // server-side mutation failure surfaces as a clear thrown error instead
      // of an opaque "toast never appeared" timeout.
      const createResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/admin/gql') &&
          (response.request().postData() ?? '').includes(
            'AdminModelCardSettingModalCreateMutation',
          ),
        { timeout: 30000 },
      );
      await adminModelCardPage.getCreateModalSubmitButton().click();
      const createResponse = await createResponsePromise;
      if (!createResponse.ok()) {
        throw new Error(
          `Model card create mutation returned ${createResponse.status()}: ${await createResponse.text()}`,
        );
      }
      const createBody = await createResponse.json();
      if (createBody.errors) {
        throw new Error(
          `Model card create mutation returned errors: ${JSON.stringify(createBody.errors)}`,
        );
      }

      // Verify success message
      await expect(page.getByText('Model card has been created.')).toBeVisible({
        timeout: 15000,
      });

      // Verify the modal closes
      await expect(modal).toBeHidden({ timeout: 30000 });

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
        await moveToTrashAndVerify(page, folderName, 'admin-data', {
          skipTrashVerify: true,
        });
      } catch {
        // Folder may already be in Trash or may not exist
      }
      try {
        await deleteForeverAndVerifyFromTrash(page, folderName, 'admin-data');
      } catch {
        // Folder may not be in Trash (already purged or never created)
      }
      },
    );

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
        await moveToTrashAndVerify(page, folderName, 'admin-data', {
          skipTrashVerify: true,
        });
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
      // The VFolder picker is Astryx `ComplexSelector` (role="button" trigger).
      await expect(adminModelCardPage.getCreateModalVFolderSelect()).toBeVisible(
        { timeout: 15000 },
      );
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
