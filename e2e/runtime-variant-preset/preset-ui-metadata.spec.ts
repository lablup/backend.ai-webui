// Covers FR-3476: Category / Display Name / UI Option (slider, number,
// select, checkbox, text) on the Runtime Variant Preset admin create/update
// modal. These fields are gated behind the `runtime-variant-preset-ui-metadata`
// client capability (manager >= 26.9.0) — tests that depend on them skip
// gracefully against an older manager instead of failing.
import { loginAsAdmin, webuiEndpoint } from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

// `/admin-deployments` is a legacy alias that client-side-redirects to this
// canonical path (see `legacyRedirects.tsx`'s `AdminRedirect`) — navigating
// here directly avoids the extra redirect hop, which was observed to
// occasionally desync Playwright's auto-waiting mid-navigation.
const PRESET_TAB_URL = `${webuiEndpoint}/admin/deployments?tab=runtime-variant-presets`;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function supportsUIMetadata(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      (
        window as unknown as {
          backendaiclient?: { supports: (f: string) => boolean };
        }
      ).backendaiclient?.supports('runtime-variant-preset-ui-metadata') ??
      false,
  );
}

/**
 * Opens the Create Preset modal, selects the first available runtime
 * variant, and fills the always-required fields.
 *
 * The dev server this suite runs against occasionally drops its Vite HMR
 * websocket and issues a full page reload mid-interaction (observed via
 * `page.on('load')`, unrelated to anything the app does) — losing the
 * open modal. Retry the whole sequence once rather than fail on that
 * environmental hiccup.
 */
async function openCreateModalWithRequiredFields(
  page: Page,
  name: string,
  key: string,
): Promise<ReturnType<Page['getByRole']>> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await page.goto(PRESET_TAB_URL);
      await page.waitForLoadState('domcontentloaded');
      await expect(
        page.getByRole('button', { name: /Create Preset/i }),
      ).toBeVisible({ timeout: 60000 });
      await page.getByRole('button', { name: /Create Preset/i }).click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Runtime Variant is a paginated combobox — pick the first option.
      const runtimeVariantSelect = modal.getByRole('combobox', {
        name: 'Runtime Variant',
      });
      await expect(runtimeVariantSelect).toBeVisible({ timeout: 30000 });
      await runtimeVariantSelect.click();
      await page.waitForSelector(
        '.ant-select-dropdown .ant-select-item-option',
        { state: 'visible', timeout: 15000 },
      );
      await page
        .locator('.ant-select-dropdown .ant-select-item-option')
        .first()
        .click();

      await modal
        .getByRole('textbox', { name: 'Name', exact: true })
        .fill(name);
      await modal.getByRole('textbox', { name: 'Key' }).fill(key);
      // Confirm the modal (and its filled Name) survived the fill — if a
      // reload happened, this will already have failed or `modal` will no
      // longer be attached.
      await expect(
        modal.getByRole('textbox', { name: 'Name', exact: true }),
      ).toHaveValue(name);

      return modal;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

