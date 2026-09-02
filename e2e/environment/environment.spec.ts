// spec: Image list and environment management E2E tests
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { expect, test, Page, Locator } from '@playwright/test';

/**
 * The image list is a `BAITable`, i.e. a real `<table>` with a `<thead>` /
 * `<tbody>` pair (`packages/backend.ai-ui/src/components/Table/BAITable.tsx`
 * renders Astryx `Table`). `getByRole('table')` is the whole grid and
 * `tbody tr` its data rows — there is no antd measure row to exclude.
 */
function imageListTableOf(page: Page) {
  return page.getByRole('table');
}

function imageListRowsOf(page: Page) {
  return imageListTableOf(page).locator('tbody tr');
}

/**
 * Wait until the image list has actually rendered rows. The window is
 * deliberately much wider than Playwright's 5s expect default: the initial
 * `image_nodes` query runs against a shared cluster and the whole page is
 * behind a Suspense boundary, so under concurrent load neither the `<table>`
 * nor its first row is up within 5s.
 */
async function waitForImageListReady(page: Page) {
  await expect(imageListTableOf(page)).toBeVisible({ timeout: 60000 });
  await expect(imageListRowsOf(page).first()).toBeVisible({ timeout: 60000 });
}

/**
 * `BAITable` has no spinner: while `loading` is true it dims its own wrapper
 * and marks it `aria-busy` (`BAITable.tsx`, the `bai-table-astryx-dim-layer`
 * div — a class this repo owns, not a framework-internal one).
 */
async function waitForImageListSettled(page: Page) {
  await expect(
    page.locator('.bai-table-astryx-dim-layer[aria-busy="true"]'),
  ).toHaveCount(0, { timeout: 15000 });
}

/**
 * `BAITable`'s pagination bar: an Astryx `Pagination` in a
 * `navigation` landmark named "Pagination"
 * (`label={String(t('comp:BAITable.Pagination'))}`, `BAITable.tsx`), whose
 * page buttons are named "Go to page N" and whose current page carries
 * `aria-current="page"` (`@astryxdesign/core/src/Pagination/Pagination.tsx`).
 */
function imageListPaginationOf(page: Page) {
  return page.getByRole('navigation', { name: 'Pagination' });
}

/**
 * Set a `BAIDynamicUnitInputNumber`'s "<number><unit>" pair. The unit goes
 * first on purpose: the numeric field's `min` is expressed in whatever unit is
 * currently selected, and `handleBlur` clamps an under-min entry UP rather
 * than rejecting it (`packages/backend.ai-ui/src/components/BAIDynamicUnitInputNumber.tsx`),
 * so typing "1" while the field is still in MiB silently becomes 1024.
 */
async function setMemorySize(
  page: Page,
  numberInput: Locator,
  unitSelector: Locator,
  size: { value: string; unit: string },
) {
  await unitSelector.click();
  await page.getByRole('option', { name: size.unit, exact: true }).click();
  await expect(unitSelector).toHaveText(size.unit);
  await numberInput.fill(size.value);
  await numberInput.blur();
  await expect(numberInput).toHaveValue(size.value);
  await expect(unitSelector).toHaveText(size.unit);
}

