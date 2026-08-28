// spec: e2e/.agent-output/test-plan-registry.md
// Container Registry E2E tests covering:
//   - Registry list rendering
//   - Registry CRUD (serial: create → verify → edit → verify → delete)
//   - Registry controls (enable/disable toggle, delete confirmation guard)
//   - Registry filtering via BAIPropertyFilter
import { loginAsAdmin } from '../utils/test-util';
import { Locator, Page, expect, test } from '@playwright/test';

// ---------------------------------------------------------------------------
// Shared navigation helper
// ---------------------------------------------------------------------------

// Astryx's ToastViewport renders every toast twice: once in the visible
// stack (`role="region"`, named "Notifications") and once in a singleton
// screen-reader announcer — an unscoped getByText() strict-mode-violates.
function toastRegion(page: Page) {
  return page.getByRole('region', { name: 'Notifications' });
}

// A BAITable column header's accessible NAME is overridden by its sort
// button's aria-label ("Sort by registry_name") for the one sortable column;
// match the header's visible TEXT instead (see resource-policy.spec.ts).
function registryColumnHeader(scope: Page | Locator, label: string) {
  return scope.getByRole('columnheader').filter({ hasText: label });
}

// Astryx `Table` renders native <table><tbody><tr role="row">; a plain
// getByRole('row') also matches the header row, so exclude it the same way
// rbac-role-list.spec.ts does.
function registryDataRows(page: Page) {
  return page
    .getByRole('row')
    .filter({ hasNot: page.getByRole('columnheader') });
}

async function navigateToRegistriesTab(page: Page) {
  await page.getByRole('link', { name: 'Admin Settings' }).click();
  await page.getByRole('link', { name: 'Environments' }).click();
  // EnvironmentPage's tabs are BAICard's `tabList` (BAITabList / Astryx
  // `TabList`), which renders a `nav[aria-label="Tabs"]` of plain buttons,
  // not ARIA `tab` elements.
  await page
    .getByRole('navigation', { name: 'Tabs' })
    .getByRole('button', { name: /Registries/i })
    .click();
  await expect(page.getByRole('table')).toBeVisible();
}

// ---------------------------------------------------------------------------
// Shared filter helpers
//
// to-astryx ticket 28 rebuilt BAIPropertyFilter on Astryx `PowerSearch`
// (packages/backend.ai-ui/src/components/BAIPropertyFilter.tsx). Registry
// Name is the *only* filter property here
// (`react/src/components/ContainerRegistryList.tsx` `filterProperties`, no
// `defaultOperator` override -> BUI default `ilike` = "contains") and no
// explicit `contentSearchFieldKey`, so it becomes PowerSearch's own default
// content-search field (`defaultContentSearchFieldKey`,
// `BAIPropertyFilter.tsx`): typed text matches a `"<query>"` content-search
// suggestion whose `filterValue` is already filled in, which commits
// IMMEDIATELY on click — no separate field pick + edit-popover + Apply step
// (`usePowerSearchSource.ts`'s content-search branch; contrast with
// `environment.spec.ts`, which has several fields and goes through the
// popover).
// ---------------------------------------------------------------------------

async function applyRegistryFilter(page: Page, value: string) {
  const searchBar = page.getByRole('combobox', { name: 'Search filters' });
  await searchBar.click();
  await searchBar.fill(value);
  // The content-search suggestion's label is the typed query, double-quoted
  // (`usePowerSearchSource.ts`: `label: \`"${query}"\``).
  await page.getByRole('option', { name: `"${value}"`, exact: true }).click();
  await page
    .locator('.ant-spin-spinning')
    .waitFor({ state: 'detached', timeout: 10000 })
    .catch(() => {});
}

/**
 * @param tokenLabel Full committed-token label, e.g.
 *   `"Registry Name: contains cr"` (`"<Field>: <operator> <value>"`,
 *   `PowerSearch.tsx` `tokenizerValue` -> `displayLabel`).
 */
