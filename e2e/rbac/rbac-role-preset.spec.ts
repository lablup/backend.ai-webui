// Covers the RBAC page's Presets tab and the system-role "View Presets" link
// added in #9924 (FR-4065). Read-only: no preset or role is created or edited.
import { skipUnlessClientFeature } from '../utils/feature-gate-util';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect, Locator, Page } from '@playwright/test';

// The role table (900+ roles in the shared nightly env) can take a while to
// render on a busy shared backend.
const SLOW_PAGE_TIMEOUT = 30000;

// `BAICard`'s `tabList` renders plain `<button>`s inside `nav "Tabs"`; the
// active one carries `aria-current="true"`.
function rbacPageTab(page: Page, name: 'Roles' | 'Presets') {
  return page
    .getByRole('main')
    .getByRole('navigation', { name: 'Tabs' })
    .getByRole('button', { name, exact: true });
}

function dataRows(page: Page, scope: Locator | Page = page) {
  return scope
    .getByRole('row')
    .filter({ hasNot: page.getByRole('columnheader') });
}

function columnHeader(page: Page, label: string) {
  return page.getByRole('columnheader').filter({ hasText: label });
}

function statusFilterOption(page: Page, label: 'Active' | 'Deleted') {
  return page.getByRole('radiogroup').getByText(label, { exact: true });
}

// BAIPropertyFilter (Astryx PowerSearch): free-text fields commit on "Apply";
// strict-selection enum fields auto-commit when an option is picked. After a
// commit the typeahead stays expanded, so open it only when it is closed.
async function openFilterField(page: Page, fieldLabel: string) {
  const field = page.getByRole('option', { name: fieldLabel, exact: true });
  if (!(await field.isVisible().catch(() => false))) {
    await page.getByRole('combobox', { name: 'Search filters' }).click();
  }
  await field.click();
}

// While a filter/sort change is in flight, `BAITable` keeps the previous rows
// on screen and marks its dim layer `aria-busy` (see environment.spec.ts).
async function waitForTableSettled(page: Page) {
  await expect(
    page.locator('.bai-table-astryx-dim-layer[aria-busy="true"]'),
  ).toHaveCount(0, { timeout: 20000 });
}

async function applyTextFilter(page: Page, fieldLabel: string, value: string) {
  await openFilterField(page, fieldLabel);
  await page.getByRole('textbox', { name: 'Value' }).fill(value);
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await waitForTableSettled(page);
}

async function applyEnumFilter(page: Page, fieldLabel: string, value: string) {
  await openFilterField(page, fieldLabel);
  await page.getByRole('combobox', { name: 'Value' }).click();
  await page.getByRole('option', { name: value, exact: true }).click();
  await waitForTableSettled(page);
}

async function expectEveryRowCell(
  page: Page,
  columnIndex: number,
  predicate: (text: string) => boolean,
) {
  await waitForTableSettled(page);
  await expect(async () => {
    const rows = await dataRows(page).all();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const text = (
        await row.getByRole('cell').nth(columnIndex).innerText()
      ).trim();
      expect(predicate(text), `unexpected cell "${text}"`).toBe(true);
    }
  }).toPass({ timeout: 20000 });
}

// RolePresetNodes column order: Preset Name, Scope Type, Permissions, ...
const PRESET_NAME_COLUMN = 0;
const PRESET_SCOPE_TYPE_COLUMN = 1;

async function openPresetsTab(page: Page) {
  await navigateTo(page, 'rbac');
  await expect(rbacPageTab(page, 'Presets')).toBeVisible({
    timeout: SLOW_PAGE_TIMEOUT,
  });
  await rbacPageTab(page, 'Presets').click();
  await expect(rbacPageTab(page, 'Presets')).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(columnHeader(page, 'Preset Name')).toBeVisible();
  await expect(dataRows(page).first()).toBeVisible({ timeout: 10000 });
}

