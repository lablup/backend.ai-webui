// Covers the entity labels on the Data page added in #10166: editing a
// folder's labels, filtering by a label token, and the bulk Add labels action.
import { cleanupVFolderSafely } from '../utils/cleanup-util';
import {
  createVFolderAndVerify,
  getVFolderRow,
  loginAsUser,
  navigateTo,
  selectPropertyFilter,
} from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

// The Labels column on the Data page starts hidden; turn it on through Table
// Settings.
async function showLabelsColumn(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Table Settings' }).click();
  const settings = page
    .getByRole('dialog')
    .filter({ has: page.getByRole('checkbox', { name: 'Labels' }) });
  await expect(settings).toBeVisible();
  await settings.getByRole('checkbox', { name: 'Labels' }).setChecked(true);
  await settings.getByRole('button', { name: 'Apply' }).click();
  await expect(settings).toBeHidden({ timeout: 30000 });
}

async function fillLabelAndSave(
  page: Page,
  dialogTitle: string | RegExp,
  key: string,
  value: string,
): Promise<void> {
  const modal = page.getByRole('dialog', { name: dialogTitle });
  await expect(modal).toBeVisible();
  await modal.getByRole('textbox', { name: 'Key' }).fill(key);
  await modal.getByRole('textbox', { name: 'Value' }).fill(value);
  await modal.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Labels saved.').first()).toBeVisible();
  await expect(modal).toBeHidden({ timeout: 30000 });
}

const uniqueSuffix = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

// Not serial: each test creates its own uniquely named folders and removes
// them in afterEach.
test.describe(
  'VFolder Labels',
  {
    tag: ['@vfolder', '@functional', '@regression', '@requires-manager-v26.9'],
  },
  () => {
    test.setTimeout(240_000);
    let labelFolderNames: string[];

    test.beforeEach(async ({ page, request }) => {
      labelFolderNames = [];
      await loginAsUser(page, request);
    });

    test.afterEach(async ({ page }) => {
      for (const name of labelFolderNames) {
        await cleanupVFolderSafely(page, name);
      }
    });

    test('User can edit labels on a folder and filter the list by a label', async ({
      page,
    }) => {
      const folderName = `e2e-test-folder-label-${uniqueSuffix()}`;
      labelFolderNames.push(folderName);
      await createVFolderAndVerify(page, folderName);

      await navigateTo(page, 'data');
      await showLabelsColumn(page);
      await selectPropertyFilter(page, 'Name', folderName);
      const row = getVFolderRow(page, folderName);
      await expect(row).toBeVisible({ timeout: 30000 });

      // Act: Edit labels is a hover action whose area has no width until its
      // cell is hovered.
      await row
        .getByRole('cell')
        .filter({ has: page.getByRole('button', { name: 'Edit labels' }) })
        .hover();
      await row.getByRole('button', { name: 'Edit labels' }).click();
      await fillLabelAndSave(page, 'Edit labels', 'env', 'prod');

      const labelToken = row.getByRole('button', {
        name: 'env=prod',
        exact: true,
      });
      await expect(labelToken).toBeVisible({ timeout: 30000 });

      // Clicking the token filters the list by that label.
      await labelToken.click();
      const filterGroup = page
        .getByRole('group', { name: 'Search filters' })
        .first();
      await expect(
        filterGroup.getByRole('button', { name: /^Label key/ }),
      ).toBeVisible();
      await expect(
        filterGroup.getByRole('button', { name: /^Label value/ }),
      ).toBeVisible();
      await expect(row).toBeVisible({ timeout: 30000 });
      const rows = page.locator('tbody tr').filter({ hasText: /\S/ });
      for (const text of await rows.allTextContents()) {
        expect(text).toContain('env=prod');
      }
    });

    test('User can add labels to multiple selected folders', async ({
      page,
    }) => {
      const suffix = uniqueSuffix();
      const prefix = `e2e-test-folder-bulk-label-${suffix}`;
      labelFolderNames.push(`${prefix}-a`, `${prefix}-b`);
      for (const name of labelFolderNames) {
        await createVFolderAndVerify(page, name);
      }
      const labelValue = suffix.slice(-11);

      await navigateTo(page, 'data');
      await showLabelsColumn(page);
      await selectPropertyFilter(page, 'Name', prefix);
      const rows = labelFolderNames.map((name) => getVFolderRow(page, name));
      for (const row of rows) {
        await expect(row).toBeVisible({ timeout: 30000 });
        await row.getByRole('checkbox').check();
      }

      // Act: add one label to both through the selection toolbar.
      await page.getByRole('button', { name: 'Add labels' }).click();
      await fillLabelAndSave(
        page,
        'Add labels (2 selected)',
        'e2e-bulk',
        labelValue,
      );

      for (const row of rows) {
        await expect(
          row.getByRole('button', {
            name: `e2e-bulk=${labelValue}`,
            exact: true,
          }),
        ).toBeVisible({ timeout: 30000 });
      }
    });
  },
);
