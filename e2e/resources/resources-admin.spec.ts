// spec: e2e/.agent-output/test-plan-e2e-coverage-gaps.md
//
// Coverage gap this file fills: the admin Resources page's "Storages" and
// "Resource Group" sub-tabs, and the separate "Scheduler" page, previously had
// zero render-smoke coverage (visual_regression, which used to cover layout,
// is fully disabled). e2e/agent/agent.spec.ts already covers the "Agent" tab
// in depth, so that tab is only smoke-checked here (tab exists / can be
// switched to) to avoid duplicating that file's assertions.
//
// All scenarios in this file are read-only: no resource is created, modified,
// or deleted.
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect } from '@playwright/test';

// The Resources and Scheduler routes render inside the "Admin Settings"
// nested layout, which is consistently slow to hydrate on the shared QA264
// cluster (confirmed live, and matches e2e/crawl/route-crawl.spec.ts's
// SLOW_LANDMARK_TIMEOUT for these exact two routes) -- a bare 5s default
// `expect` times out flakily on the first landmark of each route, so the
// first assertion on each route below uses a generous explicit timeout.
const SLOW_LANDMARK_TIMEOUT = 30_000;

test.describe(
  'Resources Admin Page',
  { tag: ['@regression', '@resources', '@functional', '@admin'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test(
      'Admin can view and switch between Agent, Storages, and Resource Group tabs',
      { tag: ['@smoke'] },
      async ({ page }) => {
        // 1. Navigate to /agent (Resources page).
        await navigateTo(page, 'agent');

        // 2. Verify the breadcrumb reads "Resources" and all three tabs are present.
        await expect(
          page.getByTestId('webui-breadcrumb').getByText('Resources'),
        ).toBeVisible({ timeout: SLOW_LANDMARK_TIMEOUT });
        await expect(
          page.getByRole('tab', { name: 'Agent', selected: true }),
        ).toBeVisible({ timeout: SLOW_LANDMARK_TIMEOUT });
        await expect(page.getByRole('tab', { name: 'Storages' })).toBeVisible();
        await expect(
          page.getByRole('tab', { name: 'Resource Group' }),
        ).toBeVisible();

        // 3. Switch to the Storages tab and confirm it becomes selected.
        await page.getByRole('tab', { name: 'Storages' }).click();
        await expect(
          page.getByRole('tab', { name: 'Storages', selected: true }),
        ).toBeVisible();

        // 4. Switch to the Resource Group tab and confirm it becomes selected.
        await page.getByRole('tab', { name: 'Resource Group' }).click();
        await expect(
          page.getByRole('tab', { name: 'Resource Group', selected: true }),
        ).toBeVisible();
      },
    );

    test('Admin can view storage backend columns in the Storages tab', async ({
      page,
    }) => {
      // 1. Navigate to /agent and wait for the page to hydrate.
      await navigateTo(page, 'agent');
      await expect(
        page.getByTestId('webui-breadcrumb').getByText('Resources'),
      ).toBeVisible({ timeout: SLOW_LANDMARK_TIMEOUT });

      // 2. Click the Storages tab.
      await page.getByRole('tab', { name: 'Storages' }).click();

      // 3. Verify the expected column headers and that the table renders.
      await expect(page.getByRole('table')).toBeVisible({
        timeout: SLOW_LANDMARK_TIMEOUT,
      });
      await expect(
        page.getByRole('columnheader', { name: 'ID / Endpoint' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Backend Type' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Resources' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Capabilities' }),
      ).toBeVisible();
    });

    test('Admin can view the default resource group in the Resource Group tab', async ({
      page,
    }) => {
      // 1. Navigate to /agent and wait for the page to hydrate.
      await navigateTo(page, 'agent');
      await expect(
        page.getByTestId('webui-breadcrumb').getByText('Resources'),
      ).toBeVisible({ timeout: SLOW_LANDMARK_TIMEOUT });

      // 2. Click the Resource Group tab.
      await page.getByRole('tab', { name: 'Resource Group' }).click();

      // 3. Verify the expected column headers.
      await expect(
        page.getByRole('columnheader', { name: 'Name' }),
      ).toBeVisible({ timeout: SLOW_LANDMARK_TIMEOUT });
      await expect(
        page.getByRole('columnheader', { name: 'Description' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Public' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Driver' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Scheduler' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'App Proxy Server Address' }),
      ).toBeVisible();

      // 4. Verify the pre-existing "default" resource group row renders.
      // Scoped on the Description cell's text (rather than the bare "default"
      // Name cell) to avoid any ambiguity with other rows/columns.
      await expect(
        page
          .getByRole('row')
          .filter({ hasText: 'The default agent scaling group' }),
      ).toBeVisible();
    });
  },
);

test.describe(
  'Scheduler Page',
  { tag: ['@regression', '@resources', '@functional', '@admin'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test(
      'Admin can view the Fair Share Setting tab on the Scheduler page',
      { tag: ['@smoke'] },
      async ({ page }) => {
        // 1. Navigate to /scheduler.
        await navigateTo(page, 'scheduler');

        // 2. Verify the breadcrumb reads "Scheduler" and the "Fair Share
        // Setting" tab renders (selected by default, since it's the only tab).
        await expect(
          page.getByTestId('webui-breadcrumb').getByText('Scheduler'),
        ).toBeVisible({ timeout: SLOW_LANDMARK_TIMEOUT });
        await expect(
          page.getByRole('tab', { name: 'Fair Share Setting', selected: true }),
        ).toBeVisible({ timeout: SLOW_LANDMARK_TIMEOUT });
      },
    );
  },
);
