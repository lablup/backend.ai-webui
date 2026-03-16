// spec: e2e/.agent-output/test-plan-registry.md
// Container Registry E2E tests covering:
//   - Registry list rendering
//   - Registry CRUD (serial: create → verify → edit → verify → delete)
//   - Registry controls (enable/disable toggle, delete confirmation guard)
//   - Registry filtering via BAIPropertyFilter
import { loginAsAdmin } from '../utils/test-util';
import { Page, expect, test } from '@playwright/test';

// ---------------------------------------------------------------------------
// Shared navigation helper
// ---------------------------------------------------------------------------

async function navigateToRegistriesTab(page: Page) {
  await page.getByRole('menuitem', { name: 'Admin Settings' }).click();
  await page.getByRole('menuitem', { name: 'file-done Environments' }).click();
  await page.getByRole('tab', { name: /Registries/i }).click();
  await expect(page.getByRole('table')).toBeVisible();
}

// ---------------------------------------------------------------------------
// Shared filter helpers
// ---------------------------------------------------------------------------

async function applyRegistryFilter(page: Page, value: string) {
  // Registry Name is the only filter property and is auto-selected,
  // so we only need to fill the value and search.
  const valueInput = page.locator('[aria-label="Filter value search"]');
  await valueInput.fill(value);
  await page.getByRole('button', { name: 'search' }).click();
  await page
    .locator('.ant-spin-spinning')
    .waitFor({ state: 'detached', timeout: 10000 })
    .catch(() => {});
}

async function removeRegistryFilterTag(page: Page, tagText: string) {
  const tag = page
    .locator('.ant-tag')
    .filter({ has: page.locator('[aria-label="Close"]') })
    .filter({ hasText: tagText });
  await tag.locator('[aria-label="Close"]').click();
  await page
    .locator('.ant-spin-spinning')
    .waitFor({ state: 'detached', timeout: 10000 })
    .catch(() => {});
}

// ---------------------------------------------------------------------------
// Suite 1: Registry List Rendering
// ---------------------------------------------------------------------------

test.describe(
  'Registry List Rendering',
  { tag: ['@regression', '@environment', '@functional', '@registry'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateToRegistriesTab(page);
    });

    // 1.1
    test('Admin can see the registry table with all expected columns', async ({
      page,
    }) => {
      // Verify table is visible
      await expect(page.getByRole('table')).toBeVisible();

      // Verify all column headers
      const table = page.getByRole('table');
      await expect(
        table.getByRole('columnheader', { name: 'Registry Name' }),
      ).toBeVisible();
      await expect(
        table.getByRole('columnheader', { name: 'Registry URL' }),
      ).toBeVisible();
      await expect(
        table.getByRole('columnheader', { name: 'Type' }),
      ).toBeVisible();
      await expect(
        table.getByRole('columnheader', { name: 'Project' }),
      ).toBeVisible();
      await expect(
        table.getByRole('columnheader', { name: 'Username' }),
      ).toBeVisible();
      await expect(
        table.getByRole('columnheader', { name: 'Password' }),
      ).toBeVisible();
      await expect(
        table.getByRole('columnheader', { name: 'Enabled' }),
      ).toBeVisible();
      await expect(
        table.getByRole('columnheader', { name: 'Control' }),
      ).toBeVisible();
    });

    // 1.2
    test('Admin can see the Add Registry button and filter bar', async ({
      page,
    }) => {
      await expect(
        page.getByRole('button', { name: /Add Registry/i }),
      ).toBeVisible();
      await expect(
        page.getByRole('combobox', { name: 'Filter property selector' }),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'reload' })).toBeVisible();
    });

    // 1.3
    test('Admin can see the Enabled toggle switch in each registry row', async ({
      page,
    }) => {
      const rows = page.locator('.ant-table-tbody .ant-table-row');
      await expect(rows.first()).toBeVisible();
      // Verify the first row contains a switch toggle in the Enabled column
      await expect(rows.first().getByRole('switch')).toBeVisible();
    });

    // 1.4
    test('Admin can see the Control buttons (Edit, Delete, Rescan) in each registry row', async ({
      page,
    }) => {
      const firstRow = page.locator('.ant-table-tbody .ant-table-row').first();
      await expect(firstRow).toBeVisible();

      // Edit (setting icon)
      await expect(
        firstRow.getByRole('button', { name: 'setting' }),
      ).toBeVisible();
      // Delete
      await expect(
        firstRow.getByRole('button', { name: 'delete' }),
      ).toBeVisible();
      // Rescan (sync icon)
      await expect(
        firstRow.getByRole('button', { name: 'sync' }),
      ).toBeVisible();
    });
  },
);