test.describe(
  'RBAC Role Presets Tab',
  { tag: ['@rbac', '@regression', '@functional', '@requires-manager-v26.9'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await skipUnlessClientFeature(
        page,
        'rbac-role-presets',
        "The Presets tab requires the 'rbac-role-presets' capability (manager >= 26.9.0a4, FR-4065)",
      );
    });

    test('Superadmin can see the role preset list in the Presets tab', async ({
      page,
    }) => {
      await openPresetsTab(page);
      await expect(page).toHaveURL(/[?&]tab=presets/);

      for (const label of [
        'Preset Name',
        'Scope Type',
        'Permissions',
        'Auto Assign',
        'Created At',
        'Updated At',
      ]) {
        await expect(columnHeader(page, label)).toBeVisible();
      }
      // The Roles tab's own controls do not leak into the Presets tab.
      await expect(
        page.getByRole('button', { name: 'Create Role' }),
      ).toBeHidden();
    });

    test('Superadmin can switch the preset list between Active and Deleted presets', async ({
      page,
    }) => {
      await openPresetsTab(page);
      const radios = page.getByRole('radiogroup');
      await expect(radios.getByRole('radio', { name: 'Active' })).toBeChecked();

      await statusFilterOption(page, 'Deleted').click();
      await expect(
        radios.getByRole('radio', { name: 'Deleted' }),
      ).toBeChecked();
      await expect(page).toHaveURL(/[?&]status=DELETED/);
      // A server may have no soft-deleted preset; the table must still render.
      await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });

      await statusFilterOption(page, 'Active').click();
      await expect(radios.getByRole('radio', { name: 'Active' })).toBeChecked();
      await expect(dataRows(page).first()).toBeVisible({ timeout: 10000 });
    });

    test('Superadmin can filter role presets by name in the Presets tab', async ({
      page,
    }) => {
      await openPresetsTab(page);
      const presetName = (
        await dataRows(page)
          .first()
          .getByRole('cell')
          .nth(PRESET_NAME_COLUMN)
          .innerText()
      ).trim();

      await applyTextFilter(page, 'Preset Name', presetName);
      await expectEveryRowCell(page, PRESET_NAME_COLUMN, (name) =>
        name.includes(presetName),
      );

      const filterChip = page.getByRole('button', {
        name: 'Remove Preset Name: contains',
        exact: true,
      });
      await filterChip.click();
      await expect(filterChip).toBeHidden({ timeout: 5000 });
      await expect(dataRows(page).first()).toBeVisible({ timeout: 10000 });
    });

    test('Superadmin can filter role presets by scope type in the Presets tab', async ({
      page,
    }) => {
      await openPresetsTab(page);

      await applyEnumFilter(page, 'Scope Type', 'Project');
      await expect(
        page.getByRole('button', {
          name: 'Remove Scope Type: equals',
          exact: true,
        }),
      ).toBeVisible();
      await expectEveryRowCell(
        page,
        PRESET_SCOPE_TYPE_COLUMN,
        (scopeType) => scopeType === 'Project',
      );

      await page
        .getByRole('button', { name: 'Clear all', exact: true })
        .click();
      await expect(
        page.getByRole('button', {
          name: 'Remove Scope Type: equals',
          exact: true,
        }),
      ).toBeHidden();
      await waitForTableSettled(page);
      // Unfiltered, the list holds presets of more than one scope type (the
      // manager seeds global/domain/project/user presets).
      await expect
        .poll(async () => {
          const scopeTypes = await dataRows(page).evaluateAll(
            (rows, column) =>
              rows.map(
                (row) =>
                  row.querySelectorAll('td')[column]?.textContent?.trim() ?? '',
              ),
            PRESET_SCOPE_TYPE_COLUMN,
          );
          return new Set(scopeTypes).size;
        })
        .toBeGreaterThan(1);
    });
  },
);