async function deletePreset(page: Page, presetName: string): Promise<void> {
  await page.goto(PRESET_TAB_URL);
  await page.waitForLoadState('domcontentloaded');
  const row = page.getByRole('row').filter({ hasText: presetName });
  // `domcontentloaded` fires before the Relay table data renders, and
  // `.count()` resolves immediately without waiting — so reading it right
  // after navigation can race the render and report 0 while the table is
  // still showing its loading skeleton, silently skipping real cleanup.
  // Wait for the row to actually appear (or definitively time out) instead.
  const appeared = await row
    .first()
    .waitFor({ state: 'visible', timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  if (!appeared) return;
  await row.getByRole('button', { name: 'Delete', exact: true }).click();
  const confirmModal = page.getByRole('dialog');
  await expect(confirmModal).toBeVisible({ timeout: 15000 });
  await confirmModal.locator('input').fill(presetName);
  await confirmModal
    .getByRole('button', { name: 'Delete', exact: true })
    .click();
  await expect(confirmModal).toBeHidden({ timeout: 30000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Create — Category / Display Name / UI Option
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Runtime Variant Preset - UI Metadata - Create',
  { tag: ['@runtime-variant-preset', '@admin', '@crud'] },
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

    test('Superadmin can create a preset with Category, Display Name, and a SELECT UI option', async ({
      page,
    }) => {
      test.skip(
        !(await supportsUIMetadata(page)),
        'runtime-variant-preset-ui-metadata requires manager >= 26.9.0',
      );

      presetName = `e2e-preset-select-${Date.now()}`;
      const modal = await openCreateModalWithRequiredFields(
        page,
        presetName,
        `E2E_KEY_${Date.now()}`,
      );

      await modal
        .getByRole('combobox', { name: /^Category/ })
        .fill('e2e_category');
      await modal
        .getByRole('textbox', { name: /^Display Name/ })
        .fill('E2E Display Name');

      await modal.getByRole('combobox', { name: /^UI Type/ }).click();
      await page
        .locator('.ant-select-dropdown')
        .getByText('Select', { exact: true })
        .click();

      await modal.getByRole('button', { name: /Add Choice/i }).click();
      await modal.getByRole('button', { name: /Add Choice/i }).click();

      const choiceRows = modal.locator('input[placeholder="e.g., fp16"]');
      const labelRows = modal.locator('input[placeholder="e.g., FP16"]');
      await choiceRows.nth(0).fill('fp16');
      await labelRows.nth(0).fill('FP16');
      await choiceRows.nth(1).fill('bf16');
      await labelRows.nth(1).fill('BF16');

      // Exercise the remove flow too, not just add: a temporary third row
      // is added, filled, then removed via its own row Delete button. This
      // verifies the row count drops back to 2 and the remaining rows keep
      // their own values (i.e. `remove()` targets the right Form.List index)
      // — a broken remove handler wouldn't fail any test without this.
      await modal.getByRole('button', { name: /Add Choice/i }).click();
      await choiceRows.nth(2).fill('int8');
      await labelRows.nth(2).fill('INT8');
      await expect(choiceRows).toHaveCount(3);
      await modal
        .getByRole('button', { name: 'Delete', exact: true })
        .last()
        .click();
      await expect(choiceRows).toHaveCount(2);
      await expect(choiceRows.nth(0)).toHaveValue('fp16');
      await expect(choiceRows.nth(1)).toHaveValue('bf16');

      await modal.getByRole('button', { name: 'Create' }).click();

      await expect(
        page.getByText('Runtime variant preset has been created.'),
      ).toBeVisible({ timeout: 60000 });
      await expect(modal).toBeHidden({ timeout: 30000 });

      const newRow = page.getByRole('row').filter({ hasText: presetName });
      await expect(newRow).toBeVisible({ timeout: 60000 });
    });

    test('Superadmin can create a preset with a SLIDER UI option', async ({
      page,
    }) => {
      test.skip(
        !(await supportsUIMetadata(page)),
        'runtime-variant-preset-ui-metadata requires manager >= 26.9.0',
      );

      presetName = `e2e-preset-slider-${Date.now()}`;
      const modal = await openCreateModalWithRequiredFields(
        page,
        presetName,
        `E2E_KEY_${Date.now()}`,
      );

      await modal.getByRole('combobox', { name: /^UI Type/ }).click();
      await page
        .locator('.ant-select-dropdown')
        .getByText('Slider', { exact: true })
        .click();

      await modal.getByRole('spinbutton', { name: 'Minimum' }).fill('0');
      await modal.getByRole('spinbutton', { name: 'Maximum' }).fill('8');
      await modal.getByRole('spinbutton', { name: 'Step' }).fill('1');

      await modal.getByRole('button', { name: 'Create' }).click();

      await expect(
        page.getByText('Runtime variant preset has been created.'),
      ).toBeVisible({ timeout: 60000 });
      await expect(modal).toBeHidden({ timeout: 30000 });

      // Reopen and verify the persisted UI Option actually round-trips with
      // the exact bounds/step submitted, not just that *some* preset was
      // created — the assertions above would still pass even if `uiOption`
      // were dropped or miswritten. The Minimum/Maximum/Step fields only
      // render at all when `uiType === 'SLIDER'`, so their presence here
      // doubles as proof the UI type round-tripped too.
      const row = page.getByRole('row').filter({ hasText: presetName });
      await expect(row).toBeVisible({ timeout: 60000 });
      await row.getByRole('button', { name: 'Edit', exact: true }).click();
      const editModal = page.getByRole('dialog');
      await expect(editModal).toBeVisible();
      await expect(
        editModal.getByRole('spinbutton', { name: 'Minimum' }),
      ).toHaveValue('0');
      await expect(
        editModal.getByRole('spinbutton', { name: 'Maximum' }),
      ).toHaveValue('8');
      await expect(
        editModal.getByRole('spinbutton', { name: 'Step' }),
      ).toHaveValue('1');
      await editModal.getByRole('button', { name: 'Cancel' }).click();
    });

    test('Superadmin cannot save a SLIDER UI option without Minimum/Maximum', async ({
      page,
    }) => {
      test.skip(
        !(await supportsUIMetadata(page)),
        'runtime-variant-preset-ui-metadata requires manager >= 26.9.0',
      );

      // Tracked in `presetName` (read by `afterEach`) even though this
      // preset is expected to fail validation and never be created: if a
      // regression makes the required rule silently pass, the mutation
      // would succeed and leave a persistent preset that global teardown
      // doesn't sweep.
      presetName = `e2e-preset-slider-invalid-${Date.now()}`;
      const modal = await openCreateModalWithRequiredFields(
        page,
        presetName,
        `E2E_KEY_${Date.now()}`,
      );

      await modal.getByRole('combobox', { name: /^UI Type/ }).click();
      await page
        .locator('.ant-select-dropdown')
        .getByText('Slider', { exact: true })
        .click();

      await modal.getByRole('button', { name: 'Create' }).click();

      // Both Minimum and Maximum are left blank; assert both required
      // messages so a regression dropping either field's `required` rule
      // doesn't slip through unnoticed.
      await expect(modal.getByText('Minimum value is required.')).toBeVisible();
      await expect(modal.getByText('Maximum value is required.')).toBeVisible();

      await modal.getByRole('button', { name: 'Cancel' }).click();
    });

    test('Superadmin cannot save a SLIDER UI option with a negative Step', async ({
      page,
    }) => {
      test.skip(
        !(await supportsUIMetadata(page)),
        'runtime-variant-preset-ui-metadata requires manager >= 26.9.0',
      );

      // Tracked in `presetName` for the same reason as the sibling
      // Minimum/Maximum-required test above: a regression in the
      // negative-step rule would otherwise leave an unswept preset.
      presetName = `e2e-preset-slider-negative-step-${Date.now()}`;
      const modal = await openCreateModalWithRequiredFields(
        page,
        presetName,
        `E2E_KEY_${Date.now()}`,
      );

      await modal.getByRole('combobox', { name: /^UI Type/ }).click();
      await page
        .locator('.ant-select-dropdown')
        .getByText('Slider', { exact: true })
        .click();

      await modal.getByRole('spinbutton', { name: 'Minimum' }).fill('0');
      await modal.getByRole('spinbutton', { name: 'Maximum' }).fill('8');
      await modal.getByRole('spinbutton', { name: 'Step' }).fill('-1');

      await modal.getByRole('button', { name: 'Create' }).click();

      await expect(
        modal.getByText('Step must be greater than 0.'),
      ).toBeVisible();

      await modal.getByRole('button', { name: 'Cancel' }).click();
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Edit — content must survive round-trip (regression coverage for the
//    Form.List `preserve={false}` GC bug fixed in this same change)
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Runtime Variant Preset - UI Metadata - Edit',
  { tag: ['@runtime-variant-preset', '@admin', '@crud'] },
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

    test('Editing a SELECT preset re-populates category, display name, and every choice row', async ({
      page,
    }) => {
      test.skip(
        !(await supportsUIMetadata(page)),
        'runtime-variant-preset-ui-metadata requires manager >= 26.9.0',
      );

      presetName = `e2e-preset-edit-select-${Date.now()}`;
      const modal = await openCreateModalWithRequiredFields(
        page,
        presetName,
        `E2E_KEY_${Date.now()}`,
      );

      await modal
        .getByRole('combobox', { name: /^Category/ })
        .fill('e2e_category');
      await modal
        .getByRole('textbox', { name: /^Display Name/ })
        .fill('E2E Display Name');
      await modal.getByRole('combobox', { name: /^UI Type/ }).click();
      await page
        .locator('.ant-select-dropdown')
        .getByText('Select', { exact: true })
        .click();
      // Two choice rows, not one — a bug that only mishandles the second
      // (or later) `Form.List` row wouldn't be caught by asserting `.first()`
      // alone below.
      await modal.getByRole('button', { name: /Add Choice/i }).click();
      await modal.getByRole('button', { name: /Add Choice/i }).click();
      const createChoiceRows = modal.locator('input[placeholder="e.g., fp16"]');
      const createLabelRows = modal.locator('input[placeholder="e.g., FP16"]');
      await createChoiceRows.nth(0).fill('fp16');
      await createLabelRows.nth(0).fill('FP16');
      await createChoiceRows.nth(1).fill('bf16');
      await createLabelRows.nth(1).fill('BF16');
      await modal.getByRole('button', { name: 'Create' }).click();
      await expect(
        page.getByText('Runtime variant preset has been created.'),
      ).toBeVisible({ timeout: 60000 });
      await expect(modal).toBeHidden({ timeout: 30000 });

      // Reopen for edit and verify every field round-tripped.
      const row = page.getByRole('row').filter({ hasText: presetName });
      await expect(row).toBeVisible({ timeout: 60000 });
      await row.getByRole('button', { name: 'Edit', exact: true }).click();

      const editModal = page.getByRole('dialog');
      await expect(editModal).toBeVisible();
      await expect(editModal).toContainText('Edit Preset');

      await expect(
        editModal.getByRole('combobox', { name: /^Category/ }),
      ).toHaveValue('e2e_category');
      await expect(
        editModal.getByRole('textbox', { name: /^Display Name/ }),
      ).toHaveValue('E2E Display Name');

      // The regression this covers: row count used to be right but the
      // value/label inputs came back empty. Check both rows, not just the
      // first, so a bug affecting only the second-or-later row is caught.
      const editChoiceRows = editModal.locator(
        'input[placeholder="e.g., fp16"]',
      );
      const editLabelRows = editModal.locator(
        'input[placeholder="e.g., FP16"]',
      );
      await expect(editChoiceRows).toHaveCount(2);
      await expect(editChoiceRows.nth(0)).toHaveValue('fp16');
      await expect(editLabelRows.nth(0)).toHaveValue('FP16');
      await expect(editChoiceRows.nth(1)).toHaveValue('bf16');
      await expect(editLabelRows.nth(1)).toHaveValue('BF16');

      await editModal.getByRole('button', { name: 'Cancel' }).click();
    });
  },
);
