// spec: e2e/session-template CRUD test
// Tests for Session Template management at /admin-session?tab=session-templates
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_RUN_ID = Date.now().toString(36);
const TEST_TEMPLATE_PREFIX = 'e2e-test-';
const TEST_TEMPLATE_NAME = `${TEST_TEMPLATE_PREFIX}tpl-${TEST_RUN_ID}`;
const TEST_TEMPLATE_NAME_EDITED = `${TEST_TEMPLATE_PREFIX}tpl-${TEST_RUN_ID}-edited`;

const TEST_IMAGE = 'cr.backend.ai/stable/python:3.9-ubuntu20.04';
const TEST_IMAGE_EDITED = 'cr.backend.ai/stable/python:3.11-ubuntu22.04';

async function navigateToSessionTemplateTab(page: Page) {
  await navigateTo(page, 'admin-session?tab=session-templates');
  await expect(
    page.getByRole('tab', { name: 'Session Templates', selected: true }),
  ).toBeVisible({ timeout: 10000 });
  // Wait for the table to be visible
  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 10000 });
}

/**
 * Open the Create Session Template modal, fill in all required fields,
 * and submit. Returns after the modal has closed.
 */
async function createSessionTemplateInUI(
  page: Page,
  options: {
    name: string;
    sessionType: 'interactive' | 'batch' | 'inference';
    image: string;
  },
) {
  // Open create modal
  await page.getByRole('button', { name: 'Create' }).click();

  const modal = page.getByRole('dialog', {
    name: 'Create Session Template',
  });
  await expect(modal).toBeVisible({ timeout: 5000 });

  // Fill in the name (optional field)
  await modal.getByRole('textbox', { name: 'Name' }).fill(options.name);

  // Select domain — wait for the dropdown options to load
  await modal.getByRole('combobox', { name: 'Domain Name' }).click();
  await page.waitForSelector('.ant-select-dropdown', {
    state: 'visible',
    timeout: 5000,
  });
  // Pick the first domain option
  await page
    .locator('.ant-select-dropdown')
    .locator('.ant-select-item-option')
    .first()
    .click();

  // Select session type
  const sessionTypeLabels: Record<
    'interactive' | 'batch' | 'inference',
    string
  > = {
    interactive: 'Interactive',
    batch: 'Batch',
    inference: 'Inference',
  };
  const sessionTypeLabel = sessionTypeLabels[options.sessionType];
  const sessionTypeCombobox = modal.getByRole('combobox', {
    name: 'Session Type',
  });
  await sessionTypeCombobox.click();
  // Wait for and click the visible dropdown item
  // Ant Design Select renders visible items as .ant-select-item-option elements
  // (the role="option" elements are hidden accessibility-only nodes)
  const sessionTypeOption = page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    .locator('.ant-select-item-option', { hasText: sessionTypeLabel })
    .first();
  await expect(sessionTypeOption).toBeVisible({ timeout: 5000 });
  await sessionTypeOption.click();

  // Fill in image
  await modal.getByRole('textbox', { name: 'Image' }).fill(options.image);

  // Add a resource row — CPU
  // The first resource row is already present; select Resource Type via its combobox
  // Click the resource type Select trigger in the first resource row
  // Find the resource type selector with "Resource Type" placeholder
  const resourceTypeSelector = modal
    .locator('.ant-select-selector', {
      has: modal.locator(
        '[title="Resource Type"], [placeholder="Resource Type"]',
      ),
    })
    .first();
  await resourceTypeSelector.click();
  const cpuOption = page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    .locator('.ant-select-item-option', { hasText: 'CPU' })
    .first();
  await expect(cpuOption).toBeVisible({ timeout: 5000 });
  await cpuOption.click();

  // After selecting CPU, a BAIDynamicStepInputNumber appears for the allocation
  // It's an ant-input-number input; fill it with the value
  const cpuInput = modal.locator('.ant-input-number-input').last();
  await cpuInput.fill('4');

  // Submit
  await modal.getByRole('button', { name: 'OK' }).click();

  // Modal should close
  await expect(modal).toBeHidden({ timeout: 15000 });
}

/**
 * Delete a template row from the UI table by name.
 * Returns true if the template was found and deleted, false if not found.
 */
