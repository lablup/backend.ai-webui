// spec: Bulk Create Users from CSV — client-side validation tests
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect, Page } from '@playwright/test';
import path from 'path';

const SAMPLES_DIR = path.resolve(__dirname, '../../test-fixtures/csv-samples');

async function openBulkCreateCSVModal(page: Page) {
  await navigateTo(page, 'credential?tab=users');
  // Wait for UserManagement to fully load
  await expect(page.getByRole('button', { name: 'Create User' })).toBeVisible({
    timeout: 15000,
  });
  // Click the ellipsis dropdown button — scoped to the Space.Compact that contains
  // "Create User", to avoid matching the antd Tabs nav "more" button.
  const createUserBtn = page.getByRole('button', { name: 'Create User' });
  await createUserBtn
    .locator('xpath=ancestor::*[contains(@class,"ant-space-compact")]')
    .getByRole('button', { name: 'ellipsis' })
    .click();
  await page
    .getByRole('menuitem', { name: 'Bulk Create Users from CSV' })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Bulk Create Users from CSV' }),
  ).toBeVisible({ timeout: 5000 });
}

async function uploadCSV(page: Page, filename: string) {
  const dialog = page.getByRole('dialog', {
    name: 'Bulk Create Users from CSV',
  });
  const fileInput = dialog.locator('input[name="file"]');
  await fileInput.setInputFiles(path.join(SAMPLES_DIR, filename));
}

/** Read stat numbers from the preview bar by label text */
async function getStat(page: Page, label: string): Promise<number> {
  const dialog = page.getByRole('dialog', {
    name: 'Bulk Create Users from CSV',
  });
  // BAIPanelItem renders the title span first, then the numeric value span
  // (nested inside a flex wrapper). Find the title, then read the value span.
  const labelEl = dialog.getByText(label, { exact: true });
  await expect(labelEl).toBeVisible({ timeout: 8000 });
  const container = labelEl.locator('..');
  // The label is the first span; the numeric value is the last span.
  const numText = await container.locator('span').last().textContent();
  const parsed = parseInt(numText ?? '', 10);
  if (Number.isNaN(parsed)) {
    throw new Error(
      `Failed to parse numeric stat for label "${label}" (got "${numText ?? ''}")`,
    );
  }
  return parsed;
}

async function closeModal(page: Page) {
  await page
    .getByRole('dialog', { name: 'Bulk Create Users from CSV' })
    .getByRole('button', { name: 'Cancel' })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Bulk Create Users from CSV' }),
  ).not.toBeVisible({ timeout: 5000 });
}

