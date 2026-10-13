// Covers the tag-click filter on Admin Settings > Deployments fixed in #10175
// (FR-4169): a Tags-column click reloads the list within the current scope,
// a detail-page tag opens the Running list, and tags match exactly.
import {
  createAdminApiContext,
  deleteDeploymentViaApi,
  gqlAdmin,
  listDeploymentsByPattern,
  setDeploymentTagsViaApi,
} from '../utils/admin-api';
import {
  createDeploymentShell,
  escapeForRegExp,
} from '../utils/deployment-fixtures';
import { loginAsAdmin, navigateTo, webuiEndpoint } from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

const ADMIN_DEPLOYMENTS_URL = `${webuiEndpoint}/admin/deployments?tab=deployments`;

// `e2e-plan-` is what the global teardown's deployment sweep removes.
const TAG_DEPLOYMENT_PREFIX = 'e2e-plan-tag-';

async function showTagsColumn(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Table Settings' }).click();
  const settings = page.getByRole('dialog');
  await expect(settings).toBeVisible();
  await settings.getByRole('checkbox', { name: 'Tags' }).setChecked(true);
  await settings.getByRole('button', { name: 'Apply' }).click();
  await expect(settings).toBeHidden({ timeout: 30000 });
}

test.describe(
  'Admin Deployments - Tag filter',
  {
    tag: ['@serving', '@admin', '@regression', '@requires-manager-v26.4'],
  },
  () => {
    let suffix: string;
    let tag: string;
    // Tagged `tag`, still running.
    let runningName: string;
    // Tagged `${tag}-large`, which only a substring match would pick up.
    let similarName: string;
    // Tagged `tag`, deleted so it sits in the Terminated scope.
    let terminatedName: string;

    const rowOf = (page: Page, name: string) =>
      page.getByRole('row', { name: new RegExp(escapeForRegExp(name)) });

    test.beforeEach(async ({ page, request }) => {
      suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      tag = `e2e-tag-${suffix}`;
      runningName = `${TAG_DEPLOYMENT_PREFIX}run-${suffix}`;
      similarName = `${TAG_DEPLOYMENT_PREFIX}sim-${suffix}`;
      terminatedName = `${TAG_DEPLOYMENT_PREFIX}end-${suffix}`;
      await loginAsAdmin(page, request);

      for (const name of [runningName, similarName, terminatedName]) {
        await navigateTo(page, 'deployments');
        await createDeploymentShell(page, name);
      }

      const api = await createAdminApiContext();
      try {
        const created = await listDeploymentsByPattern(
          api,
          new RegExp(
            `^${TAG_DEPLOYMENT_PREFIX}\\w+-${escapeForRegExp(suffix)}$`,
          ),
        );
        const idOf = (name: string) => {
          const found = created.find((d) => d.name === name);
          if (!found) throw new Error(`deployment "${name}" was not created`);
          return found.id;
        };
        await setDeploymentTagsViaApi(api, idOf(runningName), [tag]);
        await setDeploymentTagsViaApi(api, idOf(similarName), [`${tag}-large`]);
        await setDeploymentTagsViaApi(api, idOf(terminatedName), [tag]);
        await deleteDeploymentViaApi(api, idOf(terminatedName));
        // Deleting goes through STOPPING, which still counts as Running.
        await expect
          .poll(
            async () => {
              const data = await gqlAdmin(
                api,
                `query($name: String!) {
                  adminDeployments(filter: { name: { equals: $name } }) {
                    edges { node { metadata { status } } }
                  }
                }`,
                { name: terminatedName },
              );
              return data.adminDeployments?.edges?.[0]?.node.metadata.status;
            },
            { timeout: 120_000, intervals: [2000] },
          )
          .toBe('STOPPED');
      } finally {
        await api.dispose();
      }
    });

    test.afterEach(async () => {
      const api = await createAdminApiContext();
      try {
        const leftovers = await listDeploymentsByPattern(
          api,
          new RegExp(
            `^${TAG_DEPLOYMENT_PREFIX}\\w+-${escapeForRegExp(suffix)}$`,
          ),
        );
        for (const { id } of leftovers) {
          await deleteDeploymentViaApi(api, id);
        }
      } finally {
        await api.dispose();
      }
    });

    test('Admin can filter deployments by clicking a tag', async ({ page }) => {
      await page.goto(ADMIN_DEPLOYMENTS_URL);
      await showTagsColumn(page);
      await expect(rowOf(page, runningName)).toBeVisible({ timeout: 30000 });
      await expect(rowOf(page, similarName)).toBeVisible({ timeout: 30000 });

      await rowOf(page, runningName)
        .getByRole('button', { name: tag, exact: true })
        .click();

      const filterGroup = page.getByRole('group', { name: 'Search filters' });
      await expect(filterGroup).toContainText(tag);
      await expect(page.getByRole('radio', { name: 'Running' })).toBeChecked();
      await expect(rowOf(page, runningName)).toBeVisible({ timeout: 30000 });
      await expect(rowOf(page, similarName)).toBeHidden({ timeout: 30000 });
      await expect(rowOf(page, terminatedName)).toBeHidden();
    });

    test('Admin can filter terminated deployments by clicking a tag', async ({
      page,
    }) => {
      await page.goto(ADMIN_DEPLOYMENTS_URL);
      await showTagsColumn(page);
      await page.getByRole('radio', { name: 'Terminated' }).check();
      await expect(rowOf(page, terminatedName)).toBeVisible({
        timeout: 30000,
      });

      await rowOf(page, terminatedName)
        .getByRole('button', { name: tag, exact: true })
        .click();

      const filterGroup = page.getByRole('group', { name: 'Search filters' });
      await expect(filterGroup).toContainText(tag);
      await expect(
        page.getByRole('radio', { name: 'Terminated' }),
      ).toBeChecked();
      await expect(rowOf(page, terminatedName)).toBeVisible({
        timeout: 30000,
      });
      await expect(rowOf(page, runningName)).toBeHidden();
      await expect(rowOf(page, similarName)).toBeHidden();
    });

    test('Admin can open the running deployment list filtered by a tag from the deployment detail', async ({
      page,
    }) => {
      await page.goto(ADMIN_DEPLOYMENTS_URL);
      const runningRow = rowOf(page, runningName);
      await expect(runningRow).toBeVisible({ timeout: 30000 });
      await runningRow.getByText(runningName, { exact: true }).click();
      await expect(
        page.getByRole('heading', { level: 3, name: runningName }),
      ).toBeVisible({ timeout: 20000 });

      await page.getByRole('button', { name: tag, exact: true }).click();

      await expect(page).toHaveURL(/\/admin\/deployments\?.*filter=/);
      const filterGroup = page.getByRole('group', { name: 'Search filters' });
      await expect(filterGroup).toContainText(tag);
      await expect(page.getByRole('radio', { name: 'Running' })).toBeChecked();
      await expect(rowOf(page, runningName)).toBeVisible({ timeout: 30000 });
      await expect(rowOf(page, terminatedName)).toBeHidden();
      await expect(rowOf(page, similarName)).toBeHidden();
    });
  },
);
