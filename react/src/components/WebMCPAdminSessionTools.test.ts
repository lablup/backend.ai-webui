/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3767: the `/admin/session` tools. The page has no session detail route —
 * the drawer is the `sessionDetail` search param (FR-3759) — so
 * `bai_get_current_session` resolves its deep link through `resourcePath`.
 */
import type { WebMCPAdminSessionToolsFragment$data } from '../__generated__/WebMCPAdminSessionToolsFragment.graphql';
import type { WebMCPTool } from '../hooks/useWebMCPTool';
import {
  createAdminSessionTools,
  currentSessionItem,
  sessionRows,
} from './WebMCPAdminSessionTools';
import type { CallToolResult } from '@mcp-b/webmcp-types';
import { describe, expect, it } from 'vitest';

const sessions = [
  {
    id: 'Q29tcHV0ZVNlc3Npb25Ob2RlOmFiYw==',
    row_id: 'abc',
    name: 'training-1',
    status: 'RUNNING',
    type: 'batch',
    scaling_group: 'default',
    project_id: 'p-1',
    user_id: 'u-1',
    created_at: '2026-08-20T10:00:00+00:00',
  },
  {
    id: 'Q29tcHV0ZVNlc3Npb25Ob2RlOmRlZg==',
    row_id: 'def',
    name: 'notebook-1',
    status: 'TERMINATED',
    type: 'interactive',
    scaling_group: 'default',
    project_id: 'p-2',
    user_id: 'u-2',
    created_at: '2026-08-21T10:00:00+00:00',
  },
] as unknown as WebMCPAdminSessionToolsFragment$data;

const run = (tool: WebMCPTool): CallToolResult =>
  tool.execute({}, {} as never) as CallToolResult;

describe('sessionRows', () => {
  it('flattens the fragment onto the columns the admin table shows', () => {
    expect(sessionRows(sessions)[0]).toEqual({
      id: 'Q29tcHV0ZVNlc3Npb25Ob2RlOmFiYw==',
      session_id: 'abc',
      name: 'training-1',
      status: 'RUNNING',
      type: 'batch',
      resource_group: 'default',
      project_id: 'p-1',
      user_id: 'u-1',
      created_at: '2026-08-20T10:00:00+00:00',
    });
  });
});

describe('currentSessionItem', () => {
  const rows = sessionRows(sessions);

  it('resolves the sessionDetail param to its row and deep link', () => {
    expect(currentSessionItem(rows, 'def')).toEqual({
      current: rows[1],
      webui_path: '/session?sessionDetail=def',
    });
  });

  it('is null on both keys when the drawer is closed', () => {
    expect(currentSessionItem(rows, null)).toEqual({
      current: null,
      webui_path: null,
    });
  });

  it('still reports the deep link when the id is off the current page', () => {
    expect(currentSessionItem(rows, 'ghi')).toEqual({
      current: null,
      webui_path: '/session?sessionDetail=ghi',
    });
  });
});

describe('admin session page tools', () => {
  const rows = sessionRows(sessions);
  const [listTool, currentTool, filterTool] = createAdminSessionTools(
    { rows, count: 37, page: 2, pageSize: 10, sort: '-created_at' },
    currentSessionItem(rows, 'abc'),
    {
      filter: 'name ilike "%train%"',
      status: 'running',
      tab: 'batch',
      current: 2,
      pageSize: 10,
    },
  );

  it('registers exactly the three read-only session tools', () => {
    expect([listTool.name, currentTool.name, filterTool.name]).toEqual([
      'bai_list_visible_session',
      'bai_get_current_session',
      'bai_get_session_filter',
    ]);
    expect(
      [listTool, currentTool, filterTool].every(
        (tool) => tool.annotations?.readOnlyHint === true,
      ),
    ).toBe(true);
    expect(listTool.inputSchema).toEqual({
      type: 'object',
      properties: {},
      additionalProperties: false,
    });
  });

  it('lists the rendered rows with the count, page and sort', () => {
    expect(run(listTool).structuredContent).toEqual({
      rows,
      count: 37,
      page: 2,
      pageSize: 10,
      sort: '-created_at',
    });
  });

  it('answers the open drawer with its row and the session ref path', () => {
    expect(run(currentTool).structuredContent).toEqual({
      current: rows[0],
      webui_path: '/session?sessionDetail=abc',
    });
  });

  it('reports the status category and the session-type tab', () => {
    expect(run(filterTool).structuredContent).toEqual({
      filter: 'name ilike "%train%"',
      status: 'running',
      tab: 'batch',
      current: 2,
      pageSize: 10,
    });
  });
});
