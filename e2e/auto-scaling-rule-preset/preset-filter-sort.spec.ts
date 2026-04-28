// spec: e2e/.agent-output/test-plan-auto-scaling-rule-preset.md
// sections: 5. Filter by Name, 6. Sorting
import { loginAsAdmin, webuiEndpoint } from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function createPreset(
  page: Page,
  name: string,
  metricName = 'e2e_metric',
  queryTemplate = 'up',
): Promise<void> {
  await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByRole('button', { name: /Add Preset/i })).toBeVisible({
    timeout: 60000,
  });
  await page.getByRole('button', { name: /Add Preset/i }).click();
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
    page.getByText('Prometheus query preset has been successfully created.'),
  ).toBeVisible({ timeout: 120000 });
  await expect(modal).toBeHidden({ timeout: 30000 });
}

async function deletePreset(page: Page, presetName: string): Promise<void> {
  await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByRole('button', { name: /Add Preset/i })).toBeVisible({
    timeout: 60000,
  });
  const row = page.getByRole('row').filter({ hasText: presetName });
  if ((await row.count()) === 0) return;
  await row.locator('button:has(.anticon-delete)').click();
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
 * Apply a name filter using BAIGraphQLPropertyFilter.
 * Uses pressSequentially (not fill) to properly trigger React's controlled input onChange,
 * then clicks the search button to submit the filter condition.
 * Returns the filter tag locator for further assertions.
 */
async function applyNameFilter(page: Page, searchValue: string): Promise<void> {
  const filterBar = page.locator('.ant-space-compact').first();
  await expect(filterBar).toBeVisible({ timeout: 10000 });
  const autoCompleteInput = filterBar.locator('input').last();
  await autoCompleteInput.click();
  await autoCompleteInput.pressSequentially(searchValue);
  // Click the search button to submit the filter condition
  await page.getByRole('button', { name: 'search' }).click();
  // Wait for the filter tag to appear, confirming the condition was added to local state
  await expect(page.locator('.ant-tag')).toBeVisible({ timeout: 5000 });
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
        page.getByRole('button', { name: /Add Preset/i }),
      ).toBeVisible({ timeout: 60000 });

      // Apply name filter using the unique timestamp part
      await applyNameFilter(page, filterKey);

      // Verify the filter chip (tag) shows the condition label
      await expect(
        page.locator('.ant-tag').filter({ hasText: new RegExp(filterKey) }),
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
        page.getByRole('button', { name: /Add Preset/i }),
      ).toBeVisible({ timeout: 60000 });

      // Apply a filter guaranteed not to match any preset
      const nonExistentValue = `zzz-e2e-nonexistent-xyz-${Date.now()}`;
      await applyNameFilter(page, nonExistentValue);

      // Verify filter tag shows the condition
      await expect(
        page
          .locator('.ant-tag')
          .filter({ hasText: /zzz-e2e-nonexistent-xyz-/ }),
      ).toBeVisible({ timeout: 5000 });

      // Verify empty state via Ant Design table placeholder row
      await expect(page.locator('.ant-table-placeholder')).toBeVisible({
        timeout: 15000,
      });
    });

    // 5.3 Superadmin can clear an active filter to restore the full list
    test('Superadmin can clear an active filter to restore the full list', async ({
      page,
    }) => {
      // Navigate and note the initial row count
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      await page.waitForLoadState('domcontentloaded');
      await expect(
        page.getByRole('button', { name: /Add Preset/i }),
      ).toBeVisible({ timeout: 60000 });
      const paginationInfo = page
        .getByRole('listitem')
        .filter({ hasText: /items/ });
      await expect(paginationInfo).toBeVisible({ timeout: 10000 });
      const initialCountText = await paginationInfo.textContent();

      // Apply a non-matching filter so the table shows 0 results
      const filterValue = `e2e-nonexistent-clear-test-${Date.now()}`;
      await applyNameFilter(page, filterValue);

      // Verify the filter tag appeared
      const filterTag = page
        .locator('.ant-tag')
        .filter({ hasText: /e2e-nonexistent-clear-test-/ });
      await expect(filterTag).toBeVisible({ timeout: 5000 });

      // Verify the table shows empty state with the non-matching filter applied
      await expect(page.locator('.ant-table-placeholder')).toBeVisible({
        timeout: 30000,
      });

      // Click the close icon on the filter tag to remove the filter
      const filterTagCloseIcon = filterTag.locator(
        '.ant-tag-close-icon, [aria-label="close"]',
      );
      await filterTagCloseIcon.click();

      // Verify filter tag is gone
      await expect(filterTag).toBeHidden({ timeout: 10000 });

      // Verify pagination total returns to the original count
      await expect(paginationInfo).toHaveText(initialCountText!, {
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
      // Use exact: true to avoid matching "Metric Name" column header
      const nameHeader = page.getByRole('columnheader', {
        name: 'Name',
        exact: true,
      });
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
      // Use exact: true to avoid matching "Metric Name" column header
      const nameHeader = page.getByRole('columnheader', {
        name: 'Name',
        exact: true,
      });
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
      await page.getByRole('button', { name: 'setting' }).click();
      const settingsModal = page.getByRole('dialog');
      await expect(settingsModal).toBeVisible();
      await expect(settingsModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });

      // Enable "Created At" column
      await settingsModal.getByRole('checkbox', { name: 'Created At' }).check();

      // Click OK to apply
      await settingsModal.getByRole('button', { name: 'OK' }).click();
      await expect(settingsModal).toBeHidden({ timeout: 30000 });

      // Verify "Created At" column header is now visible
      const createdAtHeader = page.getByRole('columnheader', {
        name: 'Created At',
      });
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
      await page.getByRole('button', { name: 'setting' }).click();
      await expect(settingsModal).toBeVisible();
      await expect(settingsModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });
      await settingsModal
        .getByRole('checkbox', { name: 'Created At' })
        .uncheck();
      await settingsModal.getByRole('button', { name: 'OK' }).click();
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
      await page.getByRole('button', { name: 'setting' }).click();
      const settingsModal = page.getByRole('dialog');
      await expect(settingsModal).toBeVisible();
      await expect(settingsModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });

      // Enable "Updated At" column
      await settingsModal.getByRole('checkbox', { name: 'Updated At' }).check();

      // Click OK to apply
      await settingsModal.getByRole('button', { name: 'OK' }).click();
      await expect(settingsModal).toBeHidden({ timeout: 30000 });

      // Verify "Updated At" column header is now visible
      const updatedAtHeader = page.getByRole('columnheader', {
        name: 'Updated At',
      });
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
      await page.getByRole('button', { name: 'setting' }).click();
      await expect(settingsModal).toBeVisible();
      await expect(settingsModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });
      await settingsModal
        .getByRole('checkbox', { name: 'Updated At' })
        .uncheck();
      await settingsModal.getByRole('button', { name: 'OK' }).click();
      await expect(settingsModal).toBeHidden({ timeout: 30000 });
    });
  },
);