// ---------------------------------------------------------------------------
// Suite 2: Registry CRUD (serial)
// ---------------------------------------------------------------------------

const TEST_RUN_ID = Date.now().toString(36);
const REGISTRY_NAME = `e2e-test-registry-${TEST_RUN_ID}`;
const REGISTRY_URL = 'https://registry.example.com';
const REGISTRY_URL_MODIFIED = 'https://registry-modified.example.com';
const PROJECT_NAME = 'test-project';
const PROJECT_NAME_MODIFIED = 'test-project-modified';

test.describe(
  'Registry CRUD',
  { tag: ['@regression', '@environment', '@functional', '@registry'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateToRegistriesTab(page);
    });

    test.afterAll(async ({ browser }) => {
      const page = await browser.newPage();
      try {
        await loginAsAdmin(page, page.request);
        await navigateToRegistriesTab(page);
        await applyRegistryFilter(page, REGISTRY_NAME);

        const matchingRow = page
          .locator('.ant-table-tbody .ant-table-row')
          .filter({ hasText: REGISTRY_NAME });

        if ((await matchingRow.count()) === 0) {
          return;
        }

        await matchingRow.getByRole('button', { name: 'delete' }).click();
        const confirmDialog = page
          .getByRole('dialog')
          .filter({ hasText: 'cannot be undone' });
        await confirmDialog.getByRole('textbox').fill(REGISTRY_NAME);
        await confirmDialog.getByRole('button', { name: 'Delete' }).click();
        await expect(
          page.getByText('Registry successfully deleted.'),
        ).toBeVisible({ timeout: 10000 });
      } catch {
        // Ignore cleanup failures
      } finally {
        await page.close();
      }
    });

    // 2.1
    test('Admin can add a new registry with required fields only', async ({
      page,
    }) => {
      // 1. Open Add Registry modal
      await page.getByRole('button', { name: /Add Registry/i }).click();
      const dialog = page.getByRole('dialog', { name: 'Add Registry' });
      await expect(dialog).toBeVisible();

      // 2. Verify Is Global is checked by default
      const isGlobalCheckbox = dialog.getByRole('checkbox', {
        name: /Set as Global Registry/,
      });
      await expect(isGlobalCheckbox).toBeChecked();

      // 3. Fill required fields
      await dialog
        .getByRole('textbox', { name: 'Registry Name' })
        .fill(REGISTRY_NAME);
      await dialog
        .getByRole('textbox', { name: 'Registry URL' })
        .fill(REGISTRY_URL);
      await dialog.getByRole('combobox', { name: 'Registry Type' }).click();
      await page
        .locator('.ant-select-item-option-content')
        .filter({ hasText: /^docker$/ })
        .click();
      await dialog
        .getByRole('textbox', { name: 'Project Name' })
        .fill(PROJECT_NAME);

      // 4. Submit
      await dialog.getByRole('button', { name: 'Add' }).click();

      // 5. Verify success notification
      await expect(page.getByText('Registry successfully added.')).toBeVisible({
        timeout: 10000,
      });

      // 6. Dialog should close
      await expect(dialog).toBeHidden({ timeout: 10000 });
    });

    // 2.2
    test('Admin can see the new registry in the table', async ({ page }) => {
      // Apply filter to find the created registry
      await applyRegistryFilter(page, REGISTRY_NAME);

      const filterTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: `Registry Name: ${REGISTRY_NAME}` });
      await expect(filterTag).toBeVisible();

      // Verify registry row is visible with correct values
      const registryRow = page
        .locator('.ant-table-tbody .ant-table-row')
        .filter({ hasText: REGISTRY_NAME });
      await expect(registryRow).toBeVisible();
      await expect(
        registryRow.getByRole('cell', { name: REGISTRY_NAME }),
      ).toBeVisible();
      await expect(
        registryRow.getByRole('cell', { name: REGISTRY_URL }),
      ).toBeVisible();
      await expect(
        registryRow.getByRole('cell', { name: 'docker' }),
      ).toBeVisible();
      await expect(
        registryRow.locator('.ant-tag', { hasText: PROJECT_NAME }),
      ).toBeVisible();

      // Cleanup filter
      await removeRegistryFilterTag(page, `Registry Name: ${REGISTRY_NAME}`);
    });

    // 2.3
    test('Admin can edit the registry URL and project name', async ({
      page,
    }) => {
      // Locate the registry row
      await applyRegistryFilter(page, REGISTRY_NAME);
      const registryRow = page
        .locator('.ant-table-tbody .ant-table-row')
        .filter({ hasText: REGISTRY_NAME });
      await expect(registryRow).toBeVisible();

      // Open edit modal
      await registryRow.getByRole('button', { name: 'setting' }).click();
      const dialog = page.getByRole('dialog', { name: 'Modify Registry' });
      await expect(dialog).toBeVisible();

      // Verify Registry Name is disabled
      const registryNameInput = dialog.getByRole('textbox', {
        name: 'Registry Name',
      });
      await expect(registryNameInput).toBeDisabled();
      await expect(registryNameInput).toHaveValue(REGISTRY_NAME);

      // Modify URL
      const urlInput = dialog.getByRole('textbox', { name: 'Registry URL' });
      await urlInput.clear();
      await urlInput.fill(REGISTRY_URL_MODIFIED);

      // Modify Project Name (clear the field first via the clear button)
      const projectInput = dialog.getByRole('textbox', {
        name: 'Project Name',
      });
      await projectInput.clear();
      await projectInput.fill(PROJECT_NAME_MODIFIED);

      // Save
      await dialog.getByRole('button', { name: 'Save' }).click();

      // Verify success notification
      await expect(
        page.getByText('Registry successfully modified.'),
      ).toBeVisible({ timeout: 10000 });

      // Dialog should close
      await expect(dialog).toBeHidden({ timeout: 10000 });

      // Cleanup filter
      await removeRegistryFilterTag(page, `Registry Name: ${REGISTRY_NAME}`);
    });

    // 2.4
    test('Admin can see the modified registry values in the table', async ({
      page,
    }) => {
      await applyRegistryFilter(page, REGISTRY_NAME);

      const registryRow = page
        .locator('.ant-table-tbody .ant-table-row')
        .filter({ hasText: REGISTRY_NAME });
      await expect(registryRow).toBeVisible();

      // Verify updated values
      await expect(
        registryRow.getByRole('cell', { name: REGISTRY_URL_MODIFIED }),
      ).toBeVisible();
      await expect(
        registryRow.locator('.ant-tag', { hasText: PROJECT_NAME_MODIFIED }),
      ).toBeVisible();

      await removeRegistryFilterTag(page, `Registry Name: ${REGISTRY_NAME}`);
    });

    // 2.5
    test('Admin can see the Is Global checkbox is checked by default for new registries', async ({
      page,
    }) => {
      await page.getByRole('button', { name: /Add Registry/i }).click();
      const dialog = page.getByRole('dialog', { name: 'Add Registry' });
      await expect(dialog).toBeVisible();

      // Is Global is checked by default
      const isGlobalCheckbox = dialog.getByRole('checkbox', {
        name: /Set as Global Registry/,
      });
      await expect(isGlobalCheckbox).toBeChecked();

      // Allowed Projects field is NOT rendered when Is Global is checked
      await expect(
        dialog.getByRole('combobox', { name: /Allowed Projects/ }),
      ).toHaveCount(0);

      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(dialog).toBeHidden();
    });

    // 2.6
    test('Admin can uncheck Is Global and see the Allowed Projects field appear', async ({
      page,
    }) => {
      await page.getByRole('button', { name: /Add Registry/i }).click();
      const dialog = page.getByRole('dialog', { name: 'Add Registry' });
      await expect(dialog).toBeVisible();

      // Uncheck Is Global
      await dialog
        .getByRole('checkbox', { name: /Set as Global Registry/ })
        .click();
      await expect(
        dialog.getByRole('checkbox', { name: /Set as Global Registry/ }),
      ).not.toBeChecked();

      // Allowed Projects field appears
      await expect(
        dialog.getByRole('combobox', { name: /Allowed Projects/ }),
      ).toBeVisible();

      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(dialog).toBeHidden();
    });

    // 2.7
    test('Admin can delete the registry with correct name confirmation', async ({
      page,
    }) => {
      // Locate the registry
      await applyRegistryFilter(page, REGISTRY_NAME);
      const registryRow = page
        .locator('.ant-table-tbody .ant-table-row')
        .filter({ hasText: REGISTRY_NAME });
      await expect(registryRow).toBeVisible();

      // Open delete confirmation
      await registryRow.getByRole('button', { name: 'delete' }).click();
      const confirmDialog = page
        .getByRole('dialog')
        .filter({ hasText: 'cannot be undone' });
      await expect(confirmDialog).toBeVisible();

      // Delete button disabled initially
      const deleteButton = confirmDialog.getByRole('button', {
        name: 'Delete',
      });
      await expect(deleteButton).toBeDisabled();

      // Type incorrect name first
      const confirmInput = confirmDialog.getByRole('textbox');
      await confirmInput.fill('wrong-name');
      await expect(deleteButton).toBeDisabled();

      // Type correct registry name
      await confirmInput.clear();
      await confirmInput.fill(REGISTRY_NAME);
      await expect(deleteButton).toBeEnabled();

      // Confirm deletion
      await deleteButton.click();
      await expect(
        page.getByText('Registry successfully deleted.'),
      ).toBeVisible({ timeout: 10000 });

      // Verify removed from filter results
      await removeRegistryFilterTag(page, `Registry Name: ${REGISTRY_NAME}`);
      await applyRegistryFilter(page, REGISTRY_NAME);

      // Table should show empty state (no matching rows)
      await expect(page.locator('.ant-table-placeholder')).toBeVisible({
        timeout: 10000,
      });

      await removeRegistryFilterTag(page, `Registry Name: ${REGISTRY_NAME}`);
    });
  },
);