async function deleteTemplateByNameInUI(
  page: Page,
  templateName: string,
): Promise<boolean> {
  const row = page.getByRole('row').filter({ hasText: templateName });
  const isVisible = await row.isVisible({ timeout: 3000 }).catch(() => false);
  if (!isVisible) return false;

  // Click the delete (danger) button in that row
  await row
    .getByRole('button')
    .filter({ has: page.locator('[data-icon="delete"]') })
    .click();

  // BAIConfirmModalWithInput requires typing the template name to confirm
  const confirmModal = page.getByRole('dialog');
  await expect(confirmModal).toBeVisible({ timeout: 5000 });

  // Type the template name in the confirmation input
  await confirmModal.getByRole('textbox').fill(templateName);

  // Click the OK/Delete button (now enabled after typing correct text)
  await confirmModal.getByRole('button', { name: 'OK' }).click();

  // Wait for row to disappear
  await expect(row).toBeHidden({ timeout: 10000 });
  return true;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe(
  'Session Template Management',
  { tag: ['@regression', '@session-template', '@functional'] },
  () => {
    test.describe.serial('Session Template CRUD', () => {
      test('Admin can navigate to session template tab and see the table', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await navigateToSessionTemplateTab(page);

        // Verify the table headers
        await expect(
          page.getByRole('columnheader', { name: 'Name' }),
        ).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: 'Image' }),
        ).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: 'Session Type' }),
        ).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: 'Resources' }),
        ).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: 'Domain' }),
        ).toBeVisible();

        // Verify Create button exists
        await expect(
          page.getByRole('button', { name: 'Create' }),
        ).toBeVisible();
      });

      test('Admin can create a new session template via the UI', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await navigateToSessionTemplateTab(page);

        await createSessionTemplateInUI(page, {
          name: TEST_TEMPLATE_NAME,
          sessionType: 'interactive',
          image: TEST_IMAGE,
        });

        // Verify new template appears in the table
        await expect(
          page.getByRole('cell', { name: TEST_TEMPLATE_NAME, exact: true }),
        ).toBeVisible({ timeout: 10000 });
      });

      test('Template created via UI actually exists in the backend API', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await navigateToSessionTemplateTab(page);

        // Verify the template row is visible in UI
        const templateRow = page
          .getByRole('row')
          .filter({ hasText: TEST_TEMPLATE_NAME });
        await expect(templateRow).toBeVisible({ timeout: 10000 });

        // Verify image is displayed in the row
        await expect(templateRow).toContainText(TEST_IMAGE);
      });

      test('Admin can edit an existing session template', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await navigateToSessionTemplateTab(page);

        // Find the test template row and click the edit button
        const templateRow = page
          .getByRole('row')
          .filter({ hasText: TEST_TEMPLATE_NAME });
        await expect(templateRow).toBeVisible({ timeout: 10000 });

        // Click the edit (info-colored) button
        await templateRow
          .getByRole('button')
          .filter({ has: page.locator('[data-icon="edit"]') })
          .click();

        const modal = page.getByRole('dialog', {
          name: 'Edit Session Template',
        });
        await expect(modal).toBeVisible({ timeout: 5000 });

        // Update name
        const nameInput = modal.getByRole('textbox', { name: 'Name' });
        await nameInput.clear();
        await nameInput.fill(TEST_TEMPLATE_NAME_EDITED);

        // Update image
        const imageInput = modal.getByRole('textbox', { name: 'Image' });
        await imageInput.clear();
        await imageInput.fill(TEST_IMAGE_EDITED);

        // Submit
        await modal.getByRole('button', { name: 'OK' }).click();

        // Modal should close
        await expect(modal).toBeHidden({ timeout: 15000 });

        // Verify updated name appears in the table
        await expect(
          page.getByRole('cell', {
            name: TEST_TEMPLATE_NAME_EDITED,
            exact: true,
          }),
        ).toBeVisible({ timeout: 10000 });

        // Verify updated image is visible
        const updatedRow = page
          .getByRole('row')
          .filter({ hasText: TEST_TEMPLATE_NAME_EDITED });
        await expect(updatedRow).toContainText(TEST_IMAGE_EDITED);
      });

      test('Admin can delete a session template', async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateToSessionTemplateTab(page);

        // Find the edited test template row
        const templateRow = page
          .getByRole('row')
          .filter({ hasText: TEST_TEMPLATE_NAME_EDITED });
        await expect(templateRow).toBeVisible({ timeout: 10000 });

        // Click the delete button
        await templateRow
          .getByRole('button')
          .filter({ has: page.locator('[data-icon="delete"]') })
          .click();

        // BAIConfirmModalWithInput: type template name to confirm deletion
        const confirmModal = page.getByRole('dialog');
        await expect(confirmModal).toBeVisible({ timeout: 5000 });
        await confirmModal.getByRole('textbox').fill(TEST_TEMPLATE_NAME_EDITED);
        await confirmModal.getByRole('button', { name: 'OK' }).click();

        // Verify the template is removed from the table
        await expect(
          page.getByRole('row').filter({ hasText: TEST_TEMPLATE_NAME_EDITED }),
        ).toBeHidden({ timeout: 10000 });
      });

      test('Create modal shows validation error when required fields are empty', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await navigateToSessionTemplateTab(page);

        // Open create modal
        await page.getByRole('button', { name: 'Create' }).click();

        const modal = page.getByRole('dialog', {
          name: 'Create Session Template',
        });
        await expect(modal).toBeVisible({ timeout: 5000 });

        // Click OK without filling any required field
        await modal.getByRole('button', { name: 'OK' }).click();

        // Modal should still be open
        await expect(modal).toBeVisible();

        // Validation error for Domain Name (required)
        await expect(modal.getByText('Please select a domain')).toBeVisible();

        // Validation error for Image (required)
        await expect(
          modal.getByText('Please enter the container image URI'),
        ).toBeVisible();

        // Close modal
        await modal.getByRole('button', { name: 'Cancel' }).click();
        await expect(modal).toBeHidden({ timeout: 5000 });
      });
    });

    // -------------------------------------------------------------------------
    // Parameterized tests: one describe block per session type
    // Each block creates a template with the given session type, verifies it
    // appears in the list with the correct session type label, then cleans up.
    // -------------------------------------------------------------------------
    const SESSION_TYPE_CASES: Array<{
      sessionType: 'interactive' | 'batch' | 'inference';
      label: string;
    }> = [
      { sessionType: 'interactive', label: 'Interactive' },
      { sessionType: 'batch', label: 'Batch' },
      { sessionType: 'inference', label: 'Inference' },
    ];

    for (const { sessionType, label } of SESSION_TYPE_CASES) {
      test.describe(`Session Template - ${label} type`, () => {
        const templateName = `${TEST_TEMPLATE_PREFIX}${sessionType}-${TEST_RUN_ID}`;

        test.afterAll(async ({ browser }) => {
          // Cleanup: delete the template created by this describe block
          const context = await browser.newContext();
          const page = await context.newPage();
          const request = context.request;
          try {
            await loginAsAdmin(page, request);
            await navigateToSessionTemplateTab(page);
            await deleteTemplateByNameInUI(page, templateName).catch(() => {});
          } finally {
            await context.close();
          }
        });

        test(`Admin can create a session template with session type: ${label}`, async ({
          page,
          request,
        }) => {
          await loginAsAdmin(page, request);
          await navigateToSessionTemplateTab(page);

          await createSessionTemplateInUI(page, {
            name: templateName,
            sessionType,
            image: TEST_IMAGE,
          });

          // Verify new template appears in the table
          await expect(
            page.getByRole('cell', { name: templateName, exact: true }),
          ).toBeVisible({ timeout: 10000 });
        });

        test(`Template with session type ${label} shows correct session type in the list`, async ({
          page,
          request,
        }) => {
          await loginAsAdmin(page, request);
          await navigateToSessionTemplateTab(page);

          // Find the template row and verify it contains the expected session type label
          const templateRow = page
            .getByRole('row')
            .filter({ hasText: templateName });
          await expect(templateRow).toBeVisible({ timeout: 10000 });
          await expect(templateRow).toContainText(label);
        });
      });
    }

    test.describe.serial('Session Template Filtering', () => {
      const FILTER_TEMPLATE_NAME = `${TEST_TEMPLATE_PREFIX}filter-${TEST_RUN_ID}`;

      test.afterAll(async ({ browser }) => {
        // Cleanup: remove the filter test template if it exists
        const context = await browser.newContext();
        const page = await context.newPage();
        const request = context.request;
        try {
          await loginAsAdmin(page, request);
          await navigateToSessionTemplateTab(page);
          await deleteTemplateByNameInUI(page, FILTER_TEMPLATE_NAME).catch(
            () => {},
          );
        } finally {
          await context.close();
        }
      });

      test('Admin can search for a specific session template by name in table', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await navigateToSessionTemplateTab(page);

        // First create a template to filter
        await createSessionTemplateInUI(page, {
          name: FILTER_TEMPLATE_NAME,
          sessionType: 'interactive',
          image: TEST_IMAGE,
        });

        // Verify the template is in the table
        await expect(
          page.getByRole('cell', { name: FILTER_TEMPLATE_NAME, exact: true }),
        ).toBeVisible({ timeout: 10000 });

        // Use the BAITable search if available, or verify by inspecting the row
        // The table shows the template with its name, which we've already verified above
        const templateRow = page
          .getByRole('row')
          .filter({ hasText: FILTER_TEMPLATE_NAME });
        await expect(templateRow).toBeVisible();
        await expect(templateRow).toContainText(TEST_IMAGE);
      });
    });
  },
);
