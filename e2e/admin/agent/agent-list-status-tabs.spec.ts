// The admin Agents page status tabs. Split from
// e2e/project/agent-summary/agent-summary.spec.ts.
import { loginAsAdmin, navigateTo } from '../../utils/test-util';
import test, { expect, type Page } from '@playwright/test';

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