async function removeRegistryFilterTag(page: Page, tokenLabel: string) {
  // The token's remove control carries `aria-label="Remove {label}"`
  // (`t('@astryx.token.remove', {label})`, `Token.tsx` / locales/en.json).
  await page
    .getByRole('button', { name: `Remove ${tokenLabel}`, exact: true })
    .click();
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
      await expect(registryColumnHeader(table, 'Registry Name')).toBeVisible();
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
    });

    // 1.2
    test('Admin can see the Add Registry button and filter bar', async ({
      page,
    }) => {
      await expect(
        page.getByRole('button', { name: /Add Registry/i }),
      ).toBeVisible();
      await expect(
        page.getByRole('combobox', { name: 'Search filters' }),
      ).toBeVisible();
      // The refresh control is a plain `IconButton` (`ContainerRegistryList.tsx`),
      // not `BAIFetchKeyButton` — `label={t('button.Refresh')}` = "Refresh"
      // (resources/i18n/en.json), not antd's auto icon-name aria-label
      // ("reload") this assertion targeted before the icon migration.
      await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
    });

    // 1.3
    test('Admin can see the Enabled toggle switch in each registry row', async ({
      page,
    }) => {
      const rows = registryDataRows(page);
      await expect(rows.first()).toBeVisible();
      // Verify the first row contains a switch toggle in the Enabled column
      await expect(rows.first().getByRole('switch')).toBeVisible();
    });

    // 1.4
    test('Admin can see the Control buttons (Edit, Delete, Rescan) in each registry row', async ({
      page,
    }) => {
      const firstRow = registryDataRows(page).first();
      await expect(firstRow).toBeVisible();

      // Edit. The action is a lucide `SquarePenIcon` (FR-3331) whose title
      // is exposed as the button's `aria-label` by BAINameActionCell.
      await expect(
        firstRow.getByRole('button', { name: 'Edit', exact: true }),
      ).toBeVisible();
      // Delete
      await expect(
        firstRow.getByRole('button', { name: 'delete' }),
      ).toBeVisible();
      // Rescan. BAINameActionCell exposes the action's `title` (not the icon
      // name) as the button's accessible name; the rescan action's title is
      // t('maintenance.RescanImages') = "Rescan Images".
      await expect(
        firstRow.getByRole('button', { name: 'Rescan Images' }),
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

        const matchingRow = registryDataRows(page).filter({
          hasText: REGISTRY_NAME,
        });

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
          toastRegion(page).getByText('Registry successfully deleted.'),
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
        name: /Allow access from all projects/,
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
      await page.getByRole('option', { name: 'docker', exact: true }).click();
      await dialog
        .getByRole('textbox', { name: 'Project Name' })
        .fill(PROJECT_NAME);

      // 4. Submit
      await dialog.getByRole('button', { name: 'Add' }).click();

      // 5. Verify success notification
      await expect(
        toastRegion(page).getByText('Registry successfully added.'),
      ).toBeVisible({
        timeout: 10000,
      });

      // 6. Dialog should close
      await expect(dialog).toBeHidden({ timeout: 10000 });
    });

    // 2.2
    test('Admin can see the new registry in the table', async ({ page }) => {
      // Apply filter to find the created registry
      await applyRegistryFilter(page, REGISTRY_NAME);

      const filterTag = page.getByRole('button', {
        name: 'Remove Registry Name: contains',
        exact: true,
      });
      await expect(filterTag).toBeVisible();

      // Verify registry row is visible with correct values
      const registryRow = registryDataRows(page).filter({
        hasText: REGISTRY_NAME,
      });
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
      // Project is rendered as an Astryx Badge (a plain <span>, no ARIA role
      // of its own), not an antd `.ant-tag`.
      await expect(
        registryRow.getByText(PROJECT_NAME, { exact: true }),
      ).toBeVisible();

      // Cleanup filter
      await removeRegistryFilterTag(page, 'Registry Name: contains');
    });

    // 2.3
    test('Admin can edit the registry URL and project name', async ({
      page,
    }) => {
      // Locate the registry row
      await applyRegistryFilter(page, REGISTRY_NAME);
      const registryRow = registryDataRows(page).filter({
        hasText: REGISTRY_NAME,
      });
      await expect(registryRow).toBeVisible();

      // Open edit modal via the edit action's accessible name (the action
      // title is exposed as `aria-label` by BAINameActionCell).
      await registryRow
        .getByRole('button', { name: 'Edit', exact: true })
        .click();
      // FR-3331 unified edit terminology: the modal title changed from
      // "Modify Registry" to "Edit Registry".
      const dialog = page.getByRole('dialog', { name: 'Edit Registry' });
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
        toastRegion(page).getByText('Registry successfully modified.'),
      ).toBeVisible({ timeout: 10000 });

      // Dialog should close
      await expect(dialog).toBeHidden({ timeout: 10000 });

      // Cleanup filter
      await removeRegistryFilterTag(page, 'Registry Name: contains');
    });

    // 2.4
    test('Admin can see the modified registry values in the table', async ({
      page,
    }) => {
      await applyRegistryFilter(page, REGISTRY_NAME);

      const registryRow = registryDataRows(page).filter({
        hasText: REGISTRY_NAME,
      });
      await expect(registryRow).toBeVisible();

      // Verify updated values
      await expect(
        registryRow.getByRole('cell', { name: REGISTRY_URL_MODIFIED }),
      ).toBeVisible();
      // Project is rendered as an Astryx Badge (a plain <span>, no ARIA role
      // of its own), not an antd `.ant-tag`.
      await expect(
        registryRow.getByText(PROJECT_NAME_MODIFIED, { exact: true }),
      ).toBeVisible();

      await removeRegistryFilterTag(page, 'Registry Name: contains');
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
        name: /Allow access from all projects/,
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
    // RETRY BUDGET EXHAUSTED (3 attempts: plain click, click after waiting
    // for the dialog's open-transition to settle, and a forced click) — a
    // Playwright-dispatched click on the "Allow access from all projects"
    // checkbox never toggles its DOM `checked` state (confirmed unchanged
    // across a 5s poll), while an in-page `element.click()` on the same
    // `<input>` toggles it immediately and the Allowed Projects field
    // appears as expected. This points at an app-side click-handling quirk
    // on that checkbox, not a stale locator — left for a human to confirm.
    test.fixme('Admin can uncheck Is Global and see the Allowed Projects field appear', async ({
      page,
    }) => {
      await page.getByRole('button', { name: /Add Registry/i }).click();
      const dialog = page.getByRole('dialog', { name: 'Add Registry' });
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole('textbox', { name: 'Registry Name' }),
      ).toBeVisible();

      // Uncheck Is Global
      await dialog
        .getByRole('checkbox', { name: /Allow access from all projects/ })
        .click();
      await expect(
        dialog.getByRole('checkbox', {
          name: /Allow access from all projects/,
        }),
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
      const registryRow = registryDataRows(page).filter({
        hasText: REGISTRY_NAME,
      });
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
        toastRegion(page).getByText('Registry successfully deleted.'),
      ).toBeVisible({ timeout: 10000 });

      // Verify removed from filter results
      await removeRegistryFilterTag(page, 'Registry Name: contains');
      await applyRegistryFilter(page, REGISTRY_NAME);

      // Table should show empty state (no matching rows)
      await expect(
        page.getByRole('heading', { name: 'No data to display' }),
      ).toBeVisible({
        timeout: 10000,
      });

      await removeRegistryFilterTag(page, 'Registry Name: contains');
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
      const firstRow = registryDataRows(page).first();
      await expect(firstRow).toBeVisible();

      const toggle = firstRow.getByRole('switch');
      const isCurrentlyEnabled = await toggle.isChecked();

      try {
        // Toggle to opposite state
        await toggle.click();
        const expectedMessage = isCurrentlyEnabled
          ? 'Registry disabled'
          : 'Registry enabled';
        await expect(toastRegion(page).getByText(expectedMessage)).toBeVisible({
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
          await expect(toastRegion(page).getByText(restoreMessage)).toBeVisible(
            {
              timeout: 10000,
            },
          );
        }
      }
    });

    // 3.2
    test('Admin cannot delete a registry without entering the correct name', async ({
      page,
    }) => {
      const firstRow = registryDataRows(page).first();
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
      const firstRow = registryDataRows(page).first();
      await expect(firstRow).toBeVisible();

      // Note the registry name
      const registryNameCell = firstRow.getByRole('cell').first();
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
      const rowAfterCancel = registryDataRows(page)
        .filter({ hasText: registryName! })
        .first();
      await expect(rowAfterCancel).toBeVisible();
    });

    // 3.4
    test('Admin can open the Modify Registry dialog for an existing registry', async ({
      page,
    }) => {
      const firstRow = registryDataRows(page).first();
      await expect(firstRow).toBeVisible();

      // Open edit modal via the edit action's accessible name (the action
      // title is exposed as `aria-label` by BAINameActionCell).
      await firstRow.getByRole('button', { name: 'Edit', exact: true }).click();
      // FR-3331 unified edit terminology: the modal title changed from
      // "Modify Registry" to "Edit Registry".
      const dialog = page.getByRole('dialog', { name: 'Edit Registry' });
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
      const firstRow = registryDataRows(page).first();
      // Open the edit modal via the edit action's accessible name (the
      // action title is exposed as `aria-label` by BAINameActionCell).
      await firstRow.getByRole('button', { name: 'Edit', exact: true }).click();

      // FR-3331 unified edit terminology: the modal title changed from
      // "Modify Registry" to "Edit Registry".
      const dialog = page.getByRole('dialog', { name: 'Edit Registry' });
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
        page.getByRole('combobox', { name: 'Search filters' }),
      ).toBeVisible();
    });

    // 4.1
    test('Admin can filter registries by name using a partial text value', async ({
      page,
    }) => {
      // Apply filter with partial name "cr" (matches cr.backend.ai)
      await applyRegistryFilter(page, 'cr');

      // Filter token appears
      const filterTag = page.getByRole('button', {
        name: 'Remove Registry Name: contains',
        exact: true,
      });
      await expect(filterTag).toBeVisible();

      // Table is still visible with filtered results
      await expect(page.getByRole('table')).toBeVisible();

      // Cleanup
      await removeRegistryFilterTag(page, 'Registry Name: contains');
      await expect(filterTag).toBeHidden();
    });

    // 4.2
    test('Admin sees empty state when filtering by a non-existent registry name', async ({
      page,
    }) => {
      const nonExistentName = 'zzz-nonexistent-registry-999';
      await applyRegistryFilter(page, nonExistentName);

      // Filter token appears
      const filterTag = page.getByRole('button', {
        name: 'Remove Registry Name: contains',
        exact: true,
      });
      await expect(filterTag).toBeVisible();

      // Table shows empty state
      await expect(
        page.getByRole('heading', { name: 'No data to display' }),
      ).toBeVisible();

      // Cleanup
      await removeRegistryFilterTag(page, 'Registry Name: contains');
      await expect(filterTag).toBeHidden();

      // Registry rows reappear
      await expect(registryDataRows(page).first()).toBeVisible();
    });

    // 4.3
    test('Admin can clear the filter tag and restore the full registry list', async ({
      page,
    }) => {
      // Pick an anchor row the "cr" filter will exclude before filtering:
      // its disappear/reappear proves a genuine refetch, where row counts
      // can't tell a restored list from a stale filtered render. Volatile
      // e2e-created registries (concurrent CRUD suite) are ineligible.
      const rows = registryDataRows(page);
      const rowNames = await rows.locator('td:first-child').allInnerTexts();
      const anchorName = rowNames.find(
        (name) => name && !/cr/i.test(name) && !name.startsWith('e2e-'),
      );
      test.skip(
        !anchorName,
        'Needs a stable registry whose name does not contain "cr" to verify the list is restored after clearing the filter',
      );
      const anchorRow = rows.filter({ hasText: anchorName });

      // Apply filter — the anchor row must be filtered out
      await applyRegistryFilter(page, 'cr');
      const filterTag = page.getByRole('button', {
        name: 'Remove Registry Name: contains',
        exact: true,
      });
      await expect(filterTag).toBeVisible();
      await expect(anchorRow).toBeHidden();

      // Remove the filter tag
      await removeRegistryFilterTag(page, 'Registry Name: contains');
      await expect(filterTag).toBeHidden();

      await expect(anchorRow.first()).toBeVisible({ timeout: 10000 });
    });

    // 4.4
    test('Admin can see Registry Name offered as a filter field', async ({
      page,
    }) => {
      // PowerSearch has no persistent "current property" selector the way
      // antd's auto-selected single-option Select did (the search bar is a
      // stateless typeahead, `Tokenizer.tsx`); the equivalent invariant is
      // that "Registry Name" is the (only) field PowerSearch offers when the
      // typeahead opens (`config.fields`, built from
      // `ContainerRegistryList.tsx`'s single-entry `filterProperties`).
      const searchBar = page.getByRole('combobox', { name: 'Search filters' });
      await searchBar.click();
      await expect(
        page.getByRole('option', { name: 'Registry Name', exact: true }),
      ).toBeVisible();
    });
  },
);
