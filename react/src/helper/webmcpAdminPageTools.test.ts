/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3767: the three builders every admin page tool is made of — their names,
 * their read-only annotation, their argument-free schema literal and the
 * payloads their handlers answer with.
 */
import type { WebMCPTool } from '../hooks/useWebMCPTool';
import {
  createGetCurrentTool,
  createGetFilterTool,
  createListVisibleTool,
  findRowById,
  NO_ARGS_INPUT_SCHEMA,
  parseJsonColumn,
  webmcpRow,
} from './webmcpAdminPageTools';
import type { CallToolResult } from '@mcp-b/webmcp-types';
import { describe, expect, it } from 'vitest';

const rows = [
  { id: 'agent-1', agent_id: 'i-001', status: 'ALIVE' },
  { id: 'agent-2', agent_id: 'i-002', status: 'TERMINATED' },
];

const run = (tool: WebMCPTool): CallToolResult =>
  tool.execute({}, {} as never) as CallToolResult;

describe('createListVisibleTool', () => {
  const tool = createListVisibleTool('agent', 'the rendered agent rows', {
    rows,
    count: 42,
    page: 2,
    pageSize: 10,
    sort: '-first_contact',
  });

  it('is a read-only bai_list_visible_<noun> taking no arguments', () => {
    expect(tool.name).toBe('bai_list_visible_agent');
    expect(tool.annotations?.readOnlyHint).toBe(true);
    expect(tool.inputSchema).toEqual({
      type: 'object',
      properties: {},
      additionalProperties: false,
    });
    expect(tool.inputSchema).toBe(NO_ARGS_INPUT_SCHEMA);
  });

  it('answers with { rows, count, page, pageSize, sort }', () => {
    expect(run(tool).structuredContent).toEqual({
      rows,
      count: 42,
      page: 2,
      pageSize: 10,
      sort: '-first_contact',
    });
  });

  it('reports an absent sort as null rather than dropping the key', () => {
    const unsorted = createListVisibleTool('agent', 'd', {
      rows: [],
      count: 0,
      page: 1,
      pageSize: 10,
    });
    expect(run(unsorted).structuredContent).toMatchObject({ sort: null });
  });
});

describe('createGetCurrentTool', () => {
  it('is a read-only bai_get_current_<noun> carrying the deep link', () => {
    const tool = createGetCurrentTool('role', 'the open role', {
      current: { id: 'role-1', name: 'admin' },
      webui_path: '/admin/rbac?roleDetail=role-1',
    });

    expect(tool.name).toBe('bai_get_current_role');
    expect(tool.annotations?.readOnlyHint).toBe(true);
    expect(run(tool).structuredContent).toEqual({
      current: { id: 'role-1', name: 'admin' },
      webui_path: '/admin/rbac?roleDetail=role-1',
    });
  });

  it('keeps both keys when nothing is open', () => {
    const tool = createGetCurrentTool('user', 'the open user', {
      current: null,
      webui_path: null,
    });
    expect(run(tool).structuredContent).toEqual({
      current: null,
      webui_path: null,
    });
  });
});

describe('createGetFilterTool', () => {
  it('is a read-only bai_get_<noun>_filter over the page URL params', () => {
    const tool = createGetFilterTool('agent', 'the agent list URL state', {
      filter: 'schedulable == "true"',
      status: 'ALIVE',
      tab: 'agents',
      current: 3,
      pageSize: 20,
    });

    expect(tool.name).toBe('bai_get_agent_filter');
    expect(tool.annotations?.readOnlyHint).toBe(true);
    expect(run(tool).structuredContent).toEqual({
      filter: 'schedulable == "true"',
      status: 'ALIVE',
      tab: 'agents',
      current: 3,
      pageSize: 20,
    });
  });

  it('omits params the page does not have, but keeps explicit nulls', () => {
    const tool = createGetFilterTool('keypair', 'd', {
      filter: null,
      tab: 'credentials',
    });
    expect(run(tool).structuredContent).toEqual({
      filter: null,
      tab: 'credentials',
    });
  });
});

describe('row helpers', () => {
  it('webmcpRow drops undefined columns only', () => {
    expect(webmcpRow({ a: 1, b: null, c: undefined })).toEqual({
      a: 1,
      b: null,
    });
  });

  it('parseJsonColumn parses a JSON-string column, else null', () => {
    expect(parseJsonColumn('{"cpu":"4"}')).toEqual({ cpu: '4' });
    expect(parseJsonColumn('not json')).toBeNull();
    expect(parseJsonColumn('[1,2]')).toBeNull();
    expect(parseJsonColumn(null)).toBeNull();
    expect(parseJsonColumn(undefined)).toBeNull();
  });

  it('findRowById looks up by `id`, or by the column it is told', () => {
    expect(findRowById(rows, 'agent-2')).toEqual(rows[1]);
    expect(findRowById(rows, 'i-001', 'agent_id')).toEqual(rows[0]);
    expect(findRowById(rows, 'nope')).toBeNull();
    expect(findRowById(rows, null)).toBeNull();
  });
});
