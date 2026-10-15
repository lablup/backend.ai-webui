// Covers the Labels column, label editing and the Label key / Label value
// filters on Admin Settings > Deployments added in #10166.
import {
  createAdminApiContext,
  deleteDeploymentViaApi,
  listDeploymentsByPattern,
} from '../utils/admin-api';
import {
  createDeploymentShell,
  escapeForRegExp,
} from '../utils/deployment-fixtures';
import { loginAsAdmin, navigateTo, webuiEndpoint } from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

const ADMIN_DEPLOYMENTS_URL = `${webuiEndpoint}/admin/deployments?tab=deployments`;

// The `e2e-plan-` prefix is what `sweepLeftoverDeploymentsViaApi` (global
// teardown) removes, so an interrupted run cannot leak this deployment.
const LABEL_DEPLOYMENT_PREFIX = 'e2e-plan-label-';

// Adds a free-text condition from the PowerSearch typeahead; its edit popover
// commits the typed value with Apply.
async function applyTextFilter(
  page: Page,
  field: string,
  value: string,
): Promise<void> {
  const searchBar = page.getByRole('combobox', { name: 'Search filters' });
  const typeahead = page.getByRole('listbox', { name: 'Search results' });
  // A committed chip can cover the search bar's input, so open the typeahead
  // from the keyboard instead of clicking it.
  await expect(async () => {
    if (!(await typeahead.isVisible())) {
      await searchBar.focus();
      await searchBar.press('ArrowDown');
    }
    await expect(typeahead).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 15000 });
  await typeahead.getByRole('option', { name: field, exact: true }).click();
  await page.getByRole('textbox', { name: 'Value' }).fill(value);
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(typeahead).toBeHidden();
}

test.describe(
  'Admin Deployments - Label filter',
  {
    tag: ['@serving', '@admin', '@regression', '@requires-manager-v26.9'],
  },
  () => {
    let deploymentName: string;

    test.beforeEach(async ({ page, request }) => {
      deploymentName = `${LABEL_DEPLOYMENT_PREFIX}${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      await loginAsAdmin(page, request);
    });

    test.afterEach(async () => {
      const api = await createAdminApiContext();
      try {
        const leftovers = await listDeploymentsByPattern(
          api,
          new RegExp(`^${escapeForRegExp(deploymentName)}$`),
        ).catch(() => []);
        for (const { id } of leftovers) {
          await deleteDeploymentViaApi(api, id).catch(() => {});
        }
      } finally {
        await api.dispose();
      }
    });

    test('Admin can filter deployments by label', async ({ page }) => {
      // Arrange: a deployment with a label no other deployment carries.
      const labelKey = `e2e-env-${deploymentName.slice(LABEL_DEPLOYMENT_PREFIX.length)}`;
      const labelValue = 'prod';
      const labelText = `${labelKey}=${labelValue}`;
      await navigateTo(page, 'deployments');
      await createDeploymentShell(page, deploymentName);
      const detailUrl = page.url();

      await page.goto(ADMIN_DEPLOYMENTS_URL);
      const row = page.getByRole('row', {
        name: new RegExp(escapeForRegExp(deploymentName)),
      });
      await expect(row).toBeVisible({ timeout: 30000 });

      // Act: edit the deployment's labels from the Labels column's hover action.
      await row
        .getByRole('cell')
        .filter({ has: page.getByRole('button', { name: 'Edit labels' }) })
        .hover();
      await row.getByRole('button', { name: 'Edit labels' }).click();
      const modal = page.getByRole('dialog', { name: 'Edit labels' });
      await expect(modal).toBeVisible();
      await modal.getByRole('textbox', { name: 'Key' }).fill(labelKey);
      await modal.getByRole('textbox', { name: 'Value' }).fill(labelValue);
      await modal.getByRole('button', { name: 'Save' }).click();
      await expect(page.getByText('Labels saved.').first()).toBeVisible();
      await expect(modal).toBeHidden({ timeout: 30000 });
      await expect(
        row.getByRole('button', { name: labelText, exact: true }),
      ).toBeVisible({ timeout: 30000 });

      // Filtering by Label key and Label value leaves only that deployment.
      await applyTextFilter(page, 'Label key', labelKey);
      await applyTextFilter(page, 'Label value', labelValue);
      const filterGroup = page.getByRole('group', { name: 'Search filters' });
      await expect(filterGroup).toContainText(labelKey);
      await expect(row).toBeVisible({ timeout: 30000 });
      await expect(page.locator('tbody tr')).toHaveCount(1, {
        timeout: 30000,
      });

      // The detail page's Basic Information card shows the label too.
      await page.goto(detailUrl);
      const labelsTerm = page.getByRole('term').filter({ hasText: /^Labels$/ });
      await expect(labelsTerm).toBeVisible({ timeout: 30000 });
      await expect(
        labelsTerm.locator('xpath=following-sibling::dd[1]'),
      ).toContainText(labelText);
    });
  },
);