test.describe(
  'Bulk Create Users from CSV — validation',
  { tag: ['@credential', '@functional', '@fr-1818'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    // ── Valid CSVs ──────────────────────────────────────────────────────────

    test('admin can upload a full CSV with all fields and see 5 valid rows', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '01-valid-all-fields.csv');
      expect(await getStat(page, 'rows loaded')).toBe(5);
      expect(await getStat(page, 'with errors')).toBe(0);
      expect(await getStat(page, 'ready to create')).toBe(5);
      await expect(
        page.getByRole('button', { name: /Create \d+ user/ }),
      ).toBeEnabled();
      await closeModal(page);
    });

    test('admin can upload a minimal CSV (required fields only) and see 3 valid rows', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '02-valid-minimal.csv');
      expect(await getStat(page, 'rows loaded')).toBe(3);
      expect(await getStat(page, 'with errors')).toBe(0);
      await expect(
        page.getByRole('button', { name: /Create \d+ user/ }),
      ).toBeEnabled();
      await closeModal(page);
    });

    test('admin can upload a CSV with column aliases and see 2 valid rows', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '03-valid-column-aliases.csv');
      expect(await getStat(page, 'rows loaded')).toBe(2);
      expect(await getStat(page, 'with errors')).toBe(0);
      await closeModal(page);
    });

    test('admin can upload a CSV covering all roles and see 4 valid rows', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '04-valid-all-roles.csv');
      expect(await getStat(page, 'rows loaded')).toBe(4);
      expect(await getStat(page, 'with errors')).toBe(0);
      await closeModal(page);
    });

    test('admin can upload a CSV covering all statuses and see 4 valid rows', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '05-valid-all-statuses.csv');
      expect(await getStat(page, 'rows loaded')).toBe(4);
      expect(await getStat(page, 'with errors')).toBe(0);
      await closeModal(page);
    });

    test('admin can upload a CSV with RFC-4180 quoted fields and see 3 valid rows', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '13-valid-quoted-fields.csv');
      expect(await getStat(page, 'rows loaded')).toBe(3);
      expect(await getStat(page, 'with errors')).toBe(0);
      await closeModal(page);
    });

    test('admin can upload a CSV with various need_password_change values and see 5 valid rows', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '14-valid-need-password-change.csv');
      expect(await getStat(page, 'rows loaded')).toBe(5);
      expect(await getStat(page, 'with errors')).toBe(0);
      await closeModal(page);
    });

    // ── Error CSVs ─────────────────────────────────────────────────────────

    test('admin cannot submit when CSV rows have missing required fields', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '06-error-missing-required.csv');
      expect(await getStat(page, 'rows loaded')).toBe(4);
      expect(await getStat(page, 'with errors')).toBeGreaterThan(0);
      await expect(
        page.getByRole('button', { name: /Create \d+ user/ }),
      ).toBeDisabled();
      await closeModal(page);
    });

    test('admin cannot submit when CSV has invalid email formats', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '07-error-invalid-email.csv');
      expect(await getStat(page, 'with errors')).toBe(4);
      expect(await getStat(page, 'ready to create')).toBe(1);
      await expect(
        page.getByRole('button', { name: /Create \d+ user/ }),
      ).toBeDisabled();
      await closeModal(page);
    });

    test('admin cannot submit when CSV has duplicate emails', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '08-error-duplicate-email.csv');
      expect(await getStat(page, 'with errors')).toBe(3);
      expect(await getStat(page, 'ready to create')).toBe(1);
      await expect(
        page.getByRole('button', { name: /Create \d+ user/ }),
      ).toBeDisabled();
      await closeModal(page);
    });

    test('admin cannot submit when CSV has invalid passwords', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '09-error-invalid-password.csv');
      expect(await getStat(page, 'with errors')).toBe(4);
      expect(await getStat(page, 'ready to create')).toBe(1);
      await expect(
        page.getByRole('button', { name: /Create \d+ user/ }),
      ).toBeDisabled();
      await closeModal(page);
    });

    test('admin cannot submit when CSV has invalid role or status values', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '10-error-invalid-role-status.csv');
      expect(await getStat(page, 'with errors')).toBe(3);
      expect(await getStat(page, 'ready to create')).toBe(1);
      await expect(
        page.getByRole('button', { name: /Create \d+ user/ }),
      ).toBeDisabled();
      await closeModal(page);
    });

    // ── Edge cases ─────────────────────────────────────────────────────────

    test('admin can filter to errors-only view in a mixed CSV', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '11-mixed-valid-and-errors.csv');
      const dialog = page.getByRole('dialog', {
        name: 'Bulk Create Users from CSV',
      });
      const totalRows = await getStat(page, 'rows loaded');
      expect(totalRows).toBeGreaterThan(0);
      const errorCount = await getStat(page, 'with errors');
      expect(errorCount).toBeGreaterThan(0);

      // Toggle "Only show errors"
      await dialog.getByRole('switch').click();
      const rows = dialog.locator('table tbody tr:not(.ant-table-measure-row)');
      await expect.poll(() => rows.count(), { timeout: 5000 }).toBe(errorCount);
      await closeModal(page);
    });

    test('admin sees an error message when CSV is missing a required column', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '12-error-missing-required-columns.csv');
      // Toast error — Ant Design message renders in .ant-message
      await expect(page.locator('.ant-message-notice')).toBeVisible({
        timeout: 5000,
      });
      // Preview stats should NOT appear (no file loaded into state)
      const dialog = page.getByRole('dialog', {
        name: 'Bulk Create Users from CSV',
      });
      await expect(dialog.getByText('rows loaded')).not.toBeVisible({
        timeout: 3000,
      });
      await closeModal(page);
    });

    test('admin sees a warning when CSV file has only headers and no data rows', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '15-error-empty-file.csv');
      await expect(page.locator('.ant-message-notice')).toBeVisible({
        timeout: 5000,
      });
      const dialog = page.getByRole('dialog', {
        name: 'Bulk Create Users from CSV',
      });
      await expect(dialog.getByText('rows loaded')).not.toBeVisible({
        timeout: 3000,
      });
      await closeModal(page);
    });

    // ── Export-CSV round-trip scenarios ──────────────────────────────────────

    test('admin can import an export-style CSV using field keys (status_info, project_name)', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '16-export-field-keys.csv');
      expect(await getStat(page, 'rows loaded')).toBe(3);
      expect(await getStat(page, 'with errors')).toBe(0);
      expect(await getStat(page, 'ready to create')).toBe(3);
      await expect(
        page.getByRole('button', { name: /Create \d+ user/ }),
      ).toBeEnabled();
      await closeModal(page);
    });

    test('admin can import an export CSV with extra unsupported columns (uuid, created_at, …)', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '17-export-extra-unsupported-columns.csv');
      expect(await getStat(page, 'rows loaded')).toBe(2);
      expect(await getStat(page, 'with errors')).toBe(0);
      // Unsupported export columns are ignored: their headers must not appear.
      const dialog = page.getByRole('dialog', {
        name: 'Bulk Create Users from CSV',
      });
      await expect(
        dialog.locator('thead').getByText('uuid', { exact: true }),
      ).not.toBeVisible();
      await closeModal(page);
    });

    test('admin can import an export CSV with reordered columns and a UTF-8 BOM', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '20-export-reordered-with-bom.csv');
      expect(await getStat(page, 'rows loaded')).toBe(2);
      expect(await getStat(page, 'with errors')).toBe(0);
      await closeModal(page);
    });

    test('admin can load a passwordless export CSV; rows show per-row password errors and submit is disabled', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '18-export-no-password-column.csv');
      // The passwordless CSV still loads — password is validated per row.
      expect(await getStat(page, 'rows loaded')).toBe(2);
      // Both rows lack a password → per-row errors, none ready to create.
      expect(await getStat(page, 'with errors')).toBe(2);
      expect(await getStat(page, 'ready to create')).toBe(0);
      // The submit button stays disabled while any row has a password error.
      await expect(
        page.getByRole('button', { name: /Create \d+ user/ }),
      ).toBeDisabled();
      // No blocking toast for this load.
      await expect(page.locator('.ant-message-notice')).not.toBeVisible();
      await closeModal(page);
    });

    test('admin filling the global default password reactively updates the preview and enables submit', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);
      await uploadCSV(page, '18-export-no-password-column.csv');
      // Loads with per-row password errors; submit disabled.
      expect(await getStat(page, 'with errors')).toBe(2);
      await expect(
        page.getByRole('button', { name: /Create \d+ user/ }),
      ).toBeDisabled();

      // Typing a valid default password in the left "Global defaults" form fills
      // the empty passwords reactively — the preview re-validates with no
      // re-upload (the table is derived live from the global defaults).
      const dialog = page.getByRole('dialog', {
        name: 'Bulk Create Users from CSV',
      });
      // Anchor off the visible "Password" form label rather than the password
      // input's internal class, so the locator stays unambiguous even if another
      // password input is added later.
      const defaultPasswordInput = dialog
        .locator('.ant-form-item')
        .filter({ has: page.getByText('Password', { exact: true }) })
        .locator('input');
      await defaultPasswordInput.fill('Password!23');

      // Preview updates live: per-row password errors clear, all rows ready,
      // and the Create button enables. Poll both stats — the recalculation is
      // driven by React re-render, so read after it settles.
      await expect.poll(() => getStat(page, 'with errors')).toBe(0);
      await expect.poll(() => getStat(page, 'ready to create')).toBe(2);
      await expect(
        page.getByRole('button', { name: /Create \d+ user/ }),
      ).toBeEnabled();
      await closeModal(page);
    });
  },
);
