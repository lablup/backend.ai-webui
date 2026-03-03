// spec: environment/ImageList-BAIPropertyFilter-Test-Plan.md
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { findColumnIndex } from '../utils/test-util-antd';
import { expect, test, Page } from '@playwright/test';

test.describe(
  'environment ',
  { tag: ['@regression', '@environment', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await page.getByRole('menuitem', { name: 'Admin Settings' }).click();
      await page
        .getByRole('menuitem', { name: 'file-done Environments' })
        .click();
      await expect(page).toHaveURL(/\/environment/);
      await page.waitForLoadState('networkidle');
      // Wait for the table to be visible
      await page
        .locator('.ant-table-content')
        .waitFor({ state: 'visible', timeout: 10000 });
    });
    test('Rendering Image List', async ({ page }) => {
      const table = page.locator('.ant-table-content');
      await expect(table).toBeVisible();
    });

    // skip this test because there is no way to uninstall the image in WebUI
    test.skip('user can install image', async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'environment');
      const imageListTable = page.locator('.ant-table-content');
      await expect(imageListTable).toBeVisible();
      // Sort installation status
      await page
        .locator('.ant-table-cell.ant-table-column-sort')
        .first()
        .click();

      // Find uninstalled item and select
      const uninstalledImage = page
        .locator('.ant-table-cell.ant-table-column-sort')
        .filter({
          hasNot: page.locator('.ant-tag-gold'),
        })
        .nth(1);
      // If all images are installed, skip the test
      const count = await uninstalledImage.count();
      if (count === 0) {
        test.skip();
      }
      await uninstalledImage.click();

      // Install image
      await page
        .getByRole('button', { name: 'vertical-align-bottom Install' })
        .click();
      await page.getByRole('button', { name: 'Install', exact: true }).click();
      await expect(
        page.getByText('It takes time so have a cup of coffee!'),
      ).toBeVisible();

      // Verify installing status
      const rows = await imageListTable.locator('.ant-table-row');
      const statusColumnIndex = await findColumnIndex(imageListTable, 'Status');

      const installingItem = await rows
        .locator('.ant-table-cell')
        .nth(statusColumnIndex)
        .first();
      await expect(installingItem.getByText('installing')).toBeVisible();
    });

    test('user can modify image resource limit', async ({ page }) => {
      const CPU_CORE = '5';
      const MEMORY_SIZE = '1';
      const imageListTable = page.locator('.ant-table-content');
      await expect(imageListTable).toBeVisible();

      // Click resource limit button
      const rows = imageListTable.locator('.ant-table-row');
      const firstRow = rows.first();
      const controlColumnIndex = await findColumnIndex(
        imageListTable,
        'Control',
      );
      await firstRow
        .locator('.ant-table-cell')
        .nth(controlColumnIndex)
        .getByRole('button', { name: 'setting' })
        .click();
      await page.waitForLoadState('networkidle');
      // get resource limit from control modal
      const resourceLimitControlModal = page.getByRole('dialog', {
        name: /Modify Minimum Image Resource Limit/i,
      });

      await expect(resourceLimitControlModal).toBeVisible();

      const cpuFormItem = resourceLimitControlModal.locator(
        '.ant-form-item-row:has-text("CPU")',
      );
      const cpuFormItemInput = cpuFormItem.locator('input');
      const cpuValue = await cpuFormItemInput.getAttribute('value');

      const memoryFormItem = resourceLimitControlModal.locator(
        '.ant-form-item-row:has-text("Memory")',
      );
      const memoryFormItemInput = memoryFormItem.locator(
        '.ant-input-number input',
      );
      const memoryValue = await memoryFormItemInput.getAttribute('value');
      // In Ant Design 6, the unit selector structure changed - use .ant-select .ant-typography
      const memorySize = await memoryFormItem
        .locator('.ant-select .ant-typography')
        .textContent();
      // modify resource limit
      await cpuFormItemInput.fill(CPU_CORE);
      await expect(cpuFormItemInput).toHaveValue(CPU_CORE);
      await memoryFormItemInput.fill(MEMORY_SIZE + 'g');
      await expect(memoryFormItemInput).toHaveValue(MEMORY_SIZE);
      // click ok button
      await resourceLimitControlModal
        .getByRole('button', { name: 'OK' })
        .click();
      const reinstallationText = await page
        .getByText('Image reinstallation required')
        .count();
      if (reinstallationText > 0) {
        await page.getByRole('button', { name: 'OK' }).nth(1).click();
      }
      // verify resource limit is modified
      await firstRow
        .locator('.ant-table-cell')
        .nth(controlColumnIndex)
        .getByRole('button', { name: 'setting' })
        .click();
      await page.waitForLoadState('networkidle');
      // In Ant Design 6, use role-based selector for dialog
      const modifiedResourceLimitControlModal = page.getByRole('dialog', {
        name: /Modify Minimum Image Resource Limit/i,
      });
      await expect(modifiedResourceLimitControlModal).toBeVisible();
      const modifiedCpuFormItemInput =
        modifiedResourceLimitControlModal.locator(
          '.ant-form-item-row:has-text("CPU") input',
        );
      const modifiedMemoryFormItemInput =
        modifiedResourceLimitControlModal.locator(
          '.ant-form-item-row:has-text("Memory") .ant-input-number input',
        );
      await expect(modifiedCpuFormItemInput).toHaveValue(CPU_CORE);
      await expect(modifiedMemoryFormItemInput).toHaveValue(MEMORY_SIZE);
      // In Ant Design 6, the unit selector structure changed - use .ant-select .ant-typography
      await expect(
        modifiedResourceLimitControlModal
          .locator('.ant-form-item-row:has-text("Memory")')
          .locator('.ant-select .ant-typography'),
      ).toHaveText('GiB');

      // reset resource limit
      modifiedCpuFormItemInput.fill(cpuValue as string);
      await expect(modifiedCpuFormItemInput).toHaveValue(cpuValue as string);
      modifiedMemoryFormItemInput.fill(memoryValue as string);
      await expect(modifiedMemoryFormItemInput).toHaveValue(
        memoryValue as string,
      );
      // In Ant Design 6, click on the select component wrapper
      const memorySizeAddon = modifiedResourceLimitControlModal.locator(
        '.ant-form-item-row:has-text("Memory") .ant-select',
      );
      await memorySizeAddon.click();
      await page
        .locator(`.ant-select-item-option-content:has-text("${memorySize}")`)
        .click();
      // click ok button
      await modifiedResourceLimitControlModal
        .getByRole('button', { name: 'OK' })
        .click();
      const reinstallationTextAfterReset = await page
        .getByText('Image reinstallation required')
        .count();
      if (reinstallationTextAfterReset > 0) {
        await page.getByRole('button', { name: 'OK' }).nth(1).click();
      }
    });

    test('user can manage apps', async ({ page }) => {
      const imageListTable = page.locator('.ant-table-content');
      await expect(imageListTable).toBeVisible();
      // Click manage apps button

      const rows = imageListTable.locator('.ant-table-row');
      const firstRow = rows.first();
      const controlColumnIndex = await findColumnIndex(
        imageListTable,
        'Control',
      );
      await firstRow
        .locator('.ant-table-cell')
        .nth(controlColumnIndex)
        .getByRole('button', { name: 'appstore' })
        .click();

      // Add app
      // In Ant Design 6, use role-based selector for dialog
      const modal = page.getByRole('dialog', { name: /Manage Apps/i });
      await expect(modal).toBeVisible();
      const numberOfAppsBeforeAdd = await modal
        .locator('.ant-form-item')
        .count();
      await modal.getByRole('button', { name: 'plus Add' }).click();
      const addInfo = {
        app: 'e2e-test-app',
        protocol: 'tcp',
        port: '6006',
      };
      await modal
        .locator(`#apps_${numberOfAppsBeforeAdd}_app`)
        .fill(addInfo.app);
      await modal
        .locator(`#apps_${numberOfAppsBeforeAdd}_protocol`)
        .fill(addInfo.protocol);
      await modal
        .locator(`#apps_${numberOfAppsBeforeAdd}_port`)
        .fill(addInfo.port);

      // Click OK Button
      await modal.getByRole('button', { name: 'OK' }).click();
      const reinstallationText = await page
        .getByText('Image reinstallation required')
        .count();
      if (reinstallationText > 0) {
        await page.getByRole('button', { name: 'OK' }).nth(1).click();
      }

      // Verify app is added
      await firstRow
        .locator('.ant-table-cell')
        .nth(controlColumnIndex)
        .getByRole('button', { name: 'appstore' })
        .click();
      // In Ant Design 6, use role-based selector for dialog
      const modalAfterAdd = page.getByRole('dialog', { name: /Manage Apps/i });
      await expect(modalAfterAdd).toBeVisible();
      const numberOfApps = await modalAfterAdd
        .locator('.ant-form-item')
        .count();
      expect(numberOfApps).toBe(numberOfAppsBeforeAdd + 1);
      // Verify the last row has the added app info
      const lastRow = modalAfterAdd
        .locator('.ant-form-item-control-input-content > div')
        .last();
      await expect(lastRow.getByPlaceholder('App Name')).toHaveValue(
        addInfo.app,
      );
      await expect(lastRow.getByPlaceholder('Protocol')).toHaveValue(
        addInfo.protocol,
      );
      await expect(lastRow.getByPlaceholder('Port')).toHaveValue(addInfo.port);

      // Reset apps
      await modalAfterAdd
        .getByRole('button', { name: 'delete' })
        .nth(numberOfApps - 1)
        .click();
      await modalAfterAdd.getByRole('button', { name: 'OK' }).click();
      if (reinstallationText > 0) {
        await page.getByRole('button', { name: 'OK' }).nth(1).click();
      }
    });
  },
);