test.describe(
  'environment ',
  { tag: ['@regression', '@environment', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await page.getByRole('link', { name: 'Admin Settings' }).click();
      await page.getByRole('link', { name: 'Environments' }).click();
      await expect(page).toHaveURL(/\/environment/);
      await waitForImageListReady(page);
    });
    test('Rendering Image List', async ({ page }) => {
      await expect(imageListTableOf(page)).toBeVisible();
    });

    // skip this test because there is no way to uninstall the image in WebUI.
    // NOTE: the body below was de-antd'ed against the component source
    // (`ImageList.tsx` / `ImageInstallModal.tsx`) but has never been executed —
    // the test has been permanently skipped since it was written, so treat the
    // locators as unverified.
    test.skip('user can install image', async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'environment');
      await waitForImageListReady(page);

      // Find an uninstalled image and select it. `ImageList.tsx`'s `installed`
      // column renders an "Installed" / "Installing" Badge only when the image
      // is present on an agent, so an uninstalled image is a row carrying
      // neither label.
      const uninstalledImage = imageListRowsOf(page)
        .filter({ hasNotText: 'Installed' })
        .filter({ hasNotText: 'Installing' })
        .first();
      // If all images are installed, skip the test
      const count = await uninstalledImage.count();
      if (count === 0) {
        test.skip();
      }
      await uninstalledImage.getByRole('checkbox').check();

      // Install image. The list header button is `label={t('environment.InstallImage')}`
      // = "Install Image"; the modal's confirm button is plain "Install".
      await page.getByRole('button', { name: 'Install Image' }).click();
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Install', exact: true })
        .click();
      await expect(
        page.getByText('It takes time so have a cup of coffee!'),
      ).toBeVisible();

      // Verify installing status
      await expect(
        imageListRowsOf(page).filter({ hasText: 'Installing' }).first(),
      ).toBeVisible();
    });

    test('user can modify image resource limit', async ({ page }) => {
      const CPU_CORE = '5';
      const MEMORY_SIZE = '1';

      // Click resource limit button. `ImageList.tsx`'s Control column renders
      // two `IconButton`s whose lucide glyphs are aria-hidden but whose
      // `label` props are the modal titles they open, so both are reachable
      // by accessible name with no column-index arithmetic.
      const firstRow = imageListRowsOf(page).first();
      // Saving the modal bumps the list's fetchKey, so the row this clicks is
      // re-rendered underneath it; settle the table first, then retry the
      // open until the dialog is actually on screen (a click that lands on a
      // row mid-refetch is simply dropped).
      const openResourceLimitModal = async () => {
        await waitForImageListSettled(page);
        await expect(async () => {
          await firstRow
            .getByRole('button', { name: 'Edit Minimum Image Resource Limit' })
            .click();
          await expect(
            page.getByRole('dialog', {
              name: /Edit Minimum Image Resource Limit/i,
            }),
          ).toBeVisible({ timeout: 5000 });
        }).toPass({ timeout: 30000 });
      };
      await openResourceLimitModal();
      // get resource limit from control modal
      const resourceLimitControlModal = page.getByRole('dialog', {
        // FR-3339 renamed the modal from "Modify ..." to "Edit ..." as part of
        // unifying edit terminology across the app.
        name: /Edit Minimum Image Resource Limit/i,
      });

      await expect(resourceLimitControlModal).toBeVisible();

      // `ManageImageResourceLimitModal.tsx` renders each slot as a
      // `BAIFormItem` (`[data-bai-form-item]`). The value controls are Astryx
      // now: `AstryxFormNumberInput` / `BAIDynamicUnitInputNumber` both end in
      // an Astryx `NumberInput`, which is `role="spinbutton"`
      // (`@astryxdesign/core/src/NumberInput/NumberInput.tsx`), and the memory
      // unit is an Astryx `Selector` labelled "Unit"
      // (`BAIDynamicUnitInputNumber.tsx`).
      const cpuFormItem = resourceLimitControlModal.locator(
        '[data-bai-form-item]:has-text("CPU")',
      );
      const cpuFormItemInput = cpuFormItem.getByRole('spinbutton');
      const cpuValue = await cpuFormItemInput.inputValue();

      const memoryFormItem = resourceLimitControlModal.locator(
        '[data-bai-form-item]:has-text("Memory")',
      );
      const memoryFormItemInput = memoryFormItem.getByRole('spinbutton');
      const memoryValue = await memoryFormItemInput.inputValue();
      const memoryUnitSelector = memoryFormItem.getByRole('combobox', {
        name: 'Unit',
      });
      const memorySize = (await memoryUnitSelector.textContent())?.trim() ?? '';
      // modify resource limit
      await cpuFormItemInput.fill(CPU_CORE);
      await expect(cpuFormItemInput).toHaveValue(CPU_CORE);
      // `BAIDynamicUnitInputNumber` splits "<number><unit>" across a numeric
      // field and a unit Selector; the antd-era `fill('1g')` relied on the
      // text-backed antd InputNumber re-parsing the unit letter, which the
      // Astryx numeric field does not do. Set the two halves separately —
      // UNIT FIRST, because the field's `min` is expressed in the CURRENT unit
      // (the modal's `min='1g'` becomes 1024 while the field is in MiB) and
      // `handleBlur` clamps an under-min entry up instead of keeping it.
      await setMemorySize(page, memoryFormItemInput, memoryUnitSelector, {
        value: MEMORY_SIZE,
        unit: 'GiB',
      });
      // click the modal's submit button (renamed "OK" -> "Save" by FR-3339)
      await resourceLimitControlModal
        .getByRole('button', { name: 'Save' })
        .click();
      await expect(resourceLimitControlModal).toBeHidden();

      // verify resource limit is modified
      await openResourceLimitModal();
      const modifiedResourceLimitControlModal = page.getByRole('dialog', {
        // FR-3339 renamed the modal from "Modify ..." to "Edit ..." as part of
        // unifying edit terminology across the app.
        name: /Edit Minimum Image Resource Limit/i,
      });
      await expect(modifiedResourceLimitControlModal).toBeVisible();
      const modifiedCpuFormItem = modifiedResourceLimitControlModal.locator(
        '[data-bai-form-item]:has-text("CPU")',
      );
      const modifiedMemoryFormItem = modifiedResourceLimitControlModal.locator(
        '[data-bai-form-item]:has-text("Memory")',
      );
      const modifiedCpuFormItemInput =
        modifiedCpuFormItem.getByRole('spinbutton');
      const modifiedMemoryFormItemInput =
        modifiedMemoryFormItem.getByRole('spinbutton');
      const modifiedMemoryUnitSelector = modifiedMemoryFormItem.getByRole(
        'combobox',
        { name: 'Unit' },
      );
      await expect(modifiedCpuFormItemInput).toHaveValue(CPU_CORE);
      await expect(modifiedMemoryFormItemInput).toHaveValue(MEMORY_SIZE);
      await expect(modifiedMemoryUnitSelector).toHaveText('GiB');

      // reset resource limit
      await modifiedCpuFormItemInput.fill(cpuValue);
      await expect(modifiedCpuFormItemInput).toHaveValue(cpuValue);
      await setMemorySize(
        page,
        modifiedMemoryFormItemInput,
        modifiedMemoryUnitSelector,
        { value: memoryValue, unit: memorySize },
      );
      // click the modal's submit button (renamed "OK" -> "Save" by FR-3339)
      await modifiedResourceLimitControlModal
        .getByRole('button', { name: 'Save' })
        .click();
      await expect(modifiedResourceLimitControlModal).toBeHidden();
    });

    test('user can manage apps', async ({ page }) => {
      // Click manage apps button. `ImageList.tsx`'s Control column IconButton
      // carries `label={t('environment.ManageApps')}` = "Manage Apps" — the
      // antd `appstore` icon name it used to expose is gone with antd.
      const firstRow = imageListRowsOf(page).first();
      const openManageAppsModal = () =>
        firstRow.getByRole('button', { name: 'Manage Apps' }).click();
      await openManageAppsModal();

      // Add app
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
      // The three fields of the newly added row. `ManageAppsModal.tsx` gives
      // each `AstryxFormTextInput` a label/placeholder pair ("App Name",
      // "Protocol", "Port"); scope through the row's own form item so the
      // names stay unambiguous across rows.
      const addedAppRow = modal
        .locator('[data-bai-form-item]')
        .nth(numberOfAppsBeforeAdd);
      await addedAppRow.getByPlaceholder('App Name').fill(addInfo.app);
      await addedAppRow.getByPlaceholder('Protocol').fill(addInfo.protocol);
      await addedAppRow.getByPlaceholder('Port').fill(addInfo.port);

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
        await openManageAppsModal();
        const dialog = page.getByRole('dialog', { name: /Manage Apps/i });
        await expect(dialog).toBeVisible();
        // One `[data-bai-form-item]` per app row (the 3 nested per-field
        // items are `noStyle` and render no DOM of their own).
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
      await openManageAppsModal();
      const modalAfterAdd = page.getByRole('dialog', { name: /Manage Apps/i });
      await expect(modalAfterAdd).toBeVisible();
      // Retry the count assertion: the freshly-reopened modal renders its
      // app form-items asynchronously, so a one-shot `.count()` can read the
      // old total before the added row mounts (flaky off by one).
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

      // Reset apps — scope the removal to the added row's own form item
      // instead of indexing a flat button list (`ManageAppsModal.tsx` renders
      // one ghost IconButton `label={t('button.Delete')}` per app row).
      await modalAfterAdd
        .locator('[data-bai-form-item]')
        .nth(numberOfApps - 1)
        .getByRole('button', { name: 'Delete' })
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
 * A committed filter renders as an Astryx `Token` whose LABEL is
 * `"<Field>: <operator>"` and whose VALUE is a separate `endContent` node
 * (`PowerSearch.tsx` — `<Token label={tokenLabel} endContent={valueContent}>`).
 * `@astryx.token.remove` interpolates only the label, so the remove button is
 * `aria-label="Remove <Field>: <operator>"` — the value is NOT part of it.
 *
 * `defaultOperator` per field comes from `ImageList.tsx`'s `filterProperties`
 * (`==` for the strict-selection fields, the BUI default `ilike` for free-text
 * ones); the operator word is `comp:BAIPropertyFilter.operator.*`
 * (packages/backend.ai-ui/src/locale/en.json — `==` -> "is", `ilike` ->
 * "contains").
 */
function imageFilterTokenLabel(
  propertyLabel: string,
  operatorWord: 'contains' | 'is',
): string {
  return `${propertyLabel}: ${operatorWord}`;
}

/** The tokenizer that holds every committed filter token. */
function imageFilterTokenizerOf(page: Page) {
  return page.getByRole('group', { name: 'Search filters' });
}

/**
 * The token's value, rendered as the `Token`'s `endContent` beside the label.
 * Asserted separately from the remove button because the two carry different
 * halves of `"<Field>: <operator> <value>"`.
 */
function imageFilterTokenValue(page: Page, value: string) {
  return imageFilterTokenizerOf(page).getByText(value, { exact: true });
}

/**
 * PowerSearch's built-in "Clear all" (`t('@astryx.tokenizer.clearAll')`,
 * `Tokenizer.tsx`). Scoped to the tokenizer and matched exactly, because the
 * project selector beside it exposes "Clear All projects", which a loose
 * (substring, case-insensitive) name match also hits.
 */
function imageFilterClearAllButtonOf(page: Page) {
  return imageFilterTokenizerOf(page).getByRole('button', {
    name: 'Clear all',
    exact: true,
  });
}

/**
 * Open PowerSearch's typeahead and pick `propertyLabel`, which opens the edit
 * popover for that field.
 *
 * Two hazards, both handled by retrying open-and-pick as one unit:
 *  - committing a token leaves the suggestion list OPEN, so an unconditional
 *    click on the bar would TOGGLE it shut (hence the `aria-expanded` guard);
 *  - under load the bar can be in the DOM before PowerSearch has wired it up,
 *    so the first click opens nothing.
 */
async function pickImageFilterField(page: Page, propertyLabel: string) {
  // Scroll the search bar to the centre of the viewport so it is not obscured
  // by the sticky header, and click with force:true because that header can
  // still intercept pointer events afterwards.
  const searchBar = page.getByRole('combobox', { name: 'Search filters' });
  await searchBar.evaluate((el) =>
    el.scrollIntoView({ block: 'center', inline: 'nearest' }),
  );
  await expect(async () => {
    if ((await searchBar.getAttribute('aria-expanded')) !== 'true') {
      await searchBar.click({ force: true });
    }
    await page
      .getByRole('option', { name: propertyLabel, exact: true })
      .click({ timeout: 5000 });
  }).toPass({ timeout: 60000 });
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
  await pickImageFilterField(page, propertyLabel);

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
  await waitForImageListSettled(page);
}

/**
 * Remove a committed filter token by its label (`"<Field>: <operator>"`, see
 * `imageFilterTokenLabel`). Each token's own remove control carries
 * `aria-label="Remove {label}"` (`t('@astryx.token.remove', {label})`,
 * `Token.tsx` / locales/en.json) — used directly as both the "is this filter
 * still present" probe and the click target, since the button and the token
 * it belongs to appear/disappear together.
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

  // Wait for the refetch triggered by the removal to settle
  await waitForImageListSettled(page);
}

/**
 * Click PowerSearch's built-in "Clear all" button
 * (`t('@astryx.tokenizer.clearAll')`, `Tokenizer.tsx` / locales/en.json —
 * replaces the antd-era bespoke reset-all button, ticket 28 PILOT-DECISION
 * #6) and wait for it to disappear (it renders only while at least one
 * filter is active) and the table to settle, retrying the click if it is
 * swallowed by a concurrent re-render (see `removeFilterTag`).
 */
async function resetAllFilters(page: Page, resetAllButton: Locator) {
  await expect(async () => {
    await resetAllButton.click();
    await expect(resetAllButton).not.toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 20000 });

  await waitForImageListSettled(page);
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
      // Wait for the BAIPropertyFilter (PowerSearch) and the table to be ready.
      await expect(
        page.getByRole('combobox', { name: 'Search filters' }),
      ).toBeVisible({ timeout: 60000 });
      await waitForImageListReady(page);
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
      const nameLabel = imageFilterTokenLabel('Name', 'contains');
      const nameTag = page.getByRole('button', {
        name: `Remove ${nameLabel}`,
      });
      await expect(nameTag).toBeVisible();
      // The value lives in the token's `endContent`, beside the label.
      await expect(imageFilterTokenValue(page, 'python')).toBeVisible();

      // 3. Verify the table is still visible (filtered results shown)
      await expect(imageListTableOf(page)).toBeVisible();

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
      const archLabel = imageFilterTokenLabel('Architecture', 'is');
      const archTag = page.getByRole('button', {
        name: `Remove ${archLabel}`,
      });
      await expect(archTag).toBeVisible();
      await expect(imageFilterTokenValue(page, 'x86_64')).toBeVisible();

      // 3. Verify the table has at least one row with images
      await expect(imageListRowsOf(page).first()).toBeVisible();

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
      const statusLabel = imageFilterTokenLabel('Status', 'is');
      const statusTag = page.getByRole('button', {
        name: `Remove ${statusLabel}`,
      });
      await expect(statusTag).toBeVisible();
      await expect(imageFilterTokenValue(page, 'ALIVE')).toBeVisible();

      // 3. Verify the table is not empty (all installed images should be ALIVE)
      await expect(imageListRowsOf(page).first()).toBeVisible();

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
      const typeLabel = imageFilterTokenLabel('Type', 'is');
      const typeTag = page.getByRole('button', {
        name: `Remove ${typeLabel}`,
      });
      await expect(typeTag).toBeVisible();
      await expect(imageFilterTokenValue(page, 'COMPUTE')).toBeVisible();

      // 3. Verify the table has at least one row
      await expect(imageListRowsOf(page).first()).toBeVisible();

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
      const registryLabel = imageFilterTokenLabel('Registry', 'contains');
      const registryTag = page.getByRole('button', {
        name: `Remove ${registryLabel}`,
      });
      await expect(registryTag).toBeVisible();
      await expect(imageFilterTokenValue(page, 'cr')).toBeVisible();

      // 3. Verify the table content is visible (rows exist for the registry)
      await expect(imageListTableOf(page)).toBeVisible();

      // 4. Cleanup: remove the filter token
      await removeFilterTag(page, registryLabel);
      await expect(registryTag).not.toBeVisible({ timeout: 10000 });
    });

    // Scenario 2.7 — Multiple filters with the "Clear all" button
    test('Admin can apply multiple filters simultaneously and see the clear-all button', async ({
      page,
    }) => {
      // 1. Apply Name filter with value "python"
      const nameLabel = imageFilterTokenLabel('Name', 'contains');
      await applyImageFilter(page, 'Name', 'python');
      const nameTag = page.getByRole('button', {
        name: `Remove ${nameLabel}`,
      });
      await expect(nameTag).toBeVisible();
      await expect(imageFilterTokenValue(page, 'python')).toBeVisible();

      // 2. Apply Architecture filter with strict selection "x86_64"
      const archLabel = imageFilterTokenLabel('Architecture', 'is');
      await applyImageFilter(page, 'Architecture', 'x86_64');
      const archTag = page.getByRole('button', {
        name: `Remove ${archLabel}`,
      });
      await expect(archTag).toBeVisible();
      await expect(imageFilterTokenValue(page, 'x86_64')).toBeVisible();

      // 3. Verify both tokens are visible
      await expect(nameTag).toBeVisible();
      await expect(archTag).toBeVisible();

      // 4. Verify the "Clear all" button appears. PowerSearch's built-in
      // `hasClear` shows it whenever at least one filter is active (ticket 28
      // PILOT-DECISION #6 — antd's bespoke reset-all button, which only
      // appeared with 2+ filters, is gone).
      const resetAllButton = imageFilterClearAllButtonOf(page);
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
      const nameLabel = imageFilterTokenLabel('Name', 'contains');
      await applyImageFilter(page, 'Name', 'python');
      const nameTag = page.getByRole('button', {
        name: `Remove ${nameLabel}`,
      });
      await expect(nameTag).toBeVisible();
      await expect(imageFilterTokenValue(page, 'python')).toBeVisible();

      // 2. Apply Architecture filter with strict selection "x86_64"
      const archLabel = imageFilterTokenLabel('Architecture', 'is');
      await applyImageFilter(page, 'Architecture', 'x86_64');
      const archTag = page.getByRole('button', {
        name: `Remove ${archLabel}`,
      });
      await expect(archTag).toBeVisible();
      await expect(imageFilterTokenValue(page, 'x86_64')).toBeVisible();

      // 3. Verify the "Clear all" button appears with 2 active filters
      const resetAllButton = imageFilterClearAllButtonOf(page);
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
      const nameLabel = imageFilterTokenLabel('Name', 'contains');
      await applyImageFilter(page, 'Name', 'python');
      const nameTag = page.getByRole('button', {
        name: `Remove ${nameLabel}`,
      });
      await expect(nameTag).toBeVisible();
      await expect(imageFilterTokenValue(page, 'python')).toBeVisible();

      // 2. Apply Architecture filter with strict selection "x86_64"
      const archLabel = imageFilterTokenLabel('Architecture', 'is');
      await applyImageFilter(page, 'Architecture', 'x86_64');
      const archTag = page.getByRole('button', {
        name: `Remove ${archLabel}`,
      });
      await expect(archTag).toBeVisible();
      await expect(imageFilterTokenValue(page, 'x86_64')).toBeVisible();

      // 3. Verify both filter tokens and the "Clear all" button are visible
      const resetAllButton = imageFilterClearAllButtonOf(page);
      await expect(resetAllButton).toBeVisible();

      // 4. Click "Clear all" to clear all filters at once
      await resetAllFilters(page, resetAllButton);

      // 5. Verify no filter tokens remain
      await expect(nameTag).not.toBeVisible({ timeout: 10000 });
      await expect(archTag).not.toBeVisible({ timeout: 10000 });
      await expect(resetAllButton).not.toBeVisible({ timeout: 10000 });

      // 6. Verify the table shows results (returns to unfiltered state)
      await expect(imageListRowsOf(page).first()).toBeVisible();
    });

    // Scenario 2.10 — Pagination resets to page 1 when filter applied
    test(
      'Admin sees pagination reset to page 1 when a filter is applied on page 2',
      { tag: ['@requires-seeded-data'] },
      async ({ page }) => {
        // 1. Check total row count to determine if there are enough images for page 2.
        // `BAITable`'s bottom bar renders `BAIPaginationInfoText`, i.e.
        // `comp:PaginationInfoText.Total` = "{{start}} - {{end}} of {{total}} items".
        const paginationTotal = page.getByText(
          /^\d+\s*-\s*\d+\s+of\s+\d+\s+items$/,
        );
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

        const visiblePagination = imageListPaginationOf(page);
        // Astryx's `Pagination` marks the current page button with
        // `aria-current="page"`; there is no active-item class any more.
        const activePage = visiblePagination.locator('[aria-current="page"]');

        // 2. Navigate to page 2 by clicking the page 2 button in pagination
        await visiblePagination
          .getByRole('button', { name: 'Go to page 2' })
          .click();
        await waitForImageListSettled(page);

        // 3. Verify we are on page 2
        await expect(activePage).toHaveText('2');

        // 4. Apply a Name filter with value "python"
        const nameLabel = imageFilterTokenLabel('Name', 'contains');
        await applyImageFilter(page, 'Name', 'python');
        const nameTag = page.getByRole('button', {
          name: `Remove ${nameLabel}`,
        });
        await expect(nameTag).toBeVisible();
        await expect(imageFilterTokenValue(page, 'python')).toBeVisible();

        // 5. Verify pagination has reset to page 1
        await expect(activePage).toHaveText('1');

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
      await pickImageFilterField(page, 'Architecture');

      // 2. The value editor is a closed Selector, not a free-text input.
      await expect(
        page.getByRole('textbox', { name: 'Value' }),
      ).not.toBeVisible();
      const valueSelector = page.getByRole('combobox', { name: 'Value' });
      await expect(valueSelector).toBeVisible();

      // 3. The Selector's trigger is a `<button role="combobox">`, not a text
      // field, so there is nothing to type INTO. Opening it offers exactly the
      // registered architectures (`ImageList.tsx` filterProperties: x86_64 /
      // aarch64), and type-to-select cannot synthesise a new option — so an
      // unregistered value stays unselectable and Apply stays disabled.
      await valueSelector.click();
      const valueOptions = page.getByRole('listbox').getByRole('option');
      await expect(valueOptions).toHaveText(['x86_64', 'aarch64']);
      await page.keyboard.type('arm64-unregistered-e2e-probe');
      await expect(
        page.getByRole('option', { name: 'arm64-unregistered-e2e-probe' }),
      ).toHaveCount(0);
      await expect(valueOptions).toHaveText(['x86_64', 'aarch64']);
      await expect(
        page.getByRole('button', { name: 'Apply', exact: true }),
      ).toBeDisabled();

      // 4. Close the popover without committing (Cancel — no value was ever
      // selectable, so there is nothing to Apply). The Selector's option list
      // overlays the popover footer, so collapse it first.
      await valueSelector.press('Escape');
      await expect(valueOptions).toHaveCount(0);
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();

      // 5. Verify no filter token was created and the table remains
      // unfiltered.
      await expect(page.getByRole('button', { name: /^Remove / })).toHaveCount(
        0,
      );
      await expect(imageListRowsOf(page).first()).toBeVisible();
    });

    // Scenario 2.12 — Empty results when filtering non-existent name
    test('Admin sees empty state when filtering by a non-existent image name', async ({
      page,
    }) => {
      // 1. Apply a Name filter with a value that matches no images
      const noResultsLabel = imageFilterTokenLabel('Name', 'contains');
      await applyImageFilter(page, 'Name', 'zzz-nonexistent-image-000');

      // 2. Verify the committed filter token is visible
      const noResultsTag = page.getByRole('button', {
        name: `Remove ${noResultsLabel}`,
      });
      await expect(noResultsTag).toBeVisible();
      await expect(
        imageFilterTokenValue(page, 'zzz-nonexistent-image-000'),
      ).toBeVisible();

      // 3. Verify the table shows its empty state. `BAITable` owns the node
      // (an Astryx `EmptyState` titled `comp:BAITable.NoDataToDisplay` =
      // "No data to display") instead of Astryx's own `@astryx.table.noData`.
      // It renders as a single full-width `<tr><td colSpan>` inside the tbody
      // (`@astryxdesign/core/src/Table/BaseTable.tsx`), so it replaces — not
      // accompanies — the data rows.
      await expect(
        imageListTableOf(page).getByRole('heading', {
          name: 'No data to display',
        }),
      ).toBeVisible();
      await expect(imageListRowsOf(page)).toHaveCount(1);

      // 4. Cleanup: remove the filter token
      await removeFilterTag(page, noResultsLabel);
      await expect(noResultsTag).not.toBeVisible();
    });
  },
);
