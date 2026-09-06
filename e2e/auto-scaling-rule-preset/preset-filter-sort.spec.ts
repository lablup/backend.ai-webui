// spec: e2e/.agent-output/test-plan-auto-scaling-rule-preset.md
// sections: 5. Filter by Name, 6. Sorting
import { loginAsAdmin, webuiEndpoint } from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// Astryx's ToastViewport renders every toast twice: once in the visible
// stack (`role="region"`, named "Notifications") and once in a singleton
// screen-reader announcer — an unscoped getByText() strict-mode-violates.
function toastRegion(page: Page) {
  return page.getByRole('region', { name: 'Notifications' });
}

// Astryx `Table` renders native <table><tbody><tr role="row">; a plain
// getByRole('row') also matches the header row, so exclude it.
function presetDataRows(page: Page) {
  return page
    .getByRole('row')
    .filter({ hasNot: page.getByRole('columnheader') });
}

// A BAITable column header's accessible NAME is overridden by its sort
// button's aria-label ("Sort by createdAt") for sortable columns; match the
// header's visible TEXT instead (see resource-policy.spec.ts /
// registry.spec.ts for the identical pattern). Anchored exactly, since
// "Name" would otherwise also substring-match the "Metric Name" header.
function presetColumnHeader(page: Page, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return page
    .getByRole('columnheader')
    .filter({ hasText: new RegExp(`^${escaped}$`) });
}

async function createPreset(
  page: Page,
  name: string,
  metricName = 'e2e_metric',
  queryTemplate = 'up',
): Promise<void> {
  await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
  await page.waitForLoadState('domcontentloaded');
  await expect(
    page.getByRole('button', { name: /Create Preset/i }),
  ).toBeVisible({
    timeout: 60000,
  });
  await page.getByRole('button', { name: /Create Preset/i }).click();
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  const nameInput = modal.getByRole('textbox', { name: 'Name', exact: true });
  await expect(nameInput).toBeVisible({ timeout: 30000 });
  await nameInput.fill(name);
  await modal.getByRole('textbox', { name: 'Metric Name' }).fill(metricName);
  await modal
    .getByRole('textbox', { name: 'Query Template' })
    .fill(queryTemplate);
  await modal.getByRole('button', { name: 'Create' }).click({ force: true });
  await expect(
    toastRegion(page).getByText(
      'Prometheus query preset has been successfully created.',
    ),
  ).toBeVisible({ timeout: 120000 });
  await expect(modal).toBeHidden({ timeout: 30000 });
}

async function deletePreset(page: Page, presetName: string): Promise<void> {
  await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
  await page.waitForLoadState('domcontentloaded');
  await expect(
    page.getByRole('button', { name: /Create Preset/i }),
  ).toBeVisible({
    timeout: 60000,
  });
  const row = page.getByRole('row').filter({ hasText: presetName });
  if ((await row.count()) === 0) return;
  await row.getByRole('button', { name: 'Delete', exact: true }).click();
  const confirmModal = page.getByRole('dialog');
  await expect(confirmModal).toBeVisible({ timeout: 30000 });
  await expect(confirmModal).not.toHaveClass(/ant-zoom-appear/, {
    timeout: 10000,
  });
  await confirmModal.locator('input').fill(presetName);
  await confirmModal
    .getByRole('button', { name: 'Delete', exact: true })
    .click();
  await expect(confirmModal).toBeHidden({ timeout: 30000 });
}

/**
 * Apply a "Name" filter using BAIPropertyFilter (Astryx PowerSearch): open
 * the typeahead, pick the "Name" field, fill the Value in the edit popover
 * it opens, then Apply (free-text field, same interaction model as
 * environment.spec.ts / registry.spec.ts / rbac-role-list.spec.ts).
 */