// ---------------------------------------------------------------------------
// Suite 3: Registry Controls
// ---------------------------------------------------------------------------

test.describe(
  'Registry Controls',
  { tag: ['@regression', '@environment', '@functional', '@registry'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateToRegistriesTab(page);
    });

    // 3.1
    test('Admin can toggle registry enabled/disabled state', async ({
      page,
    }) => {
      const firstRow = page.locator('.ant-table-tbody .ant-table-row').first();
      await expect(firstRow).toBeVisible();

      const toggle = firstRow.getByRole('switch');
      const isCurrentlyEnabled = await toggle.isChecked();

      try {
        // Toggle to opposite state
        await toggle.click();
        const expectedMessage = isCurrentlyEnabled
          ? 'Registry disabled'
          : 'Registry enabled';
        await expect(page.getByText(expectedMessage)).toBeVisible({
          timeout: 10000,
        });
      } finally {
        // Always attempt to restore original state even if the test fails above
        const isEnabledAfter = await toggle.isChecked();
        if (isEnabledAfter !== isCurrentlyEnabled) {
          await toggle.click();
          const restoreMessage = isCurrentlyEnabled
            ? 'Registry enabled'
            : 'Registry disabled';
          await expect(page.getByText(restoreMessage)).toBeVisible({
            timeout: 10000,
          });
        }
      }
    });

    // 3.2
    test('Admin cannot delete a registry without entering the correct name', async ({
      page,
    }) => {
      const firstRow = page.locator('.ant-table-tbody .ant-table-row').first();
      await expect(firstRow).toBeVisible();

      // Open delete dialog
      await firstRow.getByRole('button', { name: 'delete' }).click();
      const confirmDialog = page
        .getByRole('dialog')
        .filter({ hasText: 'cannot be undone' });
      await expect(confirmDialog).toBeVisible();

      const deleteButton = confirmDialog.getByRole('button', {
        name: 'Delete',
      });

      // Delete button is disabled with empty input
      await expect(deleteButton).toBeDisabled();

      // Type incorrect name
      const confirmInput = confirmDialog.getByRole('textbox');
      await confirmInput.fill('wrong-name');
      await expect(deleteButton).toBeDisabled();

      // Clear input
      await confirmInput.clear();
      await expect(deleteButton).toBeDisabled();

      // Cancel without deleting
      await confirmDialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(confirmDialog).toBeHidden();

      // Registry still visible in table
      await expect(firstRow).toBeVisible();
    });

    // 3.3
    test('Admin can cancel the delete confirmation dialog without deleting', async ({
      page,
    }) => {
      const firstRow = page.locator('.ant-table-tbody .ant-table-row').first();
      await expect(firstRow).toBeVisible();

      // Note the registry name
      const registryNameCell = firstRow.locator('.ant-table-cell').first();
      const registryName = await registryNameCell.textContent();
      expect(registryName).toBeTruthy();

      // Open delete dialog
      await firstRow.getByRole('button', { name: 'delete' }).click();
      const confirmDialog = page
        .getByRole('dialog')
        .filter({ hasText: 'cannot be undone' });
      await expect(confirmDialog).toBeVisible();

      // Cancel
      await confirmDialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(confirmDialog).toBeHidden();

      // Registry row is still present (use first() since multiple rows may share the same registry name)
      const rowAfterCancel = page
        .locator('.ant-table-tbody .ant-table-row')
        .filter({ hasText: registryName! })
        .first();
      await expect(rowAfterCancel).toBeVisible();
    });

    // 3.4
    test('Admin can open the Modify Registry dialog for an existing registry', async ({
      page,
    }) => {
      const firstRow = page.locator('.ant-table-tbody .ant-table-row').first();
      await expect(firstRow).toBeVisible();

      // Open edit modal
      await firstRow.getByRole('button', { name: 'setting' }).click();
      const dialog = page.getByRole('dialog', { name: 'Modify Registry' });
      await expect(dialog).toBeVisible();

      // Registry Name is disabled
      await expect(
        dialog.getByRole('textbox', { name: 'Registry Name' }),
      ).toBeDisabled();

      // Registry URL is pre-filled
      const urlInput = dialog.getByRole('textbox', { name: 'Registry URL' });
      const urlValue = await urlInput.inputValue();
      expect(urlValue).toBeTruthy();

      // Change Password checkbox is visible (edit mode only)
      await expect(
        dialog.getByRole('checkbox', { name: 'Change Password' }),
      ).toBeVisible();

      // Password field is disabled (until Change Password is checked)
      await expect(dialog.locator('input[type="password"]')).toBeDisabled();

      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(dialog).toBeHidden();
    });

    // 3.5
    test('Admin can enable the password field by checking Change Password', async ({
      page,
    }) => {
      const firstRow = page.locator('.ant-table-tbody .ant-table-row').first();
      await firstRow.getByRole('button', { name: 'setting' }).click();

      const dialog = page.getByRole('dialog', { name: 'Modify Registry' });
      await expect(dialog).toBeVisible();

      // Password is disabled initially
      await expect(dialog.locator('input[type="password"]')).toBeDisabled();

      // Check Change Password
      await dialog.getByRole('checkbox', { name: 'Change Password' }).click();

      // Password is now enabled
      await expect(dialog.locator('input[type="password"]')).toBeEnabled();

      // Cancel without saving
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(dialog).toBeHidden();
    });
  },
);

