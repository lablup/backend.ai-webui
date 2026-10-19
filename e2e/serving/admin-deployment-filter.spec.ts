// Covers the filters on Admin Settings > Deployments > Deployments tab: the
// Owner (`createdUserId`) filter added in #9639 (FR-3914) and the tag-click
// filter fixed in #10175 (FR-4169), and the Label key / Label value filters
// added in #10166.
import {
  createAdminApiContext,
  deleteDeploymentViaApi,
  findDeploymentByName,
  listDeploymentsByPattern,
  setDeploymentTagsViaApi,
} from '../utils/admin-api';
import {
  createDeploymentShell,
  escapeForRegExp,
} from '../utils/deployment-fixtures';
import { skipUnlessLabelableEntityType } from '../utils/feature-gate-util';
import {
  loginAsAdmin,
  navigateTo,
  userInfo,
  webuiEndpoint,
} from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

const ADMIN_DEPLOYMENTS_URL = `${webuiEndpoint}/admin/deployments?tab=deployments`;

// The `e2e-plan-` prefix is what `sweepLeftoverDeploymentsViaApi` (global
// teardown) removes, so an interrupted run cannot leak this deployment.
const DEPLOYMENT_PREFIX = 'e2e-plan-owner-';
const TAG_DEPLOYMENT_PREFIX = 'e2e-plan-tag-';
const LABEL_DEPLOYMENT_PREFIX = 'e2e-plan-label-';

// The Owner filter value is a `BAIUserSelect` rendered inside the PowerSearch
// edit popover; it stages the picked user and the popover's Apply commits it.
async function applyOwnerFilter(page: Page, email: string): Promise<void> {
  const searchBar = page.getByRole('combobox', { name: 'Search filters' });
  const typeahead = page.getByRole('listbox', { name: 'Search results' });
  // Removing a chip leaves the typeahead open, where a click would toggle it
  // closed again, so only click when it is not already showing.
  await expect(async () => {
    if (!(await typeahead.isVisible())) await searchBar.click();
    await expect(typeahead).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 15000 });
  await typeahead.getByRole('option', { name: 'Owner', exact: true }).click();
  await page.getByRole('button', { name: 'Owner', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Search options' })
    .fill(email.split('@')[0]);
  await page
    .getByRole('option', { name: new RegExp(`^${escapeForRegExp(email)}`) })
    .click();
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page).toHaveURL(/createdUserId/);
  // Committing hands focus back to the search bar, which reopens the field
  // typeahead over the table; close it so it does not cover the rows.
  await page.keyboard.press('Escape');
  await expect(typeahead).toBeHidden();
}

// The Tags column is hidden by default; turn it on through Table Settings.
async function showTagsColumn(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Table Settings' }).click();
  const settings = page
    .getByRole('dialog')
    .filter({ has: page.getByRole('checkbox', { name: 'Tags' }) });
  await expect(settings).toBeVisible();
  await settings.getByRole('checkbox', { name: 'Tags' }).setChecked(true);
  await settings.getByRole('button', { name: 'Apply' }).click();
  await expect(settings).toBeHidden({ timeout: 30000 });
}

// Adds a free-text condition from the PowerSearch typeahead; its edit popover
// commits the typed value with Apply. Returns once the list query that Apply
// triggers has answered and the grid has left its busy state, since the list
// keeps showing the previous rows while the deferred refetch is in flight.
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
  const refetch = page.waitForResponse(
    (response) =>
      (response.request().postData() ?? '').includes('AdminDeploymentQuery'),
    { timeout: 20000 },
  );
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await refetch;
  await page.keyboard.press('Escape');
  await expect(typeahead).toBeHidden();
  await expect(
    page.locator('.uic-data-grid__body[aria-busy="true"]'),
  ).toHaveCount(0, { timeout: 20000 });
}

