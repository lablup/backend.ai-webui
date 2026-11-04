/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebMCPAgentListToolsTestQuery } from '../__generated__/WebMCPAgentListToolsTestQuery.graphql';
import WebMCPAgentListTools, { parseSlots } from './WebMCPAgentListTools';
import { render, waitFor } from '@testing-library/react';
import { BAIWebMCPProvider, type WebMCPToolDescriptor } from 'backend.ai-ui';
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

const registerTool =
  vi.fn<
    (tool: WebMCPToolDescriptor, options: { signal: AbortSignal }) => void
  >();

const globalId = (localId: string) => btoa(`AgentNode:${localId}`);

const TestRenderer: React.FC<{
  openedAgentId?: string;
  pending?: boolean;
}> = ({ openedAgentId, pending }) => {
  const data = useLazyLoadQuery<WebMCPAgentListToolsTestQuery>(
    graphql`
      query WebMCPAgentListToolsTestQuery @relay_test_operation {
        agent_nodes(first: 10) {
          edges {
            node {
              ...WebMCPAgentListToolsFragment
            }
          }
        }
      }
    `,
    {},
  );
  return (
    <WebMCPAgentListTools
      agentsFrgmt={_.compact(_.map(data.agent_nodes?.edges, 'node'))}
      page={1}
      pageSize={10}
      total={1}
      pending={pending}
      viewParams={{ tab: 'agents', status: 'ALIVE' }}
      openedAgentId={openedAgentId}
    />
  );
};

const renderTools = ({
  openedAgentId,
  pending,
}: { openedAgentId?: string; pending?: boolean } = {}) => {
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Query: () => ({
        agent_nodes: {
          edges: [
            {
              node: {
                id: globalId('i-agent-a'),
                row_id: 'i-agent-a',
                addr: '10.0.0.1:6001',
                region: 'local',
                architecture: 'x86_64',
                version: '26.9.0',
                first_contact: '2026-09-25T00:00:00Z',
                lost_at: null,
                occupied_slots: '{"cpu":"2"}',
                available_slots: 'not json',
                scaling_group: 'default',
                status: 'ALIVE',
                schedulable: true,
              },
            },
          ],
        },
      }),
    }),
  );
  return render(
    <RelayEnvironmentProvider environment={environment}>
      <MemoryRouter initialEntries={['/admin/resources']}>
        <BAIWebMCPProvider enabled>
          <Suspense fallback={null}>
            <TestRenderer openedAgentId={openedAgentId} pending={pending} />
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
    get: () => ({ registerTool }),
  });
});

afterEach(() => {
  delete (document as { modelContext?: unknown }).modelContext;
});

describe('WebMCPAgentListTools', () => {
  it('lists agents with parsed slots and only the default columns', async () => {
    renderTools();
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    const result = (await toolNamed('bai_list_visible_agent').execute({})) as {
      rows: Array<Record<string, unknown>>;
    };
    expect(result.rows[0]).toMatchObject({
      id: 'i-agent-a',
      endpoint: '10.0.0.1:6001',
      occupiedSlots: { cpu: '2' },
      availableSlots: null,
      resourceGroup: 'default',
    });
    expect(result.rows[0]).not.toHaveProperty('version');
  });

  it('reports the open agent from its rendered row', async () => {
    renderTools({ openedAgentId: globalId('i-agent-a') });
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_get_current_agent').execute({}),
    ).resolves.toMatchObject({
      current: { id: 'i-agent-a', status: 'ALIVE', path: null },
    });
  });

  it('reports the local id of an open agent that left the page', async () => {
    renderTools({ openedAgentId: globalId('i-agent-gone') });
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_get_current_agent').execute({}),
    ).resolves.toEqual({ current: { id: 'i-agent-gone', path: null } });
  });

  it('answers null when no drawer is open', async () => {
    renderTools();
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_get_current_agent').execute({}),
    ).resolves.toEqual({ current: null });
  });

  it('flags results while the page loads a new view', async () => {
    renderTools({ pending: true });
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_list_visible_agent').execute({}),
    ).resolves.toMatchObject({ pending: true });
    await expect(
      toolNamed('bai_get_agent_filter').execute({}),
    ).resolves.toMatchObject({ pending: true });
  });
});

describe('parseSlots', () => {
  it('parses a JSON object and rejects anything else', () => {
    expect(parseSlots('{"mem":"1g"}')).toEqual({ mem: '1g' });
    expect(parseSlots('[1]')).toBeNull();
    expect(parseSlots('nope')).toBeNull();
    expect(parseSlots(null)).toBeNull();
  });
});
