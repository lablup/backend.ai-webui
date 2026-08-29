/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3766: the pure parts of the page-scoped tool triple — row pruning, param
 * compaction, and what "current" answers when the opened item is not among the
 * rendered rows.
 */
import {
  compactFilterState,
  createCurrentItemTool,
  createListVisibleTool,
  currentToolName,
  filterToolName,
  hiddenColumnKeys,
  listVisibleToolName,
  resolveOpenedRow,
  visibleRow,
  type PageReadToolsConfig,
} from './webmcpPageTools';
import type { CallToolResult } from '@mcp-b/webmcp-types';
import { describe, expect, it } from 'vitest';

const ROWS = [
  { id: 'a', name: 'alpha', status: 'RUNNING' },
  { id: 'b', name: 'beta', status: 'STOPPED' },
];

const CONFIG: PageReadToolsConfig = {
  noun: 'widget',
  plural: 'widgets',
  resource: 'session',
  rowProperties: { id: { type: 'string' }, name: { type: 'string' } },
  rows: ROWS,
  pagination: { current: 3, pageSize: 2 },
  filter: {},
  current: null,
};

const structured = (result: CallToolResult): unknown =>
  result.structuredContent;

describe('tool names', () => {
  it('are bai_ + snake_case, built from the noun', () => {
    expect(listVisibleToolName('model_card')).toBe(
      'bai_list_visible_model_card',
    );
    expect(filterToolName('model_card')).toBe('bai_get_model_card_filter');
    expect(currentToolName('model_card')).toBe('bai_get_current_model_card');
  });
});

describe('visibleRow', () => {
  it('removes hidden columns but never the row identity', () => {
    expect(visibleRow(ROWS[0], ['status', 'id'])).toEqual({
      id: 'a',
      name: 'alpha',
    });
  });
});

describe('hiddenColumnKeys', () => {
  it('lists only the keys explicitly marked hidden', () => {
    expect(
      hiddenColumnKeys({ a: { hidden: true }, b: { hidden: false }, c: {} }),
    ).toEqual(['a']);
    expect(hiddenColumnKeys(undefined)).toEqual([]);
  });
});

describe('compactFilterState', () => {
  it('drops params the URL does not carry', () => {
    expect(
      compactFilterState({
        filter: null,
        statusCategory: 'running',
        order: undefined,
        current: 1,
      }),
    ).toEqual({ statusCategory: 'running', current: 1 });
  });
});

describe('resolveOpenedRow', () => {
  it('answers null when nothing is open', () => {
    expect(resolveOpenedRow(ROWS, null, (id) => `/x/${id}`)).toBeNull();
  });

  it('returns the full row plus its deep link', () => {
    expect(resolveOpenedRow(ROWS, 'b', (id) => `/x/${id}`)).toEqual({
      id: 'b',
      name: 'beta',
      status: 'STOPPED',
      webui_path: '/x/b',
    });
  });

  it('still answers the id and link when the row is on another page', () => {
    expect(resolveOpenedRow(ROWS, 'zzz', (id) => `/x/${id}`)).toEqual({
      id: 'zzz',
      webui_path: '/x/zzz',
    });
  });
});

describe('createListVisibleTool', () => {
  it('omits total when the page does not know it', () => {
    expect(
      structured(
        createListVisibleTool(CONFIG).execute(
          {},
          {} as never,
        ) as CallToolResult,
      ),
    ).toEqual({ rows: ROWS, count: 2, page: 3, pageSize: 2 });
  });

  it('is read-only and takes no arguments', () => {
    const tool = createListVisibleTool(CONFIG);
    expect(tool.annotations?.readOnlyHint).toBe(true);
    expect(tool.inputSchema).toEqual({ type: 'object', properties: {} });
  });
});

describe('createCurrentItemTool', () => {
  it('declares a nullable object output schema', () => {
    expect(createCurrentItemTool(CONFIG).outputSchema).toMatchObject({
      type: 'object',
      required: ['current'],
      properties: {
        current: {
          type: ['object', 'null'],
          properties: { webui_path: { type: 'string' } },
        },
      },
    });
  });
});
