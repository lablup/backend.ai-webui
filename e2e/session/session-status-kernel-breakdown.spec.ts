// spec: covers the multi-node kernel breakdown hover card from #9648 (FR-3924)
//
// A cluster session only sits in CREATING/TERMINATING for seconds on a live
// cluster, so the session list is mocked: one 3-kernel session mid-startup and
// one single-node session, both transitional.
import { loginAsUser, navigateTo } from '../utils/test-util';
import { setupGraphQLMocks } from './mocking/graphql-interceptor';
import {
  createMockSessionNode,
  sessionListMockResponse,
} from './mocking/session-list-mock';
import { test, expect, type Page } from '@playwright/test';

const MULTI_NODE_SESSION_NAME = 'e2e-mock-multi-node-creating';
const SINGLE_NODE_SESSION_NAME = 'e2e-mock-single-node-pending';
const RESCHEDULED_REASON =
  'This session was preempted and returned to the queue; it will be scheduled again automatically.';

function mockKernelEdge(sessionKey: string, index: number, status: string) {
  const rowId = `mock-kernel-${sessionKey}-${index}`;
  return {
    __typename: 'KernelEdge',
    node: {
      __typename: 'KernelNode',
      id: btoa(`KernelNode:${rowId}`),
      row_id: rowId,
      live_stat: null,
      cluster_role: index === 0 ? 'main' : 'sub',
      cluster_hostname: index === 0 ? 'main1' : `sub${index}`,
      cluster_idx: index,
      status,
      status_info: null,
      agent_id: 'mock-agent-001',
      container_id: null,
      image: null,
    },
  };
}

function mockSessionNode(
  key: string,
  name: string,
  status: string,
  kernelStatuses: ReadonlyArray<string>,
  overrides: Record<string, unknown> = {},
) {
  const rowId = `mock-session-${key}`;
  return createMockSessionNode({
    id: btoa(`ComputeSessionNode:${rowId}`),
    row_id: rowId,
    name,
    status,
    cluster_mode: kernelStatuses.length > 1 ? 'MULTI_NODE' : 'SINGLE_NODE',
    cluster_size: kernelStatuses.length,
    kernel_nodes: {
      __typename: 'KernelConnection',
      edges: kernelStatuses.map((kernelStatus, index) =>
        mockKernelEdge(key, index, kernelStatus),
      ),
    },
    ...overrides,
  });
}

async function openSessionListWithMockedSessions(page: Page) {
  await setupGraphQLMocks(page, {
    ComputeSessionListPageQuery: () =>
      sessionListMockResponse([
        mockSessionNode('multi', MULTI_NODE_SESSION_NAME, 'CREATING', [
          'RUNNING',
          'CREATING',
          'PULLING',
        ]),
        mockSessionNode(
          'single',
          SINGLE_NODE_SESSION_NAME,
          'PENDING',
          ['PENDING'],
          { status_info: 'RESCHEDULED' },
        ),
      ]),
  });
  await navigateTo(page, 'session');
}

function statusBadgeOf(page: Page, sessionName: string, status: string) {
  return page
    .getByRole('row')
    .filter({
      has: page.getByRole('button', { name: sessionName, exact: true }),
    })
    .getByText(status, { exact: true });
}

test.describe(
  'Session status badge - kernel breakdown hover card',
  { tag: ['@regression', '@session', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
    });

    test('User can see the per-kernel status breakdown when hovering a creating multi-node session badge', async ({
      page,
    }) => {
      await openSessionListWithMockedSessions(page);

      const badge = statusBadgeOf(page, MULTI_NODE_SESSION_NAME, 'CREATING');
      await expect(badge).toBeVisible({ timeout: 15000 });
      await badge.hover();

      const breakdown = page.getByRole('group', {
        name: 'Kernel startup progress',
      });
      await expect(breakdown).toBeVisible();
      await expect(breakdown.getByText('1 / 3', { exact: true })).toBeVisible();

      // The bar draws only non-empty buckets; the legend lists every bucket
      // of the creating phase, PENDING at zero.
      for (const status of ['RUNNING', 'CREATING', 'PULLING']) {
        await expect(
          breakdown.getByTestId(`kernel-progress-segment-${status}`),
        ).toBeVisible();
      }
      await expect(
        breakdown.getByTestId('kernel-progress-segment-PENDING'),
      ).toHaveCount(0);
      for (const [status, count] of [
        ['RUNNING', '1'],
        ['CREATING', '1'],
        ['PULLING', '1'],
        ['PENDING', '0'],
      ]) {
        const legendRow = breakdown
          .getByText(status, { exact: true })
          .locator('xpath=../..');
        await expect(legendRow).toContainText(count);
      }
    });

    test('User can see only the status reason tooltip when hovering a single-node session badge', async ({
      page,
    }) => {
      await openSessionListWithMockedSessions(page);

      const badge = statusBadgeOf(page, SINGLE_NODE_SESSION_NAME, 'PENDING');
      await expect(badge).toBeVisible({ timeout: 15000 });
      await badge.hover();

      await expect(page.getByText(RESCHEDULED_REASON)).toBeVisible();
      await expect(
        page.getByRole('group', { name: 'Kernel startup progress' }),
      ).toHaveCount(0);
    });
  },
);
