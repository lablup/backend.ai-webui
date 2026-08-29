/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3766: `/session` registers three read-only tools whose answers are built
 * from the page's own rows, URL params and open detail drawer — and registers
 * nothing at all when `VITE_WEBMCP` is off.
 */
import { getModelContext, isWebMCPEnabled } from '../../helper/webmcp';
import type { WebMCPTool } from '../../hooks/useWebMCPTool';
import {
  SESSION_ROW_PROPERTIES,
  toSessionRow,
  useSessionListWebMCPTools,
  type SessionListWebMCPToolsInput,
} from './sessionListTools';
import type { CallToolResult, ModelContext } from '@mcp-b/webmcp-types';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../helper/webmcp', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../helper/webmcp')>();
  return {
    ...actual,
    isWebMCPEnabled: vi.fn(() => true),
    getModelContext: vi.fn(),
  };
});

const registerTool =
  vi.fn<
    (tool: WebMCPTool, options: { signal: AbortSignal }) => Promise<void>
  >();
const modelContext = { registerTool } as unknown as ModelContext;

const SESSIONS = [
  {
    id: 'Z2lkOjE=',
    row_id: 'aaaaaaaa-0000-0000-0000-000000000001',
    name: 'alpha',
    status: 'RUNNING',
    type: 'interactive',
    created_at: '2026-01-01T00:00:00+00:00',
    scaling_group: 'default',
  },
  {
    id: 'Z2lkOjI=',
    row_id: 'aaaaaaaa-0000-0000-0000-000000000002',
    name: 'beta',
    status: 'PREPARING',
    type: 'batch',
    created_at: '2026-01-02T00:00:00+00:00',
    scaling_group: 'gpu',
  },
];

const INPUT: SessionListWebMCPToolsInput = {
  sessions: SESSIONS,
  pagination: { current: 2, pageSize: 10, total: 42 },
  queryParams: {
    filter: 'name ilike "%a%"',
    statusCategory: 'running',
    order: '-created_at',
    type: 'interactive',
  },
  openedSessionId: null,
};

const render = (input: SessionListWebMCPToolsInput = INPUT) =>
  renderHook(() => useSessionListWebMCPTools(input));

/** The tools registered by the last render, by name. */
const registered = (): Record<string, WebMCPTool> =>
  Object.fromEntries(
    registerTool.mock.calls.map(([tool]) => [tool.name, tool] as const),
  );

const structured = (tool: WebMCPTool): unknown =>
  (tool.execute({}, {} as never) as CallToolResult).structuredContent;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(isWebMCPEnabled).mockReturnValue(true);
  vi.mocked(getModelContext).mockReturnValue(modelContext);
});

describe('useSessionListWebMCPTools', () => {
  it('registers exactly the three read-only session tools', () => {
    render();

    const tools = registered();
    expect(Object.keys(tools).sort()).toEqual([
      'bai_get_current_session',
      'bai_get_session_filter',
      'bai_list_visible_session',
    ]);
    Object.values(tools).forEach((tool) => {
      expect(tool.annotations?.readOnlyHint).toBe(true);
      expect(tool.inputSchema).toEqual({ type: 'object', properties: {} });
    });
  });

  it('answers bai_list_visible_session with the rendered rows and the page', () => {
    render();

    expect(structured(registered()['bai_list_visible_session'])).toEqual({
      rows: [toSessionRow(SESSIONS[0]), toSessionRow(SESSIONS[1])],
      count: 2,
      page: 2,
      pageSize: 10,
      total: 42,
    });
  });

  it('declares the row shape as a JSON-Schema literal', () => {
    render();

    expect(registered()['bai_list_visible_session'].outputSchema).toEqual({
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: SESSION_ROW_PROPERTIES,
            required: ['id'],
          },
        },
        count: { type: 'integer', description: 'Rows on this page.' },
        page: { type: 'integer', description: '1-based page number.' },
        pageSize: { type: 'integer' },
        total: {
          type: 'integer',
          description: 'Rows matching the filter across all pages.',
        },
      },
      required: ['rows', 'count', 'page', 'pageSize'],
    });
  });

  it('drops the columns the user hid, keeping the row identity', () => {
    // `resourceGroup` is the table's column key for the `scaling_group` field.
    render({
      ...INPUT,
      columnOverrides: { resourceGroup: { hidden: true }, type: {} },
    });

    const rows = (
      structured(registered()['bai_list_visible_session']) as {
        rows: Array<Record<string, unknown>>;
      }
    ).rows;
    expect(rows[0]).not.toHaveProperty('scaling_group');
    expect(rows[0]).toMatchObject({
      id: SESSIONS[0].row_id,
      type: 'interactive',
    });
  });

  it('mirrors the URL params in bai_get_session_filter', () => {
    render();

    expect(structured(registered()['bai_get_session_filter'])).toEqual({
      resource: 'session',
      filter: 'name ilike "%a%"',
      statusCategory: 'running',
      order: '-created_at',
      type: 'interactive',
      current: 2,
      pageSize: 10,
    });
  });

  it('omits params the URL does not carry', () => {
    render({
      ...INPUT,
      queryParams: { filter: '', statusCategory: 'finished' },
    });

    expect(structured(registered()['bai_get_session_filter'])).toEqual({
      resource: 'session',
      statusCategory: 'finished',
      current: 2,
      pageSize: 10,
    });
  });

  it('reports the open detail drawer, with a deep link back to it', () => {
    render({ ...INPUT, openedSessionId: SESSIONS[1].row_id });

    expect(structured(registered()['bai_get_current_session'])).toEqual({
      current: {
        ...toSessionRow(SESSIONS[1]),
        webui_path: `/session?sessionDetail=${SESSIONS[1].row_id}`,
      },
    });
  });

  it('answers null when no session is open', () => {
    render();

    expect(structured(registered()['bai_get_current_session'])).toEqual({
      current: null,
    });
  });

  it('registers nothing when the WebMCP flag is off', () => {
    vi.mocked(isWebMCPEnabled).mockReturnValue(false);

    render();

    expect(registerTool).not.toHaveBeenCalled();
  });
});
