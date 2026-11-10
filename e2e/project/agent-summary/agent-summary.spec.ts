// spec: Agent Summary page tests
import {
  createAdminApiContext,
  createResourceGroupViaApi,
  deleteResourceGroupViaApi,
  sweepStaleResourceGroupsViaApi,
} from '../../utils/admin-api';
import {
  getSortableColumnHeader,
  loginAsAdmin,
  navigateTo,
} from '../../utils/test-util';
import test, { expect, type Page } from '@playwright/test';

test.describe(
  'Agent Summary',
  { tag: ['@functional', '@agent-summary'] },
  () => {
    test('Admin can see Agent Summary page with expected columns', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'agent-summary');

      // Verify Agent Summary tab is selected. `BAITabList` / Astryx `TabList`
      // renders a `nav[aria-label="Tabs"]` of plain `<button>`s — `role="tab"`
      // is never emitted — and marks the active one with `aria-current="true"`.
      const agentSummaryTab = page
        .getByRole('navigation', { name: 'Tabs' })
        .getByRole('button', { name: 'Agent Summary' });
      await expect(agentSummaryTab).toBeVisible();
      await expect(agentSummaryTab).toHaveAttribute('aria-current', 'true');

      // Verify table columns
      await expect(
        page.getByRole('columnheader', { name: 'ID' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Architecture' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Allocation' }),
      ).toBeVisible();
      // "Resource Group" is sortable — its columnheader's accessible name is
      // overridden by the sort button's aria-label ("Sort by scaling_group"),
      // so match the visible text instead (see getSortableColumnHeader).
      await expect(
        getSortableColumnHeader(page, 'Resource Group'),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Schedulable' }),
      ).toBeVisible();

      // Verify Connected/Terminated radio filter
      const radioGroup = page.getByRole('radiogroup');
      await expect(radioGroup).toBeVisible();
      await expect(
        radioGroup.getByText('Connected', { exact: true }),
      ).toBeVisible();
      await expect(radioGroup.getByText('Terminated')).toBeVisible();
    });

    test('Admin can switch between Connected and Terminated agents', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'agent-summary');

      // Click Terminated
      await page.getByText('Terminated').click();

      // Verify the table is still visible (may show "No data")
      await expect(
        page.getByRole('columnheader', { name: 'ID' }),
      ).toBeVisible();

      // Switch back to Connected
      await page.getByText('Connected', { exact: true }).click();

      // Table should still be visible
      await expect(
        page.getByRole('columnheader', { name: 'ID' }),
      ).toBeVisible();
    });
  },
);

const MOCK_INACTIVE_AGENTS = [
  { rowId: 'e2e-lost-agent', status: 'LOST' },
  { rowId: 'e2e-restarting-agent', status: 'RESTARTING' },
];

// Serves the Inactive tab's AgentListQuery from a real ALIVE agent re-labelled
// LOST / RESTARTING, so every fragment field the page reads is present.
async function mockInactiveAgentList(
  page: Page,
  state: { filters: string[]; templateMissing: boolean },
) {
  await page.route('**/admin/gql', async (route) => {
    const request = route.request();
    const body = request.postDataJSON?.() as
      { query?: string; variables?: Record<string, any> } | undefined;
    if (
      request.method() !== 'POST' ||
      !body?.query?.match(/query\s+AgentListQuery\b/)
    ) {
      await route.continue();
      return;
    }
    const filter: string = body.variables?.filter ?? '';
    state.filters.push(filter);
    if (!filter.includes('status != "ALIVE"')) {
      await route.continue();
      return;
    }
    const response = await route.fetch({
      postData: JSON.stringify({
        ...body,
        variables: {
          ...body.variables,
          filter: filter.replace('status != "ALIVE"', 'status == "ALIVE"'),
        },
      }),
    });
    const json = await response.json();
    const template = json?.data?.agent_nodes?.edges?.[0]?.node;
    if (!template) {
      state.templateMissing = true;
      await route.fulfill({ response, json });
      return;
    }
    const edges = MOCK_INACTIVE_AGENTS.map(({ rowId, status }) => ({
      ...json.data.agent_nodes.edges[0],
      node: {
        ...template,
        id: Buffer.from(`AgentNode:${rowId}`).toString('base64'),
        row_id: rowId,
        status,
      },
    }));
    await route.fulfill({
      response,
      json: {
        ...json,
        data: {
          ...json.data,
          agent_nodes: { ...json.data.agent_nodes, edges, count: edges.length },
        },
      },
    });
  });
}