test.describe(
  'Admin Deployments - Filters',
  {
    tag: ['@serving', '@admin', '@regression', '@requires-manager-v26.4'],
  },
  () => {
    let deploymentName: string;
    // Further deployments a test creates; afterEach removes them too.
    let extraDeploymentNames: string[];

    test.beforeEach(async ({ page, request }) => {
      deploymentName = `${DEPLOYMENT_PREFIX}${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      extraDeploymentNames = [];
      await loginAsAdmin(page, request);
    });

    test.afterEach(async () => {
      const api = await createAdminApiContext();
      try {
        for (const name of [deploymentName, ...extraDeploymentNames]) {
          const leftovers = await listDeploymentsByPattern(
            api,
            new RegExp(`^${escapeForRegExp(name)}$`),
          ).catch(() => []);
          for (const { id } of leftovers) {
            await deleteDeploymentViaApi(api, id).catch(() => {});
          }
        }
      } finally {
        await api.dispose();
      }
    });

    test('Admin can filter deployments by owner', async ({ page }) => {
      // Arrange: a deployment owned by the admin account.
      await navigateTo(page, 'deployments');
      await createDeploymentShell(page, deploymentName);

      await page.goto(ADMIN_DEPLOYMENTS_URL);
      const createdRow = page.getByRole('row', {
        name: new RegExp(escapeForRegExp(deploymentName)),
      });
      await expect(createdRow).toBeVisible({ timeout: 30000 });

      // Act: filter by the admin as owner.
      await applyOwnerFilter(page, userInfo.admin.email);

      // The condition chip reads as the owner's email, not the user UUID.
      const filterGroup = page.getByRole('group', { name: 'Search filters' });
      await expect(
        filterGroup.getByRole('button', {
          name: 'Owner: equals',
          exact: true,
        }),
      ).toBeVisible();
      await expect(filterGroup).toContainText(userInfo.admin.email);
      await expect(filterGroup).not.toContainText(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
      );

      // Only the admin's deployments remain, including the one just created.
      await expect(createdRow).toBeVisible({ timeout: 30000 });
      const ownerHeaderIndex = await page
        .getByRole('columnheader')
        .evaluateAll((headers) =>
          headers.findIndex((h) => h.textContent?.trim() === 'Owner'),
        );
      expect(ownerHeaderIndex).toBeGreaterThanOrEqual(0);
      const ownerCells = page
        .locator('tbody tr')
        .locator(`td:nth-child(${ownerHeaderIndex + 1})`);
      await expect(ownerCells.first()).toBeVisible();
      for (const owner of await ownerCells.allTextContents()) {
        expect(owner.trim()).toBe(userInfo.admin.email);
      }

      // Switching the owner to another user drops the admin's deployment.
      await filterGroup
        .getByRole('button', { name: 'Remove Owner: equals' })
        .click();
      await expect(page).not.toHaveURL(/createdUserId/);
      await applyOwnerFilter(page, userInfo.user.email);
      await expect(filterGroup).toContainText(userInfo.user.email);
      await expect(createdRow).toBeHidden({ timeout: 30000 });
      for (const owner of await ownerCells.allTextContents()) {
        expect(owner.trim()).not.toBe(userInfo.admin.email);
      }
    });

    test('Admin can filter deployments by clicking a tag', async ({ page }) => {
      // Arrange: one deployment tagged exactly `tag`, and one tagged
      // `${tag}-large`, which only a substring match would pick up.
      const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const tag = `e2e-tag-${suffix}`;
      const exactName = `${TAG_DEPLOYMENT_PREFIX}exact-${suffix}`;
      const similarName = `${TAG_DEPLOYMENT_PREFIX}large-${suffix}`;
      const tagsByName: Record<string, string[]> = {
        [exactName]: [tag],
        [similarName]: [`${tag}-large`],
      };
      extraDeploymentNames.push(exactName, similarName);
      for (const name of Object.keys(tagsByName)) {
        await navigateTo(page, 'deployments');
        await createDeploymentShell(page, name);
      }
      const api = await createAdminApiContext();
      try {
        for (const [name, tags] of Object.entries(tagsByName)) {
          const deployment = await findDeploymentByName(api, name);
          if (!deployment) throw new Error(`deployment "${name}" not found`);
          await setDeploymentTagsViaApi(api, deployment.id, tags);
        }
      } finally {
        await api.dispose();
      }

      const rowOf = (name: string) =>
        page.getByRole('row', { name: new RegExp(escapeForRegExp(name)) });
      await page.goto(ADMIN_DEPLOYMENTS_URL);
      await showTagsColumn(page);
      await expect(rowOf(exactName)).toBeVisible({ timeout: 30000 });
      await expect(rowOf(similarName)).toBeVisible({ timeout: 30000 });

      // Act: click the tag in the Tags column.
      await rowOf(exactName)
        .getByRole('button', { name: tag, exact: true })
        .click();

      // The filter shows the tag and matches it exactly.
      const filterGroup = page.getByRole('group', { name: 'Search filters' });
      await expect(filterGroup).toContainText(tag);
      await expect(rowOf(exactName)).toBeVisible({ timeout: 30000 });
      await expect(rowOf(similarName)).toBeHidden({ timeout: 30000 });
    });

    test(
      'Admin can filter deployments by label',
      { tag: ['@functional', '@requires-manager-v26.9'] },
      async ({ page }) => {
        await skipUnlessLabelableEntityType(
          page,
          'deployment',
          'Deployment labels require a manager that accepts deployment labels (#10166)',
        );
        // Arrange: a deployment with a label no other deployment carries.
        const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const labelDeploymentName = `${LABEL_DEPLOYMENT_PREFIX}${suffix}`;
        extraDeploymentNames.push(labelDeploymentName);
        const labelKey = `e2e-env-${suffix}`;
        const labelValue = 'prod';
        const labelText = `${labelKey}=${labelValue}`;
        await navigateTo(page, 'deployments');
        await createDeploymentShell(page, labelDeploymentName);
        const detailUrl = page.url();

        await page.goto(ADMIN_DEPLOYMENTS_URL);
        const row = page.getByRole('row', {
          name: new RegExp(escapeForRegExp(labelDeploymentName)),
        });
        await expect(row).toBeVisible({ timeout: 30000 });

        // Act: edit the deployment's labels from the Labels column's hover
        // action.
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

        // A Label value the deployment does not carry filters it out, so the
        // value condition is not ignored.
        await applyTextFilter(page, 'Label key', labelKey);
        await expect(row).toBeVisible({ timeout: 30000 });
        await applyTextFilter(page, 'Label value', 'e2e-no-match');
        await expect(row).toBeHidden({ timeout: 30000 });

        // Filtering by Label key and Label value leaves only that deployment.
        await page.goto(ADMIN_DEPLOYMENTS_URL);
        await expect(row).toBeVisible({ timeout: 30000 });
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
        const labelsTerm = page
          .getByRole('term')
          .filter({ hasText: /^Labels$/ });
        await expect(labelsTerm).toBeVisible({ timeout: 30000 });
        await expect(
          labelsTerm.locator('xpath=following-sibling::dd[1]'),
        ).toContainText(labelText);
      },
    );
  },
);
