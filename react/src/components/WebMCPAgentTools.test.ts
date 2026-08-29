/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3767: the `/admin/agent` agent-list tools — the rows they flatten out of
 * the page's Relay fragment, and what each handler answers.
 */
import type { WebMCPAgentToolsFragment$data } from '../__generated__/WebMCPAgentToolsFragment.graphql';
import { findRowById } from '../helper/webmcpAdminPageTools';
import type { WebMCPTool } from '../hooks/useWebMCPTool';
import { agentRows, createAgentTools } from './WebMCPAgentTools';
import type { CallToolResult } from '@mcp-b/webmcp-types';
import { describe, expect, it } from 'vitest';

const agents = [
  {
    id: 'QWdlbnROb2RlOmktMDAx',
    row_id: 'i-001',
    addr: 'tcp://10.0.0.1:6001',
    region: 'local/amd64',
    architecture: 'x86_64',
    status: 'ALIVE',
    scaling_group: 'default',
    schedulable: true,
    first_contact: '2026-08-01T00:00:00+00:00',
    occupied_slots: '{"cpu": "4", "mem": "8589934592"}',
    available_slots: '{"cpu": "16", "mem": "34359738368"}',
  },
  {
    id: 'QWdlbnROb2RlOmktMDAy',
    row_id: 'i-002',
    addr: 'tcp://10.0.0.2:6001',
    region: 'local/amd64',
    architecture: 'x86_64',
    status: 'TERMINATED',
    scaling_group: 'default',
    schedulable: false,
    first_contact: '2026-08-02T00:00:00+00:00',
    occupied_slots: null,
    available_slots: 'not json',
  },
] as unknown as WebMCPAgentToolsFragment$data;

const run = (tool: WebMCPTool): CallToolResult =>
  tool.execute({}, {} as never) as CallToolResult;

describe('agentRows', () => {
  it('flattens the fragment onto the columns the table shows', () => {
    expect(agentRows(agents)[0]).toEqual({
      id: 'QWdlbnROb2RlOmktMDAx',
      agent_id: 'i-001',
      endpoint: 'tcp://10.0.0.1:6001',
      region: 'local/amd64',
      architecture: 'x86_64',
      status: 'ALIVE',
      resource_group: 'default',
      schedulable: true,
      first_contact: '2026-08-01T00:00:00+00:00',
      occupied_slots: { cpu: '4', mem: '8589934592' },
      available_slots: { cpu: '16', mem: '34359738368' },
    });
  });

  it('reports unparseable / absent resource slots as null', () => {
    expect(agentRows(agents)[1]).toMatchObject({
      occupied_slots: null,
      available_slots: null,
    });
  });
});

describe('agent page tools', () => {
  const rows = agentRows(agents);
  const [listTool, currentTool, filterTool] = createAgentTools(
    { rows, count: 2, page: 1, pageSize: 10, sort: '-first_contact' },
    {
      current: findRowById(rows, 'QWdlbnROb2RlOmktMDAy'),
      webui_path: null,
    },
    {
      filter: 'schedulable == "true"',
      status: 'ALIVE',
      tab: 'agents',
      current: 1,
      pageSize: 10,
    },
  );

  it('registers exactly the three read-only agent tools', () => {
    expect([listTool.name, currentTool.name, filterTool.name]).toEqual([
      'bai_list_visible_agent',
      'bai_get_current_agent',
      'bai_get_agent_filter',
    ]);
    expect(
      [listTool, currentTool, filterTool].every(
        (tool) => tool.annotations?.readOnlyHint === true,
      ),
    ).toBe(true);
  });

  it('lists the rendered rows with the count, page and sort', () => {
    expect(run(listTool).structuredContent).toMatchObject({
      count: 2,
      page: 1,
      pageSize: 10,
      sort: '-first_contact',
    });
    expect(
      (run(listTool).structuredContent as { rows: Array<{ agent_id: string }> })
        .rows,
    ).toHaveLength(2);
  });

  it('answers the open drawer with the row and a null webui_path', () => {
    expect(run(currentTool).structuredContent).toEqual({
      current: rows[1],
      webui_path: null,
    });
  });

  it('says agents have no deep link in the tool description', () => {
    expect(currentTool.description).toContain('webui_path is always null');
  });

  it('reports the list URL params', () => {
    expect(run(filterTool).structuredContent).toEqual({
      filter: 'schedulable == "true"',
      status: 'ALIVE',
      tab: 'agents',
      current: 1,
      pageSize: 10,
    });
  });
});