// ---------------------------------------------------------------------------
// Suite 4: Registry Filtering
// ---------------------------------------------------------------------------

test.describe(
  'Registry Filtering',
  {
    tag: ['@regression', '@environment', '@functional', '@registry', '@filter'],
  },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateToRegistriesTab(page);
      await expect(
        page.getByRole('combobox', { name: 'Filter property selector' }),
      ).toBeVisible();
    });

    // 4.1
    test('Admin can filter registries by name using a partial text value', async ({
      page,
    }) => {
      // Apply filter with partial name "cr" (matches cr.backend.ai)
      await applyRegistryFilter(page, 'cr');

      // Filter tag appears
      const filterTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: 'Registry Name: cr' });
      await expect(filterTag).toBeVisible();

      // Table is still visible with filtered results
      await expect(page.getByRole('table')).toBeVisible();

      // Cleanup
      await removeRegistryFilterTag(page, 'Registry Name: cr');
      await expect(filterTag).toBeHidden();
    });

    // 4.2
    test('Admin sees empty state when filtering by a non-existent registry name', async ({
      page,
    }) => {
      const nonExistentName = 'zzz-nonexistent-registry-999';
      await applyRegistryFilter(page, nonExistentName);

      // Filter tag appears
      const filterTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: `Registry Name: ${nonExistentName}` });
      await expect(filterTag).toBeVisible();

      // Table shows empty state
      await expect(page.locator('.ant-table-placeholder')).toBeVisible();

      // Cleanup
      await removeRegistryFilterTag(page, `Registry Name: ${nonExistentName}`);
      await expect(filterTag).toBeHidden();

      // Registry rows reappear
      await expect(
        page.locator('.ant-table-tbody .ant-table-row').first(),
      ).toBeVisible();
    });

    // 4.3
    test('Admin can clear the filter tag and restore the full registry list', async ({
      page,
    }) => {
      // Get unfiltered row count
      const unfilteredRows = page.locator('.ant-table-tbody .ant-table-row');
      const unfilteredCount = await unfilteredRows.count();

      // Apply filter
      await applyRegistryFilter(page, 'cr');
      const filterTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: 'Registry Name: cr' });
      await expect(filterTag).toBeVisible();

      // Remove the filter tag
      await removeRegistryFilterTag(page, 'Registry Name: cr');
      await expect(filterTag).toBeHidden();

      // Table shows full list again
      const restoredRows = page.locator('.ant-table-tbody .ant-table-row');
      const restoredCount = await restoredRows.count();
      expect(restoredCount).toBeGreaterThanOrEqual(unfilteredCount);
    });

    // 4.4
    test('Admin can see the filter property selector shows Registry Name', async ({
      page,
    }) => {
      // When there is only one filter property, it is auto-selected and displayed
      // as the current value in the property selector
      await expect(
        page.locator('.ant-select-content-value', { hasText: 'Registry Name' }),
      ).toBeVisible();
    });
  },
);
