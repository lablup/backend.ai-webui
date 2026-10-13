// Covers the tag-click filter on Admin Settings > Deployments fixed in #10175
// (FR-4169): a Tags-column click reloads the list within the current scope,
// a detail-page tag opens the Running list, and tags match exactly.
import {
  createAdminApiContext,
  deleteDeploymentViaApi,
  findDeploymentByName,
  setDeploymentTagsViaApi,
} from '../utils/admin-api';
import {
  createDeploymentShell,
  escapeForRegExp,
} from '../utils/deployment-fixtures';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

const ADMIN_DEPLOYMENTS_PATH = 'admin/deployments?tab=deployments';

// `e2e-plan-` is what the global teardown's deployment sweep removes.
const TAG_DEPLOYMENT_PREFIX = 'e2e-plan-tag-';

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

test.describe(
  'Admin Deployments - Tag filter',
  {
    tag: ['@serving', '@admin', '@regression', '@requires-manager-v26.4'],
  },
  () => {
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
      // Three UI-created deployments plus the wait for STOPPED.
      test.setTimeout(300_000);
      const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      tag = `e2e-tag-${suffix}`;
      runningName = `${TAG_DEPLOYMENT_PREFIX}run-${suffix}`;
      similarName = `${TAG_DEPLOYMENT_PREFIX}sim-${suffix}`;
      terminatedName = `${TAG_DEPLOYMENT_PREFIX}end-${suffix}`;
      await loginAsAdmin(page, request);

      const tagsByName: Record<string, string[]> = {
        [runningName]: [tag],
        [similarName]: [`${tag}-large`],
        [terminatedName]: [tag],
      };
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
        const terminated = await findDeploymentByName(api, terminatedName);
        await deleteDeploymentViaApi(api, terminated!.id);
        // Deleting goes through STOPPING, which still counts as Running.
        await expect
          .poll(
            async () =>
              (await findDeploymentByName(api, terminatedName))?.status,
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
        for (const name of [runningName, similarName, terminatedName]) {
          const deployment = await findDeploymentByName(api, name).catch(
            () => null,
          );
          if (deployment) await deleteDeploymentViaApi(api, deployment.id);
        }
      } finally {
        await api.dispose();
      }
    });

    test('Admin can filter deployments by clicking a tag', async ({ page }) => {
      await navigateTo(page, ADMIN_DEPLOYMENTS_PATH);
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
      await navigateTo(page, ADMIN_DEPLOYMENTS_PATH);
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
      await navigateTo(page, ADMIN_DEPLOYMENTS_PATH);
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
