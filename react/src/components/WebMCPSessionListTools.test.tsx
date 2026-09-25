/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebMCPSessionListToolsTestQuery } from '../__generated__/WebMCPSessionListToolsTestQuery.graphql';
import WebMCPSessionListTools from './WebMCPSessionListTools';
import { render, waitFor } from '@testing-library/react';
import {
  BAIWebMCPProvider,
  type BAITableColumnOverrideRecord,
  type WebMCPToolDescriptor,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { MemoryRouter } from 'react-router-dom';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../hooks')>()),
  useSuspendedBackendaiClient: () => ({ _config: { hideAgents: false } }),
}));
vi.mock('../hooks/backendai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../hooks/backendai')>()),
  useCurrentUserRole: () => 'user',
}));

const registerTool =
  vi.fn<
    (tool: WebMCPToolDescriptor, options: { signal: AbortSignal }) => void
  >();
const modelContextGetter = vi.fn(() => ({ registerTool }));

const SESSION_A = '11111111-1111-1111-1111-111111111111';
const SESSION_B = '22222222-2222-2222-2222-222222222222';

const TestRenderer: React.FC<{
  columnOverrides?: BAITableColumnOverrideRecord;
}> = ({ columnOverrides }) => {
  const data = useLazyLoadQuery<WebMCPSessionListToolsTestQuery>(
    graphql`
      query WebMCPSessionListToolsTestQuery @relay_test_operation {
        compute_session_nodes(first: 10) {
          edges {
            node {
              ...WebMCPSessionListToolsFragment
            }
          }
        }
      }
    `,
    {},
  );
  return (
    <WebMCPSessionListTools
      sessionsFrgmt={_.compact(
        _.map(data.compute_session_nodes?.edges, 'node'),
      )}
      columnOverrides={columnOverrides}
      page={2}
      pageSize={10}
      total={12}
      viewParams={{
        type: 'batch',
        statusCategory: 'running',
        filter: 'name ilike "%train%"',
        order: null,
      }}
    />
  );
};

const renderTools = ({
  enabled = true,
  search = '',
  columnOverrides,
}: {
  enabled?: boolean;
  search?: string;
  columnOverrides?: BAITableColumnOverrideRecord;
} = {}) => {
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Query: () => ({
        compute_session_nodes: {
          edges: [
            {
              node: {
                id: 'g-a',
                row_id: SESSION_A,
                name: 'train',
                status: 'RUNNING',
                type: 'batch',
                agent_ids: ['i-agent'],
              },
            },
            {
              node: {
                id: 'g-b',
                row_id: SESSION_B,
                name: 'eval',
                status: 'PENDING',
                type: 'batch',
                agent_ids: [],
              },
            },
          ],
        },
      }),
    }),
  );
  return render(
    <RelayEnvironmentProvider environment={environment}>
      <MemoryRouter initialEntries={[`/project/default/session${search}`]}>
        <BAIWebMCPProvider enabled={enabled}>
          <Suspense fallback={null}>
            <TestRenderer columnOverrides={columnOverrides} />
          </Suspense>
        </BAIWebMCPProvider>
      </MemoryRouter>
    </RelayEnvironmentProvider>,
  );
};

const toolNamed = (name: string) =>
  registerTool.mock.calls.map(([tool]) => tool).find((t) => t.name === name)!;

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    get: modelContextGetter,
  });
});

afterEach(() => {
  delete (document as { modelContext?: unknown }).modelContext;
});

describe('WebMCPSessionListTools', () => {
  it('registers nothing and never probes the browser when WebMCP is off', async () => {
    const { container } = renderTools({ enabled: false });
    await waitFor(() => expect(container).toBeEmptyDOMElement());

    expect(modelContextGetter).not.toHaveBeenCalled();
    expect(registerTool).not.toHaveBeenCalled();
  });

  it('registers the read-only session triple', async () => {
    renderTools();

    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));
    expect(registerTool.mock.calls.map(([tool]) => tool.name).sort()).toEqual([
      'bai_get_current_session',
      'bai_get_session_filter',
      'bai_list_visible_session',
    ]);
    for (const [tool] of registerTool.mock.calls) {
      expect(tool.annotations).toEqual({
        readOnlyHint: true,
        untrustedContentHint: true,
      });
      expect(tool.inputSchema.additionalProperties).toBe(false);
    }
  });

  it('lists the rendered rows with only the columns shown by default', async () => {
    renderTools();
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_list_visible_session').execute({}),
    ).resolves.toEqual({
      rows: [
        {
          id: SESSION_A,
          name: 'train',
          status: 'RUNNING',
          agentIds: ['i-agent'],
        },
        { id: SESSION_B, name: 'eval', status: 'PENDING', agentIds: [] },
      ],
      count: 2,
      page: 2,
      pageSize: 10,
      total: 12,
    });
  });

  it('follows the user column settings', async () => {
    renderTools({
      columnOverrides: { type: { hidden: false }, status: { hidden: true } },
    });
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    const result = (await toolNamed('bai_list_visible_session').execute(
      {},
    )) as { rows: Array<Record<string, unknown>> };
    expect(result.rows[0]).toEqual({
      id: SESSION_A,
      name: 'train',
      type: 'batch',
      agentIds: ['i-agent'],
    });
  });

  it('reports the view as a path bai_navigate can reopen', async () => {
    renderTools();
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_get_session_filter').execute({}),
    ).resolves.toEqual({
      path: '/project/default/session?type=batch&statusCategory=running&filter=name+ilike+%22%25train%25%22&current=2&pageSize=10',
      searchParams: {
        type: 'batch',
        statusCategory: 'running',
        filter: 'name ilike "%train%"',
        current: '2',
        pageSize: '10',
      },
    });
  });

  it('reports the session whose drawer is open, or null', async () => {
    renderTools({ search: `?type=batch&sessionDetail=${SESSION_B}` });
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_get_current_session').execute({}),
    ).resolves.toEqual({
      current: {
        id: SESSION_B,
        name: 'eval',
        status: 'PENDING',
        agentIds: [],
        path: `/project/default/session?type=batch&sessionDetail=${SESSION_B}`,
      },
    });
  });

  it('answers null when no drawer is open', async () => {
    renderTools();
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_get_current_session').execute({}),
    ).resolves.toEqual({ current: null });
  });
});