// `RoleDetailDrawerV2` renders as an Astryx `Dialog` named "RBAC Role Info".
function roleDrawer(page: Page) {
  return page.getByRole('dialog', { name: 'RBAC Role Info' });
}

test.describe(
  'RBAC System Role Permissions',
  { tag: ['@rbac', '@regression', '@functional', '@requires-manager-v26.9'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await skipUnlessClientFeature(
        page,
        'rbac-role-presets',
        "The system role's View Presets link requires the 'rbac-role-presets' capability (manager >= 26.9.0a4, FR-4065)",
      );
      await skipUnlessClientFeature(
        page,
        'role-mapped-scope-filter',
        "Picking a project-scoped role needs the role list's Scope Type filter ('role-mapped-scope-filter')",
      );
    });

    test('Superadmin can see read-only grants and a View Presets link on a system role', async ({
      page,
    }) => {
      await navigateTo(page, 'rbac');
      await expect(rbacPageTab(page, 'Roles')).toBeVisible({
        timeout: SLOW_PAGE_TIMEOUT,
      });

      // The oldest project-scoped system role: sorting by Created At keeps the
      // seed roles on top while parallel tests churn newer ones.
      await applyEnumFilter(page, 'Source', 'System');
      // The role list's Scope Type value is a custom select (a `Scope Type`
      // button), which commits only on Apply — unlike `applyEnumFilter`.
      await openFilterField(page, 'Scope Type');
      await page
        .getByRole('button', { name: 'Scope Type', exact: true })
        .click();
      await page.getByRole('option', { name: 'Project', exact: true }).click();
      await page.getByRole('button', { name: 'Apply', exact: true }).click();
      await waitForTableSettled(page);
      const createdAtHeader = columnHeader(page, 'Created At');
      await createdAtHeader.getByRole('button').click();
      await expect(createdAtHeader).toHaveAttribute('aria-sort', 'ascending', {
        timeout: 10000,
      });
      await waitForTableSettled(page);

      const roleRow = dataRows(page).first();
      await expect(roleRow).toBeVisible({ timeout: 10000 });
      const roleName = (
        await roleRow
          .getByRole('cell')
          .first()
          .getByRole('button')
          .first()
          .innerText()
      ).trim();
      await roleRow
        .getByRole('button', { name: roleName, exact: true })
        .click();

      const drawer = roleDrawer(page);
      await expect(drawer).toBeVisible({ timeout: 10000 });
      await expect(drawer.getByText(roleName, { exact: true })).toBeVisible();
      await expect(
        drawer
          .getByRole('navigation', { name: 'Tabs' })
          .getByRole('button', { name: 'Permissions' }),
      ).toHaveAttribute('aria-current', 'true');

      const readOnlyAlert = drawer.getByRole('alert').filter({
        hasText: 'Permissions of a system role cannot be edited here.',
      });
      await expect(readOnlyAlert).toBeVisible({ timeout: 10000 });

      // Grants render as tokens, never as editable checkboxes.
      await expect(dataRows(page, drawer).first()).toBeVisible({
        timeout: 10000,
      });
      await expect(
        drawer.getByRole('cell', { name: 'Read', exact: true }).first(),
      ).toBeVisible();
      await expect(drawer.getByRole('checkbox')).toHaveCount(0);

      await readOnlyAlert.getByRole('link', { name: 'View Presets' }).click();

      await expect(drawer).toBeHidden({ timeout: 10000 });
      await expect(page).toHaveURL(/[?&]tab=presets/);
      await expect(rbacPageTab(page, 'Presets')).toHaveAttribute(
        'aria-current',
        'true',
      );
      await expect(
        page.getByRole('button', {
          name: 'Remove Scope Type: equals',
          exact: true,
        }),
      ).toBeVisible({ timeout: 10000 });
      await expectEveryRowCell(
        page,
        PRESET_SCOPE_TYPE_COLUMN,
        (scopeType) => scopeType === 'Project',
      );
    });
  },
);