// ---------------------------------------------------------------------------
// Helper functions for BAIPropertyFilter interaction
// ---------------------------------------------------------------------------

/**
 * Apply a filter using BAIPropertyFilter on the Image List page.
 * BAIPropertyFilter.onSearch validates strict selection values against the options
 * list internally, so clicking the search button works for both free-text and
 * strict-selection properties.
 */
async function applyImageFilter(
  page: Page,
  propertyLabel: string,
  value: string,
) {
  // Click the visible Select wrapper (not the underlying input — it's intercepted by the display layer)
  await page
    .locator('.ant-space-compact')
    .first()
    .locator('.ant-select')
    .first()
    .click();
  await page.getByRole('option', { name: propertyLabel, exact: true }).click();

  const valueInput = page.locator('[aria-label="Filter value search"]');
  await valueInput.fill(value);
  await page.getByRole('button', { name: 'search' }).click();

  // Wait for table to reflect updated results
  await page
    .locator('.ant-spin-spinning')
    .waitFor({ state: 'detached', timeout: 10000 })
    .catch(() => {});
}

/**
 * Remove a specific filter tag by its displayed text.
 * Scopes tag lookup to closable .ant-tag elements to avoid matching
 * status badges or other non-closable tags in the table.
 */
async function removeFilterTag(page: Page, tagText: string) {
  const tag = page
    .locator('.ant-tag')
    .filter({ has: page.locator('[aria-label="Close"]') })
    .filter({ hasText: tagText });
  await tag.locator('[aria-label="Close"]').click();

  // Wait for any loading spinner to disappear after filter removal
  await page
    .locator('.ant-spin-spinning')
    .waitFor({ state: 'detached', timeout: 10000 })
    .catch(() => {});
}

