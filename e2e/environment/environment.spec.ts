// spec: Image list and environment management E2E tests
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { findColumnIndex } from '../utils/test-util-antd';
import { expect, test, Page, Locator } from '@playwright/test';

test.describe(
  'environment ',
  { tag: ['@regression', '@environment', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await page.getByRole('link', { name: 'Admin Settings' }).click();
      await page.getByRole('link', { name: 'Environments' }).click();
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
      // FR-3331 replaced the resource-limit action's settings-cog icon with a
      // lucide SquarePenIcon (aria-hidden, no accessible name), so it can no
      // longer be located via getByRole('button', { name: 'setting' }). It is
      // the first of the two Control-column buttons (the second is "Manage
      // Apps", whose antd `appstore` icon still carries its accessible name).
      await firstRow
        .locator('.ant-table-cell')
        .nth(controlColumnIndex)
        .locator('button')
        .first()
        .click();
      // get resource limit from control modal
      const resourceLimitControlModal = page.getByRole('dialog', {
        // FR-3339 renamed the modal from "Modify ..." to "Edit ..." as part of
        // unifying edit terminology across the app.
        name: /Edit Minimum Image Resource Limit/i,
      });

      await expect(resourceLimitControlModal).toBeVisible();

      // ManageImageResourceLimitModal.tsx renders each field via
      // `BAIFormItem` (`[data-bai-form-item]`) — the value control itself
      // (`BAIDynamicUnitInputNumber` for "mem", still wrapping antd
      // `InputNumber`/`Select`/`Typography.Text`) is unmigrated, so
      // `.ant-input-number` / `.ant-select` / `.ant-typography` below stay.
      const cpuFormItem = resourceLimitControlModal.locator(
        '[data-bai-form-item]:has-text("CPU")',
      );
      const cpuFormItemInput = cpuFormItem.locator('input');
      const cpuValue = await cpuFormItemInput.getAttribute('value');

      const memoryFormItem = resourceLimitControlModal.locator(
        '[data-bai-form-item]:has-text("Memory")',
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
      // click the modal's submit button (renamed "OK" -> "Save" by FR-3339)
      await resourceLimitControlModal
        .getByRole('button', { name: 'Save' })
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
        .locator('button')
        .first()
        .click();
      // In Ant Design 6, use role-based selector for dialog
      const modifiedResourceLimitControlModal = page.getByRole('dialog', {
        // FR-3339 renamed the modal from "Modify ..." to "Edit ..." as part of
        // unifying edit terminology across the app.
        name: /Edit Minimum Image Resource Limit/i,
      });
      await expect(modifiedResourceLimitControlModal).toBeVisible();
      const modifiedCpuFormItemInput =
        modifiedResourceLimitControlModal.locator(
          '[data-bai-form-item]:has-text("CPU") input',
        );
      const modifiedMemoryFormItemInput =
        modifiedResourceLimitControlModal.locator(
          '[data-bai-form-item]:has-text("Memory") .ant-input-number input',
        );
      await expect(modifiedCpuFormItemInput).toHaveValue(CPU_CORE);
      await expect(modifiedMemoryFormItemInput).toHaveValue(MEMORY_SIZE);
      // The unit selector (`BAIDynamicUnitInputNumber`) still wraps antd
      // `Select`/`Typography.Text` — only the outer `BAIFormItem` wrapper
      // migrated.
      await expect(
        modifiedResourceLimitControlModal
          .locator('[data-bai-form-item]:has-text("Memory")')
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
        '[data-bai-form-item]:has-text("Memory") .ant-select',
      );
      await memorySizeAddon.click();
      await page
        .locator(`.ant-select-item-option-content:has-text("${memorySize}")`)
        .click();
      // click the modal's submit button (renamed "OK" -> "Save" by FR-3339)
      await modifiedResourceLimitControlModal
        .getByRole('button', { name: 'Save' })
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
      // Gate on the always-rendered Add button rather than the first app
      // form-item: an image whose `ai.backend.service-ports` label is absent
      // legitimately opens the modal with zero apps, and the baseline count
      // must stay valid in that case.
      await expect(
        modal.getByRole('button', { name: 'Add', exact: true }),
      ).toBeVisible();
      // ManageAppsModal.tsx renders one un-`noStyle` outer `BAIFormItem` per
      // app row (`[data-bai-form-item]`); the 3 nested per-field
      // BAIFormItems inside it are all `noStyle` and render no DOM of their
      // own, so this still counts exactly one element per row.
      const numberOfAppsBeforeAdd = await modal
        .locator('[data-bai-form-item]')
        .count();
      await modal.getByRole('button', { name: 'Add', exact: true }).click();
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

      // Verify app is added. Reopening the modal picks up whatever row
      // reference the list currently holds; a click made before the
      // post-submit refetch resolves captures the *pre-add* row and (since
      // the modal is `destroyOnHidden`) freezes on stale data rather than
      // updating in place. Poll the full reopen+read+close cycle — not just
      // an assertion on an already-open modal — until the refetch lands.
      const openManageAppsModalAndCountApps = async () => {
        await firstRow
          .locator('.ant-table-cell')
          .nth(controlColumnIndex)
          .getByRole('button', { name: 'appstore' })
          .click();
        const dialog = page.getByRole('dialog', { name: /Manage Apps/i });
        await expect(dialog).toBeVisible();
        // `[data-bai-form-item]`, not main's `.ant-form-item`: this helper
        // arrives with the main merge, and that class does not exist on this
        // branch (antd is gone — it is not a dependency of this workspace at all), so the
        // locator would match nothing and this poll would compare a constant 0.
        const count = await dialog.locator('[data-bai-form-item]').count();
        await dialog.getByRole('button', { name: 'Cancel' }).click();
        await expect(dialog).toBeHidden();
        return count;
      };
      await expect
        .poll(openManageAppsModalAndCountApps, {
          message: 'Waiting for the added app row to appear after refetch',
          timeout: 20000,
        })
        .toBe(numberOfAppsBeforeAdd + 1);

      // Reopen once more now that the refetched data is confirmed fresh, to
      // assert on the added row's field values and perform cleanup.
      await firstRow
        .locator('.ant-table-cell')
        .nth(controlColumnIndex)
        .getByRole('button', { name: 'appstore' })
        .click();
      // In Ant Design 6, use role-based selector for dialog
      const modalAfterAdd = page.getByRole('dialog', { name: /Manage Apps/i });
      await expect(modalAfterAdd).toBeVisible();
      // Retry the count assertion: the freshly-reopened modal renders its
      // app form-items asynchronously, so a one-shot `.count()` can read the
      // old total before the added row mounts (flaky off by one).
      //
      // The selector stays `[data-bai-form-item]`: main's `.ant-form-item`
      // class does not exist on this branch — antd is gone and is not a
      // dependency of this workspace at all — so that locator would match
      // nothing and the assertion would fail on an empty set.
      await expect(modalAfterAdd.locator('[data-bai-form-item]')).toHaveCount(
        numberOfAppsBeforeAdd + 1,
      );
      const numberOfApps = numberOfAppsBeforeAdd + 1;
      // Verify the last row has the added app info
      const lastRow = modalAfterAdd.locator('[data-bai-form-item]').last();
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
// Helper functions for BAIPropertyFilter (Astryx PowerSearch) interaction
//
// to-astryx ticket 28 rebuilt BAIPropertyFilter on Astryx `PowerSearch`
// (packages/backend.ai-ui/src/components/BAIPropertyFilter.tsx). The
// interaction model changed from antd's two-input bar (property Select +
// value Input.Search + submit button) to a single typeahead that opens an
// edit popover: type/click the field -> Field/Operator/Value popover ->
// Apply. Anchors below are cited against the Astryx source
// (react/node_modules/@astryxdesign/core/src/PowerSearch/…) and
// locales/en.json, since PowerSearch ships its own (currently English-only)
// InternationalizationProvider catalog (ticket 28 notes, P13 follow-up).
// ---------------------------------------------------------------------------

/**
 * Committed-filter token labels follow `"<Field>: <operator> <value>"`
 * (`PowerSearch.tsx` `tokenizerValue` -> `displayLabel`). `defaultOperator`
 * per field comes straight from `ImageList.tsx`'s `filterProperties` (`==`
 * for the strict-selection fields, the BUI default `ilike` -> "contains" for
 * free-text ones); the operator word itself is
 * `comp:BAIPropertyFilter.operator.*` (packages/backend.ai-ui/src/locale/en.json).
 */
function imageFilterTokenLabel(
  propertyLabel: string,
  operatorWord: 'contains' | 'is',
  value: string,
): string {
  return `${propertyLabel}: ${operatorWord} ${value}`;
}

/**
 * Apply a filter using BAIPropertyFilter (PowerSearch) on the Image List
 * page: open the typeahead, pick the field, then fill/pick the Value in the
 * edit popover it opens (`PowerSearch.tsx` `handleTokenizerChange` ->
 * `setPopoverState({type: 'adding', ...})` when the picked field has no
 * pre-filled value). Free-text fields (`StringEditor`,
 * `PowerSearchValueEditor.tsx`) commit on the popover's "Apply" button;
 * strict-selection fields (`EnumEditor`, same file) render the value as a
 * `Selector` whose `onChange` passes `shouldSave: true`
 * (`PowerSearchEditPopover.tsx` `handleValueChange`), so picking an option
 * auto-commits and there is no separate Apply click.
 */
async function applyImageFilter(
  page: Page,
  propertyLabel: string,
  value: string,
) {
  // Scroll the search bar to the center of the viewport so it is not
  // obscured by the sticky header, then click to open the typeahead.
  // `label={t('comp:BAIPropertyFilter.SearchLabel')}` = "Search filters"
  // (packages/backend.ai-ui/src/locale/en.json) names the combobox
  // (`role="combobox"`, `BaseTypeahead.tsx`).
  const searchBar = page.getByRole('combobox', { name: 'Search filters' });
  await searchBar.evaluate((el) =>
    el.scrollIntoView({ block: 'center', inline: 'nearest' }),
  );
  // Use force:true because the sticky header (data-testid="label-selector-project")
  // can intercept pointer events even after scrolling into view.
  await searchBar.click({ force: true });
  await page.getByRole('option', { name: propertyLabel, exact: true }).click();

  // The value editor's accessible name is "Value"
  // (`t('@astryx.powersearch.valueEditor.value')`) regardless of which
  // control renders it; the two field kinds this page uses render different
  // roles (`TextInput` -> textbox, `Selector` -> combobox), so branch on
  // whichever appears.
  const valueTextbox = page.getByRole('textbox', { name: 'Value' });
  if (await valueTextbox.isVisible({ timeout: 3000 }).catch(() => false)) {
    await valueTextbox.fill(value);
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
  } else {
    await page.getByRole('combobox', { name: 'Value' }).click();
    await page.getByRole('option', { name: value, exact: true }).click();
  }

  // Wait for table to reflect updated results
  await page
    .locator('.ant-spin-spinning')
    .waitFor({ state: 'detached', timeout: 10000 })
    .catch(() => {});
}

/**
 * Remove a committed filter token by its full display label
 * (`"<Field>: <operator> <value>"`, see `imageFilterTokenLabel`). Each
 * token's own remove control carries `aria-label="Remove {label}"`
 * (`t('@astryx.token.remove', {label})`, `Token.tsx` /
 * locales/en.json) — used directly as both the "is this filter still
 * present" probe and the click target, since the button and the token it
 * belongs to appear/disappear together.
 */
async function removeFilterTag(page: Page, tokenLabel: string) {
  const removeButton = page.getByRole('button', {
    name: `Remove ${tokenLabel}`,
    exact: true,
  });

  // Under concurrent E2E load against the shared nightly server, the close
  // click can occasionally land while the filter row is mid re-render (e.g.
  // a table refresh from a just-applied filter overlaps with the removal),
  // so the click is silently swallowed. Retry the whole click-and-check as
  // a unit — the recommended Playwright pattern for this kind of transient
  // UI flake — rather than asserting on a single attempt.
  await expect(async () => {
    await removeButton.click();
    await expect(removeButton).not.toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 20000 });

  // Wait for any loading spinner to disappear after filter removal
  await page
    .locator('.ant-spin-spinning')
    .waitFor({ state: 'detached', timeout: 10000 })
    .catch(() => {});
}

/**
 * Click PowerSearch's built-in "Clear all" button
 * (`t('@astryx.tokenizer.clearAll')`, `Tokenizer.tsx` / locales/en.json —
 * replaces the antd-era bespoke reset-all button, ticket 28 PILOT-DECISION
 * #6) and wait for it to disappear (it renders only while at least one
 * filter is active) and the loading spinner to detach, retrying the click if
 * it is swallowed by a concurrent re-render (see `removeFilterTag`).
 */
async function resetAllFilters(page: Page, resetAllButton: Locator) {
  await expect(async () => {
    await resetAllButton.click();
    await expect(resetAllButton).not.toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 20000 });

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
      await page.getByRole('link', { name: 'Admin Settings' }).click();
      await page.getByRole('link', { name: 'Environments' }).click();
      await expect(page).toHaveURL(/\/environment/);
      // Wait for the BAIPropertyFilter (PowerSearch) and table to be ready
      await expect(
        page.getByRole('combobox', { name: 'Search filters' }),
      ).toBeVisible();
      await expect(page.getByRole('table')).toBeVisible();
    });

    // Scenario 2.1 — BAIPropertyFilter UI rendered
    test('Admin can see the BAIPropertyFilter on the Images tab', async ({
      page,
    }) => {
      // 1. Verify the PowerSearch search bar is present, named "Search filters"
      // (`label={t('comp:BAIPropertyFilter.SearchLabel')}`,
      // packages/backend.ai-ui/src/locale/en.json).
      await expect(
        page.getByRole('combobox', { name: 'Search filters' }),
      ).toBeVisible();
    });

    // Scenario 2.2 — Filter by name (free text)
    test('Admin can filter images by name using a text value', async ({
      page,
    }) => {
      // 1. Apply the Name filter with value "python" (assumes at least one python image is installed)
      await applyImageFilter(page, 'Name', 'python');

      // 2. Verify the committed token "Name: contains python" appears
      const nameLabel = imageFilterTokenLabel('Name', 'contains', 'python');
      const nameTag = page.getByRole('button', {
        name: `Remove ${nameLabel}`,
      });
      await expect(nameTag).toBeVisible();

      // 3. Verify the table is still visible (filtered results shown)
      await expect(page.locator('.ant-table-content')).toBeVisible();

      // 4. Cleanup: remove the filter token
      await removeFilterTag(page, nameLabel);
      await expect(nameTag).not.toBeVisible({ timeout: 10000 });
    });

    // Scenario 2.3 — Filter by architecture (strict selection)
    test('Admin can filter images by architecture using strict selection', async ({
      page,
    }) => {
      // 1. Apply Architecture filter with strict selection value "x86_64"
      await applyImageFilter(page, 'Architecture', 'x86_64');

      // 2. Verify the committed token "Architecture: is x86_64" appears
      // (`defaultOperator: '=='` in ImageList.tsx's filterProperties -> "is")
      const archLabel = imageFilterTokenLabel('Architecture', 'is', 'x86_64');
      const archTag = page.getByRole('button', {
        name: `Remove ${archLabel}`,
      });
      await expect(archTag).toBeVisible();

      // 3. Verify the table has at least one row with images
      await expect(
        page.locator('.ant-table-content .ant-table-row').first(),
      ).toBeVisible();

      // 4. Cleanup: remove the filter token
      await removeFilterTag(page, archLabel);
      await expect(archTag).not.toBeVisible({ timeout: 10000 });
    });

    // Scenario 2.4 — Filter by status (strict selection)
    test('Admin can filter images by status using strict selection', async ({
      page,
    }) => {
      // 1. Apply Status filter with strict selection value "ALIVE"
      await applyImageFilter(page, 'Status', 'ALIVE');

      // 2. Verify the committed token "Status: is ALIVE" appears
      const statusLabel = imageFilterTokenLabel('Status', 'is', 'ALIVE');
      const statusTag = page.getByRole('button', {
        name: `Remove ${statusLabel}`,
      });
      await expect(statusTag).toBeVisible();

      // 3. Verify the table is not empty (all installed images should be ALIVE)
      await expect(
        page.locator('.ant-table-content .ant-table-row').first(),
      ).toBeVisible();

      // 4. Cleanup: remove the filter token
      await removeFilterTag(page, statusLabel);
      await expect(statusTag).not.toBeVisible({ timeout: 10000 });
    });

    // Scenario 2.5 — Filter by type (strict selection)
    test('Admin can filter images by type using strict selection', async ({
      page,
    }) => {
      // 1. Apply Type filter with strict selection value "COMPUTE"
      await applyImageFilter(page, 'Type', 'COMPUTE');

      // 2. Verify the committed token "Type: is COMPUTE" appears
      const typeLabel = imageFilterTokenLabel('Type', 'is', 'COMPUTE');
      const typeTag = page.getByRole('button', {
        name: `Remove ${typeLabel}`,
      });
      await expect(typeTag).toBeVisible();

      // 3. Verify the table has at least one row
      await expect(
        page.locator('.ant-table-content .ant-table-row').first(),
      ).toBeVisible();

      // 4. Cleanup: remove the filter token
      await removeFilterTag(page, typeLabel);
      await expect(typeTag).not.toBeVisible({ timeout: 10000 });
    });

    // Scenario 2.6 — Filter by registry (free text)
    test('Admin can filter images by registry using a text value', async ({
      page,
    }) => {
      // 1. Apply Registry filter with partial registry hostname "cr" (assumes cr.* registry exists)
      await applyImageFilter(page, 'Registry', 'cr');

      // 2. Verify the committed token "Registry: contains cr" appears
      const registryLabel = imageFilterTokenLabel('Registry', 'contains', 'cr');
      const registryTag = page.getByRole('button', {
        name: `Remove ${registryLabel}`,
      });
      await expect(registryTag).toBeVisible();

      // 3. Verify the table content is visible (rows exist for the registry)
      await expect(page.locator('.ant-table-content')).toBeVisible();

      // 4. Cleanup: remove the filter token
      await removeFilterTag(page, registryLabel);
      await expect(registryTag).not.toBeVisible({ timeout: 10000 });
    });

    // Scenario 2.7 — Multiple filters with the "Clear all" button
    test('Admin can apply multiple filters simultaneously and see the clear-all button', async ({
      page,
    }) => {
      // 1. Apply Name filter with value "python"
      const nameLabel = imageFilterTokenLabel('Name', 'contains', 'python');
      await applyImageFilter(page, 'Name', 'python');
      const nameTag = page.getByRole('button', {
        name: `Remove ${nameLabel}`,
      });
      await expect(nameTag).toBeVisible();

      // 2. Apply Architecture filter with strict selection "x86_64"
      const archLabel = imageFilterTokenLabel('Architecture', 'is', 'x86_64');
      await applyImageFilter(page, 'Architecture', 'x86_64');
      const archTag = page.getByRole('button', {
        name: `Remove ${archLabel}`,
      });
      await expect(archTag).toBeVisible();

      // 3. Verify both tokens are visible
      await expect(nameTag).toBeVisible();
      await expect(archTag).toBeVisible();

      // 4. Verify the "Clear all" button appears. PowerSearch's built-in
      // `hasClear` shows it whenever at least one filter is active (ticket 28
      // PILOT-DECISION #6 — antd's bespoke reset-all button, which only
      // appeared with 2+ filters, is gone).
      const resetAllButton = page.getByRole('button', { name: 'Clear all' });
      await expect(resetAllButton).toBeVisible();

      // 5. Cleanup: click "Clear all" to remove all filters at once
      await resetAllFilters(page, resetAllButton);
      await expect(nameTag).not.toBeVisible({ timeout: 10000 });
      await expect(archTag).not.toBeVisible({ timeout: 10000 });
    });

    // Scenario 2.8 — Clear single filter token
    test('Admin can clear a single filter token by clicking its remove button', async ({
      page,
    }) => {
      // 1. Apply Name filter with value "python"
      const nameLabel = imageFilterTokenLabel('Name', 'contains', 'python');
      await applyImageFilter(page, 'Name', 'python');
      const nameTag = page.getByRole('button', {
        name: `Remove ${nameLabel}`,
      });
      await expect(nameTag).toBeVisible();

      // 2. Apply Architecture filter with strict selection "x86_64"
      const archLabel = imageFilterTokenLabel('Architecture', 'is', 'x86_64');
      await applyImageFilter(page, 'Architecture', 'x86_64');
      const archTag = page.getByRole('button', {
        name: `Remove ${archLabel}`,
      });
      await expect(archTag).toBeVisible();

      // 3. Verify the "Clear all" button appears with 2 active filters
      const resetAllButton = page.getByRole('button', { name: 'Clear all' });
      await expect(resetAllButton).toBeVisible();

      // 4. Remove only the Architecture token
      await removeFilterTag(page, archLabel);

      // 5. Verify the Architecture token is gone
      await expect(archTag).not.toBeVisible({ timeout: 10000 });

      // 6. Verify the Name token still remains
      await expect(nameTag).toBeVisible();

      // 7. The "Clear all" button stays visible with 1 filter remaining —
      // unlike antd's bespoke reset-all button (which only appeared at 2+),
      // PowerSearch's `hasClear` gates on `value.length > 0`, not a count
      // threshold (`Tokenizer.tsx`).
      await expect(resetAllButton).toBeVisible();

      // 8. Remove the remaining Name token
      await removeFilterTag(page, nameLabel);
      await expect(nameTag).not.toBeVisible({ timeout: 10000 });
      // With zero filters left, PowerSearch hides "Clear all" entirely
      // (`Tokenizer.tsx`: `hasClear && value.length > 0`).
      await expect(resetAllButton).not.toBeVisible({ timeout: 10000 });
    });

    // Scenario 2.9 — Clear all with the "Clear all" button
    test('Admin can clear all filters at once using the clear-all button', async ({
      page,
    }) => {
      // 1. Apply Name filter with value "python"
      const nameLabel = imageFilterTokenLabel('Name', 'contains', 'python');
      await applyImageFilter(page, 'Name', 'python');
      const nameTag = page.getByRole('button', {
        name: `Remove ${nameLabel}`,
      });
      await expect(nameTag).toBeVisible();

      // 2. Apply Architecture filter with strict selection "x86_64"
      const archLabel = imageFilterTokenLabel('Architecture', 'is', 'x86_64');
      await applyImageFilter(page, 'Architecture', 'x86_64');
      const archTag = page.getByRole('button', {
        name: `Remove ${archLabel}`,
      });
      await expect(archTag).toBeVisible();

      // 3. Verify both filter tokens and the "Clear all" button are visible
      const resetAllButton = page.getByRole('button', { name: 'Clear all' });
      await expect(resetAllButton).toBeVisible();

      // 4. Click "Clear all" to clear all filters at once
      await resetAllFilters(page, resetAllButton);

      // 5. Verify no filter tokens remain
      await expect(nameTag).not.toBeVisible({ timeout: 10000 });
      await expect(archTag).not.toBeVisible({ timeout: 10000 });
      await expect(resetAllButton).not.toBeVisible({ timeout: 10000 });

      // 6. Verify the table shows results (returns to unfiltered state)
      await expect(
        page.locator('.ant-table-content .ant-table-row').first(),
      ).toBeVisible();
    });

    // Scenario 2.10 — Pagination resets to page 1 when filter applied
    test(
      'Admin sees pagination reset to page 1 when a filter is applied on page 2',
      { tag: ['@requires-seeded-data'] },
      async ({ page }) => {
        // 1. Check total row count to determine if there are enough images for page 2
        // Use the visible standalone pagination (ant-pagination-end); the built-in
        // ant-table-pagination is hidden on this page.
        const paginationTotal = page
          .locator('.ant-pagination-end')
          .locator('.ant-pagination-total-text');
        // Ensure pagination total text is present and readable; fail if it is not.
        await expect(paginationTotal).toBeVisible();
        const totalText = await paginationTotal.textContent();
        if (!totalText) {
          throw new Error('Pagination total text is empty or null');
        }
        const totalMatch = totalText.match(/of\s+(\d+)/);
        if (!totalMatch) {
          throw new Error(
            `Unexpected pagination total text format: "${totalText}"`,
          );
        }
        const total = parseInt(totalMatch[1], 10);

        // Environment data gate (FR-3114): this scenario needs a second page of
        // results, i.e. more than 20 images registered on the target cluster
        // (default page size is 20). Seeding more images is an infra task —
        // until then the test skips with an auditable reason.
        test.skip(
          total <= 20,
          `Pagination scenario requires more than 20 images in the image list (found ${total}; default page size 20, @requires-seeded-data)`,
        );

        // Use the standalone visible pagination (ant-pagination-end) which is the
        // actual pagination rendered for the image list. The ant-table-pagination
        // built into the table is hidden (display:none) on this page.
        const visiblePagination = page.locator('.ant-pagination-end');

        // 2. Navigate to page 2 by clicking the page 2 button in pagination
        await visiblePagination
          .locator('.ant-pagination-item')
          .filter({ hasText: '2' })
          .click();
        await page
          .locator('.ant-spin-spinning')
          .waitFor({ state: 'detached', timeout: 10000 })
          .catch(() => {});

        // 3. Verify we are on page 2
        await expect(
          visiblePagination.locator('.ant-pagination-item-active'),
        ).toHaveText('2');

        // 4. Apply a Name filter with value "python"
        const nameLabel = imageFilterTokenLabel('Name', 'contains', 'python');
        await applyImageFilter(page, 'Name', 'python');
        const nameTag = page.getByRole('button', {
          name: `Remove ${nameLabel}`,
        });
        await expect(nameTag).toBeVisible();

        // 5. Verify pagination has reset to page 1
        await expect(
          visiblePagination.locator('.ant-pagination-item-active'),
        ).toHaveText('1');

        // 6. Cleanup: remove the filter token
        await removeFilterTag(page, nameLabel);
        await expect(nameTag).not.toBeVisible();
      },
    );

    // Scenario 2.11 — Strict selection has no freeform value entry point
    //
    // antd's AutoComplete accepted arbitrary typed text and rejected it at
    // submit time (`rule.validate`); PowerSearch's strict-selection value
    // editor is a closed `Selector` (`EnumEditor`,
    // `PowerSearchValueEditor.tsx`) with no free-text control at all, so
    // there is no longer a submit-time rejection to exercise (ticket 28
    // PILOT-DECISION #1: `rule.validate` is advisory-only now; the real
    // protection here is structural — a value that isn't a registered
    // option is not selectable in the first place).
    test('Admin cannot select an architecture value that is not a registered option', async ({
      page,
    }) => {
      // 1. Select "Architecture" as the filter field — opens the edit popover.
      const searchBar = page.getByRole('combobox', { name: 'Search filters' });
      await searchBar.evaluate((el) =>
        el.scrollIntoView({ block: 'center', inline: 'nearest' }),
      );
      await searchBar.click({ force: true });
      await page
        .getByRole('option', { name: 'Architecture', exact: true })
        .click();

      // 2. The value editor is a closed Selector, not a free-text input.
      await expect(
        page.getByRole('textbox', { name: 'Value' }),
      ).not.toBeVisible();
      const valueSelector = page.getByRole('combobox', { name: 'Value' });
      await expect(valueSelector).toBeVisible();

      // 3. Typing an architecture that is not among the currently-registered
      // options (a real but unregistered-in-this-cluster value) surfaces no
      // matching option to select.
      await valueSelector.click();
      await valueSelector.fill('arm64-unregistered-e2e-probe');
      await expect(
        page.getByRole('option', { name: 'arm64-unregistered-e2e-probe' }),
      ).toHaveCount(0);

      // 4. Close the popover without committing (Cancel — no value was ever
      // selectable, so there is nothing to Apply).
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();

      // 5. Verify no filter token was created and the table remains
      // unfiltered.
      await expect(page.getByRole('button', { name: /^Remove / })).toHaveCount(
        0,
      );
      await expect(
        page.locator('.ant-table-content .ant-table-row').first(),
      ).toBeVisible();
    });

    // Scenario 2.12 — Empty results when filtering non-existent name
    test('Admin sees empty state when filtering by a non-existent image name', async ({
      page,
    }) => {
      // 1. Apply a Name filter with a value that matches no images
      const noResultsLabel = imageFilterTokenLabel(
        'Name',
        'contains',
        'zzz-nonexistent-image-000',
      );
      await applyImageFilter(page, 'Name', 'zzz-nonexistent-image-000');

      // 2. Verify the committed filter token is visible
      const noResultsTag = page.getByRole('button', {
        name: `Remove ${noResultsLabel}`,
      });
      await expect(noResultsTag).toBeVisible();

      // 3. Verify the table shows an empty state (Ant Design no-data placeholder)
      await expect(page.locator('.ant-table-placeholder')).toBeVisible();

      // 4. Cleanup: remove the filter token
      await removeFilterTag(page, noResultsLabel);
      await expect(noResultsTag).not.toBeVisible();
    });
  },
);