test.describe(
  'Agent List - Status Tabs',
  { tag: ['@regression', '@agent-summary', '@functional'] },
  () => {
    test('Admin can list LOST and RESTARTING agents in the Inactive tab', async ({
      page,
      request,
    }) => {
      // The superadmin intro tour (AdminViewSwitchTour) otherwise covers the page.
      await page.addInitScript(() => {
        localStorage.setItem(
          'backendaiwebui.settings.user.has_opened_tour_back_to_user_view',
          'true',
        );
        localStorage.setItem(
          'backendaiwebui.settings.user.has_opened_tour_back_to_admin_settings',
          'true',
        );
      });
      const mockState = { filters: [] as string[], templateMissing: false };
      await mockInactiveAgentList(page, mockState);
      await loginAsAdmin(page, request);
      // An old `?status=TERMINATED` link still opens the second tab.
      await navigateTo(page, 'agent?status=TERMINATED');

      const agentList = page.getByTestId('agent-list');
      const statusTabs = agentList.getByRole('radiogroup');
      const connectedTab = statusTabs.getByRole('radio', { name: 'Connected' });
      const inactiveTab = statusTabs.getByRole('radio', { name: 'Inactive' });
      await expect(connectedTab).toBeVisible();
      await expect(inactiveTab).toBeChecked();
      await expect(
        statusTabs.getByRole('radio', { name: 'Terminated' }),
      ).toHaveCount(0);

      await expect
        .poll(() =>
          mockState.filters.some((f) => f.includes('status != "ALIVE"')),
        )
        .toBe(true);
      expect(
        mockState.templateMissing,
        'needs at least one ALIVE agent to clone into the mocked rows',
      ).toBe(false);
      for (const { rowId, status } of MOCK_INACTIVE_AGENTS) {
        const row = agentList.getByRole('row').filter({ hasText: rowId });
        await expect(row).toBeVisible();
        await expect(row.getByText(status, { exact: true })).toBeVisible();
      }

      await connectedTab.click();
      await expect(connectedTab).toBeChecked();
      // ALIVE is the default, so it is dropped from the URL.
      await expect(page).not.toHaveURL(/[?&]status=/);
      await expect(
        agentList.getByRole('row').filter({ hasText: 'e2e-lost-agent' }),
      ).toHaveCount(0);

      await inactiveTab.click();
      await expect(inactiveTab).toBeChecked();
      await expect(page).toHaveURL(/[?&]status=INACTIVE\b/);
      await expect(
        agentList.getByRole('row').filter({ hasText: 'e2e-restarting-agent' }),
      ).toBeVisible();
      await page.unrouteAll({ behavior: 'ignoreErrors' });
    });
  },
);

// A dedicated, agent-less group: editing its defaults cannot change how
// sessions other specs launch are scheduled.
const RESOURCE_GROUP_PREFIX = 'e2e-rg-detail-';