// ---------------------------------------------------------------------------
// New describe block: ImageList - BAIPropertyFilter interaction tests
// ---------------------------------------------------------------------------

test.describe(
  'ImageList - BAIPropertyFilter',
  { tag: ['@regression', '@environment', '@functional', '@filter'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await page.getByRole('menuitem', { name: 'Admin Settings' }).click();
      await page
        .getByRole('menuitem', { name: 'file-done Environments' })
        .click();
      await expect(page).toHaveURL(/\/environment/);
      // Wait for the BAIPropertyFilter and table to be ready
      await expect(
        page.getByRole('combobox', { name: 'Filter property selector' }),
      ).toBeVisible();
      await expect(page.getByRole('table')).toBeVisible();
    });

    // Scenario 2.1 — BAIPropertyFilter UI rendered
    test('Admin can see the BAIPropertyFilter on the Images tab', async ({
      page,
    }) => {
      // 1. Verify the Space.Compact container of BAIPropertyFilter is visible
      await expect(page.locator('.ant-space-compact').first()).toBeVisible();

      // 2. Verify the property selector combobox is present with its aria-label
      await expect(
        page.getByRole('combobox', { name: 'Filter property selector' }),
      ).toBeVisible();

      // 3. Verify the value search input is present with its aria-label
      await expect(
        page.locator('[aria-label="Filter value search"]'),
      ).toBeVisible();

      // 4. Verify the BAIPropertyFilter search button (Input.Search submit) exists
      await expect(page.getByRole('button', { name: 'search' })).toBeVisible();
    });

    // Scenario 2.2 — Filter by name (free text)
    test('Admin can filter images by name using a text value', async ({
      page,
    }) => {
      // 1. Apply the Name filter with value "python" (assumes at least one python image is installed)
      await applyImageFilter(page, 'Name', 'python');

      // 2. Verify a filter tag "Name: python" appears below the filter inputs
      const nameTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: 'Name: python' });
      await expect(nameTag).toBeVisible();

      // 3. Verify the table is still visible (filtered results shown)
      await expect(page.locator('.ant-table-content')).toBeVisible();

      // 4. Cleanup: remove the filter tag
      await removeFilterTag(page, 'Name: python');
      await expect(nameTag).not.toBeVisible();
    });

    // Scenario 2.3 — Filter by architecture (strict selection)
    test('Admin can filter images by architecture using strict selection', async ({
      page,
    }) => {
      // 1. Apply Architecture filter with strict selection value "x86_64"
      await applyImageFilter(page, 'Architecture', 'x86_64');

      // 2. Verify filter tag "Architecture: x86_64" appears
      const archTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: 'Architecture: x86_64' });
      await expect(archTag).toBeVisible();

      // 3. Verify the table has at least one row with images
      await expect(
        page.locator('.ant-table-content .ant-table-row').first(),
      ).toBeVisible();

      // 4. Cleanup: remove the filter tag
      await removeFilterTag(page, 'Architecture: x86_64');
      await expect(archTag).not.toBeVisible();
    });

    // Scenario 2.4 — Filter by status (strict selection)
    test('Admin can filter images by status using strict selection', async ({
      page,
    }) => {
      // 1. Apply Status filter with strict selection value "ALIVE"
      await applyImageFilter(page, 'Status', 'ALIVE');

      // 2. Verify filter tag "Status: ALIVE" appears
      const statusTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: 'Status: ALIVE' });
      await expect(statusTag).toBeVisible();

      // 3. Verify the table is not empty (all installed images should be ALIVE)
      await expect(
        page.locator('.ant-table-content .ant-table-row').first(),
      ).toBeVisible();

      // 4. Cleanup: remove the filter tag
      await removeFilterTag(page, 'Status: ALIVE');
      await expect(statusTag).not.toBeVisible();
    });

    // Scenario 2.5 — Filter by type (strict selection)
    test('Admin can filter images by type using strict selection', async ({
      page,
    }) => {
      // 1. Apply Type filter with strict selection value "COMPUTE"
      await applyImageFilter(page, 'Type', 'COMPUTE');

      // 2. Verify filter tag "Type: COMPUTE" appears
      const typeTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: 'Type: COMPUTE' });
      await expect(typeTag).toBeVisible();

      // 3. Verify the table has at least one row
      await expect(
        page.locator('.ant-table-content .ant-table-row').first(),
      ).toBeVisible();

      // 4. Cleanup: remove the filter tag
      await removeFilterTag(page, 'Type: COMPUTE');
      await expect(typeTag).not.toBeVisible();
    });

    // Scenario 2.6 — Filter by registry (free text)
    test('Admin can filter images by registry using a text value', async ({
      page,
    }) => {
      // 1. Apply Registry filter with partial registry hostname "cr" (assumes cr.* registry exists)
      await applyImageFilter(page, 'Registry', 'cr');

      // 2. Verify filter tag "Registry: cr" appears
      const registryTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: 'Registry: cr' });
      await expect(registryTag).toBeVisible();

      // 3. Verify the table content is visible (rows exist for the registry)
      await expect(page.locator('.ant-table-content')).toBeVisible();

      // 4. Cleanup: remove the filter tag
      await removeFilterTag(page, 'Registry: cr');
      await expect(registryTag).not.toBeVisible();
    });

    // Scenario 2.7 — Multiple filters with reset-all button
    test('Admin can apply multiple filters simultaneously and see reset-all button', async ({
      page,
    }) => {
      // 1. Apply Name filter with value "python"
      await applyImageFilter(page, 'Name', 'python');
      const nameTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: 'Name: python' });
      await expect(nameTag).toBeVisible();

      // 2. Apply Architecture filter with strict selection "x86_64"
      await applyImageFilter(page, 'Architecture', 'x86_64');
      const archTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: 'Architecture: x86_64' });
      await expect(archTag).toBeVisible();

      // 3. Verify both tags are visible
      await expect(nameTag).toBeVisible();
      await expect(archTag).toBeVisible();

      // 4. Verify the reset-all button appears (only shown when 2+ active filters)
      const resetAllButton = page
        .locator('button.ant-btn')
        .filter({ has: page.locator('[aria-label="close-circle"]') });
      await expect(resetAllButton).toBeVisible();

      // 5. Cleanup: click reset-all to remove all filters at once
      await resetAllButton.click();
      await page
        .locator('.ant-spin-spinning')
        .waitFor({ state: 'detached', timeout: 10000 })
        .catch(() => {});
      await expect(nameTag).not.toBeVisible();
      await expect(archTag).not.toBeVisible();
    });

    // Scenario 2.8 — Clear single filter tag
    test('Admin can clear a single filter tag by clicking its close button', async ({
      page,
    }) => {
      // 1. Apply Name filter with value "python"
      await applyImageFilter(page, 'Name', 'python');
      const nameTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: 'Name: python' });
      await expect(nameTag).toBeVisible();

      // 2. Apply Architecture filter with strict selection "x86_64"
      await applyImageFilter(page, 'Architecture', 'x86_64');
      const archTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: 'Architecture: x86_64' });
      await expect(archTag).toBeVisible();

      // 3. Verify the reset-all button appears with 2 active filters
      const resetAllButton = page
        .locator('button.ant-btn')
        .filter({ has: page.locator('[aria-label="close-circle"]') });
      await expect(resetAllButton).toBeVisible();

      // 4. Remove only the Architecture tag by clicking its close button
      await removeFilterTag(page, 'Architecture: x86_64');

      // 5. Verify the Architecture tag is gone
      await expect(archTag).not.toBeVisible();

      // 6. Verify the Name tag still remains
      await expect(nameTag).toBeVisible();

      // 7. Verify the reset-all button disappears (only 1 tag remains)
      await expect(resetAllButton).not.toBeVisible();

      // 8. Remove the remaining Name tag
      await removeFilterTag(page, 'Name: python');
      await expect(nameTag).not.toBeVisible();
    });

    // Scenario 2.9 — Clear all with reset-all button
    test('Admin can clear all filters at once using the reset-all button', async ({
      page,
    }) => {
      // 1. Apply Name filter with value "python"
      await applyImageFilter(page, 'Name', 'python');
      const nameTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: 'Name: python' });
      await expect(nameTag).toBeVisible();

      // 2. Apply Architecture filter with strict selection "x86_64"
      await applyImageFilter(page, 'Architecture', 'x86_64');
      const archTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: 'Architecture: x86_64' });
      await expect(archTag).toBeVisible();

      // 3. Verify both filter tags and the reset-all button are visible
      const resetAllButton = page
        .locator('button.ant-btn')
        .filter({ has: page.locator('[aria-label="close-circle"]') });
      await expect(resetAllButton).toBeVisible();

      // 4. Click the reset-all button to clear all filters at once
      await resetAllButton.click();
      await page
        .locator('.ant-spin-spinning')
        .waitFor({ state: 'detached', timeout: 10000 })
        .catch(() => {});

      // 5. Verify no filter tags remain
      await expect(nameTag).not.toBeVisible();
      await expect(archTag).not.toBeVisible();
      await expect(resetAllButton).not.toBeVisible();

      // 6. Verify the table shows results (returns to unfiltered state)
      await expect(
        page.locator('.ant-table-content .ant-table-row').first(),
      ).toBeVisible();
    });

    // Scenario 2.10 — Pagination resets to page 1 when filter applied
    test('Admin sees pagination reset to page 1 when a filter is applied on page 2', async ({
      page,
    }) => {
      // 1. Check total row count to determine if there are enough images for page 2
      const paginationTotal = page.locator('.ant-pagination-total-text');
      const totalText = await paginationTotal.textContent().catch(() => '');
      const totalMatch = totalText?.match(/(\d+)/);
      const total = totalMatch ? parseInt(totalMatch[1], 10) : 0;

      // Skip if not enough images for page 2 (default page size is 20)
      if (total <= 20) {
        test.skip();
        return;
      }

      // 2. Navigate to page 2 by clicking the page 2 button in pagination
      await page
        .locator('.ant-pagination-item')
        .filter({ hasText: '2' })
        .click();
      await page
        .locator('.ant-spin-spinning')
        .waitFor({ state: 'detached', timeout: 10000 })
        .catch(() => {});

      // 3. Verify we are on page 2
      await expect(page.locator('.ant-pagination-item-active')).toHaveText('2');

      // 4. Apply a Name filter with value "python"
      await applyImageFilter(page, 'Name', 'python');
      const nameTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: 'Name: python' });
      await expect(nameTag).toBeVisible();

      // 5. Verify pagination has reset to page 1
      await expect(page.locator('.ant-pagination-item-active')).toHaveText('1');

      // 6. Cleanup: remove the filter tag
      await removeFilterTag(page, 'Name: python');
      await expect(nameTag).not.toBeVisible();
    });

    // Scenario 2.11 — Strict selection rejects freeform input
    test('Admin cannot add a filter for architecture with an invalid freeform value', async ({
      page,
    }) => {
      // 1. Select "Architecture" as the filter property
      const spaceCompact = page.locator('.ant-space-compact').first();
      await spaceCompact.locator('.ant-select').first().click();
      await page
        .getByRole('option', { name: 'Architecture', exact: true })
        .click();

      // 2. Type an invalid value not in the predefined strictSelection options
      const valueInput = page.locator('[aria-label="Filter value search"]');
      await valueInput.fill('arm64');

      // 3. Click the search button to attempt to submit the freeform value
      await page.getByRole('button', { name: 'search' }).click();
      await page
        .locator('.ant-spin-spinning')
        .waitFor({ state: 'detached', timeout: 5000 })
        .catch(() => {});

      // 4. Verify no closable filter tag was created (strict selection rejects freeform input)
      const filterTags = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') });
      await expect(filterTags).toHaveCount(0);

      // 5. Verify the table remains in its unfiltered state (rows visible)
      await expect(
        page.locator('.ant-table-content .ant-table-row').first(),
      ).toBeVisible();
    });

    // Scenario 2.12 — Empty results when filtering non-existent name
    test('Admin sees empty state when filtering by a non-existent image name', async ({
      page,
    }) => {
      // 1. Apply a Name filter with a value that matches no images
      await applyImageFilter(page, 'Name', 'zzz-nonexistent-image-000');

      // 2. Verify a closable filter tag with the entered text is visible
      const noResultsTag = page
        .locator('.ant-tag')
        .filter({ has: page.locator('[aria-label="Close"]') })
        .filter({ hasText: 'Name: zzz-nonexistent-image-000' });
      await expect(noResultsTag).toBeVisible();

      // 3. Verify the table shows an empty state (Ant Design no-data placeholder)
      await expect(page.locator('.ant-table-placeholder')).toBeVisible();

      // 4. Cleanup: remove the filter tag
      await removeFilterTag(page, 'Name: zzz-nonexistent-image-000');
      await expect(noResultsTag).not.toBeVisible();
    });
  },
);