async function applyNameFilter(page: Page, searchValue: string): Promise<void> {
  const searchBar = page.getByRole('combobox', { name: 'Search filters' });
  await searchBar.click();
  await page.getByRole('option', { name: 'Name', exact: true }).click();
  await page.getByRole('textbox', { name: 'Value' }).fill(searchValue);
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  // Wait for the committed filter token to appear, confirming the condition
  // was added to local state. Token remove buttons carry `aria-label="Remove
  // {field}: {operator}"` (`@astryxdesign/core`'s `Token` component); the
  // label excludes the value, so match on the fixed "Name: contains" prefix.
  await expect(
    page.getByRole('button', { name: 'Remove Name: contains', exact: true }),
  ).toBeVisible({
    timeout: 5000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Filter by Name
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Auto Scaling Rule Preset - Filter',
  { tag: ['@auto-scaling-rule-preset', '@admin', '@functional'] },
  () => {
    let presetName: string;

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test.afterEach(async ({ page }) => {
      if (presetName) {
        try {
          await deletePreset(page, presetName);
        } catch {
          // ignore cleanup errors
        }
        presetName = '';
      }
    });

    // 5.1 Superadmin can filter presets by name using the property filter bar
    test('Superadmin can filter presets by name using the property filter bar', async ({
      page,
    }) => {
      const timestamp = Date.now();
      presetName = `e2e-preset-filter-target-${timestamp}`;
      const filterKey = `${timestamp}`;

      // Create a test preset
      await createPreset(page, presetName);

      // Navigate to the tab
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      await page.waitForLoadState('domcontentloaded');
      await expect(
        page.getByRole('button', { name: /Create Preset/i }),
      ).toBeVisible({ timeout: 60000 });

      // Apply name filter using the unique timestamp part
      await applyNameFilter(page, filterKey);

      // Verify the filter token shows the condition value. Scoped to the
      // "Search filters" group — the created preset's row (checked next)
      // also contains this substring via its name.
      await expect(
        page
          .getByRole('group', { name: 'Search filters' })
          .getByText(filterKey),
      ).toBeVisible({
        timeout: 5000,
      });

      // Verify the created test preset row is visible after filtering
      await expect(
        page.getByRole('row').filter({ hasText: presetName }),
      ).toBeVisible({
        timeout: 15000,
      });
    });

    // 5.2 Superadmin sees an empty table when no presets match the filter
    test('Superadmin sees an empty table when no presets match the filter', async ({
      page,
    }) => {
      // Navigate to the tab
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      await page.waitForLoadState('domcontentloaded');
      await expect(
        page.getByRole('button', { name: /Create Preset/i }),
      ).toBeVisible({ timeout: 60000 });

      // Apply a filter guaranteed not to match any preset
      const nonExistentValue = `zzz-e2e-nonexistent-xyz-${Date.now()}`;
      await applyNameFilter(page, nonExistentValue);

      // Verify filter token shows the condition
      await expect(
        page
          .getByRole('group', { name: 'Search filters' })
          .getByText(/zzz-e2e-nonexistent-xyz-/),
      ).toBeVisible({ timeout: 5000 });

      // Verify empty state
      await expect(
        page.getByRole('heading', { name: 'No data to display' }),
      ).toBeVisible({
        timeout: 15000,
      });
    });

    // 5.3 Superadmin can clear an active filter to restore the full list
    test('Superadmin can clear an active filter to restore the full list', async ({
      page,
    }) => {
      // Navigate to the tab
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      await page.waitForLoadState('domcontentloaded');
      await expect(
        page.getByRole('button', { name: /Create Preset/i }),
      ).toBeVisible({ timeout: 60000 });

      // Apply a non-matching filter so the table shows 0 results
      const filterValue = `e2e-nonexistent-clear-test-${Date.now()}`;
      await applyNameFilter(page, filterValue);

      // Verify the filter token appeared
      const filterTag = page
        .getByRole('group', { name: 'Search filters' })
        .getByText(/e2e-nonexistent-clear-test-/);
      await expect(filterTag).toBeVisible({ timeout: 5000 });

      // Verify the table shows empty state with the non-matching filter applied
      const emptyState = page.getByRole('heading', {
        name: 'No data to display',
      });
      await expect(emptyState).toBeVisible({
        timeout: 30000,
      });

      // Click the remove button on the filter token to remove the filter
      const removeFilterButton = page.getByRole('button', {
        name: 'Remove Name: contains',
        exact: true,
      });
      await removeFilterButton.click();

      // Verify filter token is gone
      await expect(filterTag).toBeHidden({ timeout: 10000 });

      // Verify the full list is restored: empty state is gone and at least one
      // data row is visible. Avoid comparing to a stored exact count because
      // parallel tests may create/delete presets concurrently, making an exact
      // count assertion flaky.
      await expect(emptyState).toBeHidden({
        timeout: 15000,
      });
      await expect(presetDataRows(page).first()).toBeVisible({
        timeout: 15000,
      });
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. Sorting
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Auto Scaling Rule Preset - Sorting',
  { tag: ['@auto-scaling-rule-preset', '@admin', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    // 6.1 Superadmin can sort presets by Name in ascending order
    test('Superadmin can sort presets by Name in ascending order', async ({
      page,
    }) => {
      // Navigate to the tab
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.getByRole('table')).toBeVisible({ timeout: 60000 });

      // Click the Name column header to sort ascending
      const nameHeader = presetColumnHeader(page, 'Name');
      await nameHeader.click();

      // Verify sort indicator: aria-sort="ascending" on the Name column header
      await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending', {
        timeout: 10000,
      });

      // Verify the table is still rendered with data
      await expect(page.getByRole('table')).toBeVisible();
    });

    // 6.2 Superadmin can sort presets by Name in descending order
    test('Superadmin can sort presets by Name in descending order', async ({
      page,
    }) => {
      // Navigate to the tab
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.getByRole('table')).toBeVisible({ timeout: 60000 });

      // Click Name header once (ascending), then again (descending)
      const nameHeader = presetColumnHeader(page, 'Name');
      await nameHeader.click();
      await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending', {
        timeout: 10000,
      });
      await nameHeader.click();

      // Verify sort indicator: aria-sort="descending" on the Name column header
      await expect(nameHeader).toHaveAttribute('aria-sort', 'descending', {
        timeout: 10000,
      });

      // Verify the table is still rendered
      await expect(page.getByRole('table')).toBeVisible();
    });

    // 6.3 Superadmin can sort presets by Created At after making the column visible
    test('Superadmin can sort presets by Created At after enabling the hidden column', async ({
      page,
    }) => {
      // Navigate to the tab
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.getByRole('table')).toBeVisible({ timeout: 60000 });

      // Open table column settings
      await page.getByRole('button', { name: 'Table Settings' }).click();
      const settingsModal = page.getByRole('dialog');
      await expect(settingsModal).toBeVisible();
      await expect(settingsModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });

      // Enable "Created At" column
      await settingsModal.getByRole('checkbox', { name: 'Created At' }).check();

      // Click OK to apply
      await settingsModal.getByRole('button', { name: 'Apply' }).click();
      await expect(settingsModal).toBeHidden({ timeout: 30000 });

      // Verify "Created At" column header is now visible
      const createdAtHeader = presetColumnHeader(page, 'Created At');
      await expect(createdAtHeader).toBeVisible({ timeout: 10000 });

      // Click "Created At" header to sort ascending
      await createdAtHeader.click();
      await expect(createdAtHeader).toHaveAttribute('aria-sort', 'ascending', {
        timeout: 10000,
      });

      // Click again to sort descending
      await createdAtHeader.click();
      await expect(createdAtHeader).toHaveAttribute('aria-sort', 'descending', {
        timeout: 10000,
      });

      // Restore column visibility: disable Created At
      await page.getByRole('button', { name: 'Table Settings' }).click();
      await expect(settingsModal).toBeVisible();
      await expect(settingsModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });
      await settingsModal
        .getByRole('checkbox', { name: 'Created At' })
        .uncheck();
      await settingsModal.getByRole('button', { name: 'Apply' }).click();
      await expect(settingsModal).toBeHidden({ timeout: 30000 });
    });

    // 6.4 Superadmin can sort presets by Updated At after making the column visible
    test('Superadmin can sort presets by Updated At after enabling the hidden column', async ({
      page,
    }) => {
      // Navigate to the tab
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.getByRole('table')).toBeVisible({ timeout: 60000 });

      // Open table column settings
      await page.getByRole('button', { name: 'Table Settings' }).click();
      const settingsModal = page.getByRole('dialog');
      await expect(settingsModal).toBeVisible();
      await expect(settingsModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });

      // Enable "Updated At" column
      await settingsModal.getByRole('checkbox', { name: 'Updated At' }).check();

      // Click OK to apply
      await settingsModal.getByRole('button', { name: 'Apply' }).click();
      await expect(settingsModal).toBeHidden({ timeout: 30000 });

      // Verify "Updated At" column header is now visible
      const updatedAtHeader = presetColumnHeader(page, 'Updated At');
      await expect(updatedAtHeader).toBeVisible({ timeout: 10000 });

      // Click "Updated At" header to sort ascending
      await updatedAtHeader.click();
      await expect(updatedAtHeader).toHaveAttribute('aria-sort', 'ascending', {
        timeout: 10000,
      });

      // Click again to sort descending
      await updatedAtHeader.click();
      await expect(updatedAtHeader).toHaveAttribute('aria-sort', 'descending', {
        timeout: 10000,
      });

      // Restore column visibility: disable Updated At
      await page.getByRole('button', { name: 'Table Settings' }).click();
      await expect(settingsModal).toBeVisible();
      await expect(settingsModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });
      await settingsModal
        .getByRole('checkbox', { name: 'Updated At' })
        .uncheck();
      await settingsModal.getByRole('button', { name: 'Apply' }).click();
      await expect(settingsModal).toBeHidden({ timeout: 30000 });
    });
  },
);