async function openResourceGroupDrawer(page: Page, name: string) {
  // The superadmin intro tour (AdminViewSwitchTour) otherwise covers the page.
  await page.addInitScript(() => {
    localStorage.setItem(
      'backendaiwebui.settings.user.has_opened_tour_back_to_user_view',
      'true',
    );
    localStorage.setItem(
      'backendaiwebui.settings.user.has_opened_tour_back_to_admin_settings',
      'true',
    );
  });
  await navigateTo(page, 'agent?tab=resourceGroup');
  // The list pages at 10 groups; a bare search term filters it by name.
  const searchFilter = page.getByRole('combobox', { name: 'Search filters' });
  await searchFilter.fill(name);
  await searchFilter.press('Enter');
  await page.getByRole('button', { name, exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Resource Group Info' });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText(name, { exact: true })).toBeVisible();
  return drawer;
}

test.describe(
  'Resource Group Detail Drawer',
  {
    tag: [
      '@regression',
      '@agent-summary',
      '@functional',
      '@requires-manager-v26.4',
    ],
  },
  () => {
    let resourceGroupName: string;
    let created = false;

    test.beforeEach(async () => {
      created = false;
      resourceGroupName = `${RESOURCE_GROUP_PREFIX}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const api = await createAdminApiContext();
      try {
        await sweepStaleResourceGroupsViaApi(
          api,
          new RegExp(`^${RESOURCE_GROUP_PREFIX}`),
        );
        await createResourceGroupViaApi(api, resourceGroupName);
        created = true;
      } finally {
        await api.dispose();
      }
    });

    // Best-effort: a leftover group is swept by the next run's beforeEach.
    test.afterEach(async () => {
      if (!created) return;
      try {
        const api = await createAdminApiContext();
        try {
          if (!(await deleteResourceGroupViaApi(api, resourceGroupName))) {
            console.warn(
              `[agent-summary] could not delete resource group ${resourceGroupName}`,
            );
          }
        } finally {
          await api.dispose().catch(() => {});
        }
      } catch (error) {
        console.warn(
          `[agent-summary] resource group cleanup failed for ${resourceGroupName}:`,
          error,
        );
      }
    });

    test('Superadmin can open the resource group detail drawer and see the default option tabs', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      const drawer = await openResourceGroupDrawer(page, resourceGroupName);

      const tabs = drawer.getByRole('navigation', { name: 'Tabs' });
      const sessionTab = tabs.getByRole('button', {
        name: /^Default Session Options/,
      });
      const deploymentTab = tabs.getByRole('button', {
        name: /^Default Deployment Options/,
      });
      await expect(sessionTab).toBeVisible();
      await expect(deploymentTab).toBeVisible();

      // The session tab is active on open.
      await expect(sessionTab).toHaveAttribute('aria-current', 'true');
      await expect(
        drawer.getByRole('heading', { name: 'Session Execution Options' }),
      ).toBeVisible();
      await expect(
        drawer.getByRole('heading', { name: 'Scheduler Options' }),
      ).toBeVisible();

      await deploymentTab.click();
      await expect(deploymentTab).toHaveAttribute('aria-current', 'true');
      await expect(
        drawer.getByRole('heading', { name: 'Session Execution Options' }),
      ).toBeHidden();
      await expect(
        drawer.getByRole('heading', { name: 'Handler Options' }),
      ).toBeVisible();
    });

    test('Superadmin can edit the default session options of a resource group', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      const drawer = await openResourceGroupDrawer(page, resourceGroupName);

      const schedulerSection = drawer
        .locator('.bai-rg-options-section')
        .filter({
          has: page.getByRole('heading', { name: 'Scheduler Options' }),
        });
      // 10 is the manager's default priority for a new resource group.
      await expect(
        schedulerSection.getByText('10', { exact: true }),
      ).toBeVisible();
      // The edit button is revealed on hover.
      await schedulerSection.hover();
      await schedulerSection.getByRole('button', { name: 'Edit' }).click();

      const modal = page.getByRole('dialog', {
        name: 'Edit Default Session Options',
      });
      await expect(modal).toBeVisible();
      // Every option is replaced on save; an image would be required as soon
      // as any session execution value is set, so edit a scheduler option.
      const priority = modal.getByRole('spinbutton', { name: 'Priority' });
      await expect(priority).toHaveValue('10');
      await priority.fill('42');
      await modal.getByRole('button', { name: 'Save' }).click();

      await expect(modal).toBeHidden();
      await expect(
        page
          .getByRole('region', { name: 'Notifications' })
          .getByText('Default options saved.'),
      ).toBeVisible();
      await expect(
        schedulerSection.getByText('42', { exact: true }),
      ).toBeVisible();
    });
  },
);
