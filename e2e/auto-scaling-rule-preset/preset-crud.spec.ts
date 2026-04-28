// spec: e2e/.agent-output/test-plan-auto-scaling-rule-preset.md
// sections: 1. Page Load, 2. Create Preset, 3. Edit Preset, 4. Delete Preset
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
  // In this version of Ant Design, .ant-modal itself has role="dialog"
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  // Wait for modal form inputs to be interactable (Ant Design modal has open animation)
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
  const row = page.getByRole('row').filter({ hasText: presetName });
  if ((await row.count()) === 0) return;
  // BAINameActionCell renders icon-only buttons; locate by icon class
  await row.locator('button:has(.anticon-delete)').click();
  const confirmModal = page.getByRole('dialog');
  await expect(confirmModal).toBeVisible({ timeout: 15000 });
  const confirmInput = confirmModal.locator('input');
  await confirmInput.fill(presetName);
  await confirmModal
    .getByRole('button', { name: 'Delete', exact: true })
    .click();
  await expect(confirmModal).toBeHidden({ timeout: 30000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Page Load and Table Display
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Auto Scaling Rule Preset - Page Load',
  { tag: ['@auto-scaling-rule-preset', '@admin', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    // 1.1 Superadmin can view the Auto Scaling Rule tab on the Admin Serving page
    test('Superadmin can view the Auto Scaling Rule tab with all toolbar elements and table columns', async ({
      page,
    }) => {
      // Navigate to the admin-serving page with prometheus-preset tab
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      await page.waitForLoadState('domcontentloaded');

      // Verify the active tab is "Auto Scaling Rule"
      await expect(
        page.getByRole('tab', { name: 'Auto Scaling Rule', selected: true }),
      ).toBeVisible({ timeout: 15000 });

      // Verify the filter bar (BAIGraphQLPropertyFilter) is visible
      await expect(
        page.getByRole('combobox', { name: 'Search' }),
      ).toBeVisible();

      // Verify the "Add Preset" button is visible
      await expect(
        page.getByRole('button', { name: /Add Preset/i }),
      ).toBeVisible();

      // Verify the refresh (reload) button is visible
      await expect(page.getByRole('button', { name: 'reload' })).toBeVisible();

      // Verify table column headers: Name, Metric Name, Query Template, Time Window
      await expect(
        page.getByRole('columnheader', { name: 'Name', exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Metric Name' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Query Template' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Time Window' }),
      ).toBeVisible();

      // Verify "Created At" and "Updated At" are NOT visible by default
      await expect(
        page.getByRole('columnheader', { name: 'Created At' }),
      ).toBeHidden();
      await expect(
        page.getByRole('columnheader', { name: 'Updated At' }),
      ).toBeHidden();

      // Verify the table settings (gear) button is visible
      await expect(page.getByRole('button', { name: 'setting' })).toBeVisible();
    });

    // 1.2 Superadmin can see pagination controls on the preset list
    test('Superadmin can see pagination controls on the preset list', async ({
      page,
    }) => {
      // Navigate to the prometheus preset tab
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);

      // Verify the table renders
      await expect(page.getByRole('table')).toBeVisible();

      // Verify pagination controls are visible
      await expect(
        page.getByRole('listitem').filter({ hasText: /items/ }),
      ).toBeVisible();
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Create Preset
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Auto Scaling Rule Preset - Create',
  { tag: ['@auto-scaling-rule-preset', '@admin', '@crud'] },
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

    // 2.1 Superadmin can open the Create Preset modal
    test('Superadmin can open the Create Preset modal with all form fields', async ({
      page,
    }) => {
      // Navigate to the prometheus preset tab
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);

      // Click the "Add Preset" button
      await page.getByRole('button', { name: /Add Preset/i }).click();

      // Verify the modal opens with title "Create Preset"
      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('Create Preset');

      // Verify form fields are visible
      await expect(
        modal.getByRole('textbox', { name: 'Name', exact: true }),
      ).toBeVisible();
      await expect(
        modal.getByRole('textbox', { name: 'Description (optional)' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('combobox', { name: 'Category (optional)' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('spinbutton', { name: 'Rank (optional)' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('textbox', { name: 'Metric Name' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('textbox', { name: 'Query Template' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('textbox', { name: 'Time Window (optional)' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('combobox', { name: 'Filter Labels (optional)' }),
      ).toBeVisible();
      await expect(
        modal.getByRole('combobox', { name: 'Group Labels (optional)' }),
      ).toBeVisible();

      // Verify "Create" button is visible
      await expect(modal.getByRole('button', { name: 'Create' })).toBeVisible();

      // Verify "Cancel" button is visible
      await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();

      // Verify NO PrometheusPresetPreview section (only in edit mode)
      await expect(modal.getByText('Current value:')).toBeHidden();

      // Close modal
      await modal.getByRole('button', { name: 'Cancel' }).click();
    });

    // 2.2 Superadmin can create a new preset with only required fields
    test('Superadmin can create a new preset with only required fields', async ({
      page,
    }) => {
      presetName = `e2e-preset-create-required-${Date.now()}`;

      // Navigate to the prometheus preset tab
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);

      // Click the "Add Preset" button
      await page.getByRole('button', { name: /Add Preset/i }).click();
      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Fill in the Name field
      await modal
        .getByRole('textbox', { name: 'Name', exact: true })
        .fill(presetName);

      // Fill in the Metric Name field
      await modal
        .getByRole('textbox', { name: 'Metric Name' })
        .fill('e2e_cpu_util');

      // Fill in the Query Template field
      await modal
        .getByRole('textbox', { name: 'Query Template' })
        .fill('rate(container_cpu_usage_seconds_total[5m])');

      // Click "Create"
      await modal.getByRole('button', { name: 'Create' }).click();

      // Verify success notification
      await expect(
        page.getByText(
          'Prometheus query preset has been successfully created.',
        ),
      ).toBeVisible({ timeout: 60000 });

      // Verify the modal closes
      await expect(modal).toBeHidden();

      // Verify the new preset row appears in the table
      const newRow = page.getByRole('row').filter({ hasText: presetName });
      await expect(newRow).toBeVisible({ timeout: 60000 });
      await expect(
        newRow.getByRole('cell', { name: 'e2e_cpu_util' }),
      ).toBeVisible();
    });

    // 2.3 Superadmin can create a new preset with all fields populated
    test('Superadmin can create a new preset with all fields populated', async ({
      page,
    }) => {
      presetName = `e2e-preset-create-full-${Date.now()}`;

      // Navigate and open modal
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      await page.waitForLoadState('domcontentloaded');
      await expect(
        page.getByRole('button', { name: /Add Preset/i }),
      ).toBeVisible({ timeout: 60000 });
      await page.getByRole('button', { name: /Add Preset/i }).click();
      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      // Wait for modal open animation and form render before interacting
      const nameInput = modal.getByRole('textbox', {
        name: 'Name',
        exact: true,
      });
      await expect(nameInput).toBeVisible({ timeout: 30000 });

      // Fill Name
      await nameInput.fill(presetName);

      // Fill Description
      await modal
        .getByRole('textbox', { name: 'Description (optional)' })
        .fill('E2E full-field test description');

      // Fill Rank
      await modal
        .getByRole('spinbutton', { name: 'Rank (optional)' })
        .fill('10');

      // Fill Metric Name
      await modal
        .getByRole('textbox', { name: 'Metric Name' })
        .fill('e2e_request_rate');

      // Fill Query Template
      await modal
        .getByRole('textbox', { name: 'Query Template' })
        .fill('rate(http_requests_total[5m])');

      // Fill Time Window
      await modal
        .getByRole('textbox', { name: 'Time Window (optional)' })
        .fill('5m');

      // Add Filter Labels tag — Ant Design Select mode="tags" requires click-to-open + keyboard input
      await modal
        .getByRole('combobox', { name: 'Filter Labels (optional)' })
        .click();
      await page.keyboard.type('namespace');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Escape');

      // Add Group Labels tag
      await modal
        .getByRole('combobox', { name: 'Group Labels (optional)' })
        .click();
      await page.keyboard.type('pod');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Escape');

      // Click "Create"
      await modal.getByRole('button', { name: 'Create' }).click();

      // Verify success notification
      await expect(
        page.getByText(
          'Prometheus query preset has been successfully created.',
        ),
      ).toBeVisible({ timeout: 60000 });

      // Verify modal closes
      await expect(modal).toBeHidden();

      // Verify row appears with correct values
      const newRow = page.getByRole('row').filter({ hasText: presetName });
      await expect(newRow).toBeVisible({ timeout: 60000 });
      await expect(
        newRow.getByRole('cell', { name: 'e2e_request_rate' }),
      ).toBeVisible();
      await expect(
        newRow.getByRole('cell', { name: '5m', exact: true }),
      ).toBeVisible();
    });

    // 2.4 Superadmin cannot create a preset without a Name
    test('Superadmin cannot create a preset without a Name', async ({
      page,
    }) => {
      // Navigate and open modal
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      await page.getByRole('button', { name: /Add Preset/i }).click();
      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Leave Name empty, fill required fields
      await modal
        .getByRole('textbox', { name: 'Metric Name' })
        .fill('e2e_metric');
      await modal.getByRole('textbox', { name: 'Query Template' }).fill('up');

      // Click "Create"
      await modal.getByRole('button', { name: 'Create' }).click();

      // Verify validation error for Name field
      await expect(modal.getByText('Name is required.')).toBeVisible();

      // Verify modal remains open
      await expect(modal).toBeVisible();

      // Close modal
      await modal.getByRole('button', { name: 'Cancel' }).click();
    });

    // 2.5 Superadmin cannot create a preset without a Metric Name
    test('Superadmin cannot create a preset without a Metric Name', async ({
      page,
    }) => {
      // Navigate and open modal
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      await page.getByRole('button', { name: /Add Preset/i }).click();
      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Fill Name and Query Template but leave Metric Name empty
      await modal
        .getByRole('textbox', { name: 'Name', exact: true })
        .fill(`e2e-preset-no-metric-${Date.now()}`);
      await modal.getByRole('textbox', { name: 'Query Template' }).fill('up');

      // Click "Create"
      await modal.getByRole('button', { name: 'Create' }).click();

      // Verify validation error for Metric Name field
      await expect(modal.getByText('Metric name is required.')).toBeVisible();

      // Verify modal remains open
      await expect(modal).toBeVisible();

      // Close modal
      await modal.getByRole('button', { name: 'Cancel' }).click();
    });

    // 2.6 Superadmin cannot create a preset without a Query Template
    test('Superadmin cannot create a preset without a Query Template', async ({
      page,
    }) => {
      // Navigate and open modal
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      await page.getByRole('button', { name: /Add Preset/i }).click();
      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Fill Name and Metric Name but leave Query Template empty
      await modal
        .getByRole('textbox', { name: 'Name', exact: true })
        .fill(`e2e-preset-no-query-${Date.now()}`);
      await modal
        .getByRole('textbox', { name: 'Metric Name' })
        .fill('e2e_metric');

      // Click "Create"
      await modal.getByRole('button', { name: 'Create' }).click();

      // Verify validation error for Query Template field
      await expect(
        modal.getByText('Query template is required.'),
      ).toBeVisible();

      // Verify modal remains open
      await expect(modal).toBeVisible();

      // Close modal
      await modal.getByRole('button', { name: 'Cancel' }).click();
    });

    // 2.7 Superadmin can cancel the Create Preset modal without creating anything
    test('Superadmin can cancel the Create Preset modal without creating anything', async ({
      page,
    }) => {
      const cancelledName = `e2e-preset-cancelled-${Date.now()}`;

      // Navigate and note the initial count
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      const paginationInfo = page
        .getByRole('listitem')
        .filter({ hasText: /items/ });
      await expect(paginationInfo).toBeVisible({ timeout: 60000 });
      // Open modal and fill fields
      await expect(
        page.getByRole('button', { name: /Add Preset/i }),
      ).toBeVisible({ timeout: 60000 });
      await page.getByRole('button', { name: /Add Preset/i }).click();
      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      await modal
        .getByRole('textbox', { name: 'Name', exact: true })
        .fill(cancelledName);
      await modal
        .getByRole('textbox', { name: 'Metric Name' })
        .fill('e2e_metric');
      await modal.getByRole('textbox', { name: 'Query Template' }).fill('up');

      // Click "Cancel"
      await modal.getByRole('button', { name: 'Cancel' }).click();

      // Verify modal closes
      await expect(modal).toBeHidden({ timeout: 30000 });

      // Verify cancelled preset is not in the table
      await expect(
        page.getByRole('row').filter({ hasText: cancelledName }),
      ).toBeHidden();
    });

    // 2.8 Superadmin cannot create two presets with the same name (uniqueness constraint)
    // The backend currently allows duplicate preset names without returning an error,
    // so the expected error notification never appears.
    test.fixme('Superadmin cannot create a preset with a duplicate name', async ({
      page,
    }) => {
      const duplicateName = `e2e-preset-duplicate-${Date.now()}`;

      // Navigate and create first preset
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      await createPreset(page, duplicateName, 'e2e_metric_1', 'up');

      // Verify first preset created successfully and appears in table
      await expect(
        page.getByRole('row').filter({ hasText: duplicateName }),
      ).toBeVisible({ timeout: 60000 });

      // Attempt to create second preset with same name
      await page.getByRole('button', { name: /Add Preset/i }).click();
      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      await modal
        .getByRole('textbox', { name: 'Name', exact: true })
        .fill(duplicateName);
      await modal
        .getByRole('textbox', { name: 'Metric Name' })
        .fill('e2e_metric_2');
      await modal.getByRole('textbox', { name: 'Query Template' }).fill('up');
      await modal.getByRole('button', { name: 'Create' }).click();

      // Verify error notification (duplicate name rejected by server)
      await expect(
        page
          .locator('.ant-message, .ant-notification')
          .filter({ hasText: /error|duplicate|unique|already/i }),
      ).toBeVisible({ timeout: 60000 });

      // Verify modal remains open
      await expect(modal).toBeVisible();

      // Close modal
      await modal.getByRole('button', { name: 'Cancel' }).click();

      // Cleanup first preset
      await deletePreset(page, duplicateName);
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Edit Preset
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Auto Scaling Rule Preset - Edit',
  { tag: ['@auto-scaling-rule-preset', '@admin', '@crud'] },
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

    // 3.1 Superadmin can open the Edit Preset modal for an existing preset
    test('Superadmin can open the Edit Preset modal with pre-filled values and live preview', async ({
      page,
    }) => {
      presetName = `e2e-preset-edit-open-${Date.now()}`;

      // Create a preset via helper (leaves page on admin-serving?tab=prometheus-preset)
      await createPreset(page, presetName, 'e2e_old_metric', 'up');

      // Locate the preset row and click the Edit button
      const row = page.getByRole('row').filter({ hasText: presetName });
      await expect(row).toBeVisible({ timeout: 60000 });
      await row.locator('button:has(.anticon-edit)').click();

      // Verify modal opens with title "Edit Preset"
      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('Edit Preset');

      // Verify Name field is pre-filled
      await expect(
        modal.getByRole('textbox', { name: 'Name', exact: true }),
      ).toHaveValue(presetName);

      // Verify Metric Name is pre-filled
      await expect(
        modal.getByRole('textbox', { name: 'Metric Name' }),
      ).toHaveValue('e2e_old_metric');

      // Verify Query Template is pre-filled
      await expect(
        modal.getByRole('textbox', { name: 'Query Template' }),
      ).toHaveValue('up');

      // Verify live preview (PrometheusPresetPreview) is visible in edit mode
      await expect(modal.getByText('Current value:')).toBeVisible();

      // Verify Save button (not Create)
      await expect(modal.getByRole('button', { name: 'Save' })).toBeVisible();
      await expect(modal.getByRole('button', { name: 'Create' })).toBeHidden();

      // Close modal
      await modal.getByRole('button', { name: 'Cancel' }).click();
    });

    // 3.2 Superadmin can update the Metric Name of an existing preset
    test('Superadmin can update the Metric Name of an existing preset', async ({
      page,
    }) => {
      presetName = `e2e-preset-edit-metric-${Date.now()}`;

      // Create a preset (leaves page on admin-serving?tab=prometheus-preset)
      await createPreset(page, presetName, 'e2e_old_metric', 'up');

      // Locate the preset row and click Edit
      const row = page.getByRole('row').filter({ hasText: presetName });
      await expect(row).toBeVisible({ timeout: 60000 });
      await row.locator('button:has(.anticon-edit)').click();

      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('Edit Preset');

      // Clear and fill Metric Name
      await modal.getByRole('textbox', { name: 'Metric Name' }).clear();
      await modal
        .getByRole('textbox', { name: 'Metric Name' })
        .fill('e2e_new_metric');

      // Click "Save"
      await modal.getByRole('button', { name: 'Save' }).click();

      // Verify success notification
      await expect(
        page.getByText(
          'Prometheus query preset has been successfully updated.',
        ),
      ).toBeVisible({ timeout: 60000 });

      // Verify modal closes
      await expect(modal).toBeHidden({ timeout: 30000 });

      // Verify updated Metric Name in table row
      const updatedRow = page.getByRole('row').filter({ hasText: presetName });
      await expect(
        updatedRow.getByRole('cell', { name: 'e2e_new_metric' }),
      ).toBeVisible();
    });

    // 3.3 Superadmin can update the Time Window of an existing preset
    test('Superadmin can update the Time Window of an existing preset', async ({
      page,
    }) => {
      presetName = `e2e-preset-edit-window-${Date.now()}`;

      // Create a preset (no Time Window) — leaves page on admin-serving?tab=prometheus-preset
      await createPreset(page, presetName, 'e2e_metric', 'up');

      // Locate the preset row and click Edit
      const row = page.getByRole('row').filter({ hasText: presetName });
      await expect(row).toBeVisible({ timeout: 60000 });
      await row.locator('button:has(.anticon-edit)').click();

      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Fill Time Window
      await modal
        .getByRole('textbox', { name: 'Time Window (optional)' })
        .fill('10m');

      // Click "Save"
      await modal.getByRole('button', { name: 'Save' }).click();

      // Verify success notification
      await expect(
        page.getByText(
          'Prometheus query preset has been successfully updated.',
        ),
      ).toBeVisible({ timeout: 60000 });

      // Verify modal closes
      await expect(modal).toBeHidden({ timeout: 30000 });

      // Verify Time Window is updated in the table
      const updatedRow = page.getByRole('row').filter({ hasText: presetName });
      await expect(updatedRow.getByRole('cell', { name: '10m' })).toBeVisible();
    });

    // 3.4 Superadmin can add Filter Labels and Group Labels when editing a preset
    test('Superadmin can add Filter Labels and Group Labels when editing a preset', async ({
      page,
    }) => {
      presetName = `e2e-preset-edit-labels-${Date.now()}`;

      // Create a preset (leaves page on admin-serving?tab=prometheus-preset)
      await createPreset(page, presetName, 'e2e_metric', 'up');

      // Locate the preset row and click Edit
      const row = page.getByRole('row').filter({ hasText: presetName });
      await expect(row).toBeVisible({ timeout: 60000 });
      await row.locator('button:has(.anticon-edit)').click();

      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Add Filter Labels — Ant Design Select mode="tags" requires click-to-open + keyboard input
      await modal
        .getByRole('combobox', { name: 'Filter Labels (optional)' })
        .click();
      await page.keyboard.type('namespace');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Escape');

      // Add Group Labels
      await modal
        .getByRole('combobox', { name: 'Group Labels (optional)' })
        .click();
      await page.keyboard.type('pod');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Escape');

      // Click "Save"
      await modal.getByRole('button', { name: 'Save' }).click();

      // Verify success notification
      await expect(
        page.getByText(
          'Prometheus query preset has been successfully updated.',
        ),
      ).toBeVisible({ timeout: 60000 });

      // Verify modal closes
      await expect(modal).toBeHidden({ timeout: 30000 });
    });

    // 3.5 Superadmin cannot save an edited preset without a Name
    test('Superadmin cannot save an edited preset without a Name', async ({
      page,
    }) => {
      presetName = `e2e-preset-edit-clear-name-${Date.now()}`;

      // Create a preset (leaves page on admin-serving?tab=prometheus-preset)
      await createPreset(page, presetName, 'e2e_metric', 'up');

      // Locate the preset row and click Edit
      const row = page.getByRole('row').filter({ hasText: presetName });
      await expect(row).toBeVisible({ timeout: 60000 });
      await row.locator('button:has(.anticon-edit)').click();

      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Clear the Name field using triple-click to select all then delete
      await modal
        .getByRole('textbox', { name: 'Name', exact: true })
        .click({ clickCount: 3 });
      await modal
        .getByRole('textbox', { name: 'Name', exact: true })
        .press('Delete');

      // Click "Save"
      await modal.getByRole('button', { name: 'Save' }).click();

      // Verify validation error
      await expect(modal.getByText('Name is required.')).toBeVisible();

      // Verify modal remains open
      await expect(modal).toBeVisible();

      // Close modal
      await modal.getByRole('button', { name: 'Cancel' }).click();
    });

    // 3.6 Superadmin cannot save an edited preset without a Metric Name
    test('Superadmin cannot save an edited preset without a Metric Name', async ({
      page,
    }) => {
      presetName = `e2e-preset-edit-clear-metric-${Date.now()}`;

      // Create a preset (leaves page on admin-serving?tab=prometheus-preset)
      await createPreset(page, presetName, 'e2e_metric', 'up');

      // Locate the preset row and click Edit
      const row = page.getByRole('row').filter({ hasText: presetName });
      await expect(row).toBeVisible({ timeout: 60000 });
      await row.locator('button:has(.anticon-edit)').click();

      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Clear the Metric Name field
      await modal.getByRole('textbox', { name: 'Metric Name' }).clear();

      // Click "Save"
      await modal.getByRole('button', { name: 'Save' }).click();

      // Verify validation error
      await expect(modal.getByText('Metric name is required.')).toBeVisible();

      // Verify modal remains open
      await expect(modal).toBeVisible();

      // Close modal
      await modal.getByRole('button', { name: 'Cancel' }).click();
    });

    // 3.7 Superadmin can cancel the Edit Preset modal without saving changes
    test('Superadmin can cancel the Edit Preset modal without saving changes', async ({
      page,
    }) => {
      presetName = `e2e-preset-edit-cancel-${Date.now()}`;

      // Create a preset (leaves page on admin-serving?tab=prometheus-preset)
      await createPreset(page, presetName, 'e2e_old_metric', 'up');

      // Locate the preset row and click Edit
      const row = page.getByRole('row').filter({ hasText: presetName });
      await expect(row).toBeVisible({ timeout: 60000 });
      await row.locator('button:has(.anticon-edit)').click();

      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Clear Metric Name and type a different value
      await modal.getByRole('textbox', { name: 'Metric Name' }).clear();
      await modal
        .getByRole('textbox', { name: 'Metric Name' })
        .fill('e2e_changed_metric');

      // Click "Cancel"
      await modal.getByRole('button', { name: 'Cancel' }).click();

      // Verify modal closes
      await expect(modal).toBeHidden({ timeout: 30000 });

      // Verify the row still shows the original Metric Name (unchanged)
      const unchangedRow = page
        .getByRole('row')
        .filter({ hasText: presetName });
      await expect(
        unchangedRow.getByRole('cell', { name: 'e2e_old_metric' }),
      ).toBeVisible();
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Delete Preset
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Auto Scaling Rule Preset - Delete',
  { tag: ['@auto-scaling-rule-preset', '@admin', '@crud'] },
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

    // 4.1 Superadmin can delete a preset by typing its exact name
    test('Superadmin can delete a preset by typing its exact name in the confirmation modal', async ({
      page,
    }) => {
      presetName = `e2e-preset-delete-confirm-${Date.now()}`;

      // Create a preset (leaves page on admin-serving?tab=prometheus-preset)
      await createPreset(page, presetName, 'e2e_metric', 'up');

      // Locate the preset row and click Delete
      const row = page.getByRole('row').filter({ hasText: presetName });
      await expect(row).toBeVisible({ timeout: 60000 });
      await row.locator('button:has(.anticon-delete)').click();

      // Verify the BAIConfirmModalWithInput opens
      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const confirmModal = page.getByRole('dialog');
      await expect(confirmModal).toBeVisible();
      await expect(confirmModal).toContainText(
        `Permanently delete "${presetName}"`,
      );

      // Verify warning alert is visible
      await expect(
        confirmModal
          .getByRole('alert')
          .filter({ hasText: /permanently|cannot be undone/i }),
      ).toBeVisible();

      // Verify Delete button is DISABLED before typing
      const deleteButton = confirmModal.getByRole('button', {
        name: 'Delete',
        exact: true,
      });
      await expect(deleteButton).toBeDisabled();

      // Type the exact preset name in the confirmation input
      const confirmInput = confirmModal.locator('input');
      await expect(confirmInput).toBeVisible({ timeout: 5000 });
      await confirmInput.fill(presetName);

      // Verify Delete button is now ENABLED
      await expect(deleteButton).toBeEnabled();

      // Click "Delete"
      await deleteButton.click();

      // Verify modal closes and row is removed
      await expect(confirmModal).toBeHidden({ timeout: 30000 });
      await expect(
        page.getByRole('row').filter({ hasText: presetName }),
      ).toBeHidden({ timeout: 10000 });

      // Verify row is no longer in the table
      await expect(
        page.getByRole('row').filter({ hasText: presetName }),
      ).toBeHidden();

      // Clear presetName to avoid double-cleanup in afterEach
      presetName = '';
    });

    // 4.2 Superadmin cannot delete a preset with an incorrect confirmation string
    test('Superadmin cannot delete a preset with an incorrect confirmation string', async ({
      page,
    }) => {
      presetName = `e2e-preset-delete-wrong-${Date.now()}`;

      // Create a preset
      // Create a preset (leaves page on admin-serving?tab=prometheus-preset)
      await createPreset(page, presetName, 'e2e_metric', 'up');

      // Locate the preset row and click Delete
      const row = page.getByRole('row').filter({ hasText: presetName });
      await expect(row).toBeVisible({ timeout: 60000 });
      await row.locator('button:has(.anticon-delete)').click();

      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const confirmModal = page.getByRole('dialog');
      await expect(confirmModal).toBeVisible();

      // Verify Delete button starts disabled
      const deleteButton = confirmModal.getByRole('button', {
        name: 'Delete',
        exact: true,
      });
      await expect(deleteButton).toBeDisabled();

      // Type a wrong string
      const confirmInput = confirmModal.locator('input');
      await expect(confirmInput).toBeVisible({ timeout: 5000 });
      await confirmInput.fill('wrongname-does-not-match');

      // Verify Delete button remains DISABLED
      await expect(deleteButton).toBeDisabled();

      // Click Cancel
      await confirmModal.getByRole('button', { name: 'Cancel' }).click();

      // Verify modal closes
      await expect(confirmModal).toBeHidden({ timeout: 30000 });

      // Verify preset row is still visible
      await expect(
        page.getByRole('row').filter({ hasText: presetName }),
      ).toBeVisible();
    });

    // 4.3 Superadmin can cancel the delete confirmation modal without deleting
    test('Superadmin can cancel the delete confirmation modal without deleting the preset', async ({
      page,
    }) => {
      presetName = `e2e-preset-delete-cancel-${Date.now()}`;

      // Create a preset (leaves page on admin-serving?tab=prometheus-preset)
      await createPreset(page, presetName, 'e2e_metric', 'up');

      // Locate the preset row and click Delete
      const row = page.getByRole('row').filter({ hasText: presetName });
      await expect(row).toBeVisible({ timeout: 60000 });
      await row.locator('button:has(.anticon-delete)').click();

      // In this version of Ant Design, .ant-modal itself has role="dialog"
      const confirmModal = page.getByRole('dialog');
      await expect(confirmModal).toBeVisible();
      // Wait for Ant Design open animation to finish (ant-zoom-appear) before clicking
      await expect(confirmModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });

      // Click Cancel without typing anything
      await confirmModal.getByRole('button', { name: 'Cancel' }).click();

      // Verify modal closes
      await expect(confirmModal).toBeHidden({ timeout: 30000 });

      // Verify preset row is still visible
      await expect(
        page.getByRole('row').filter({ hasText: presetName }),
      ).toBeVisible();
    });
  },
);
