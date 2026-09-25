/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  createCurrentItemTool,
  createListVisibleTool,
  createViewStateTool,
  hiddenRowFields,
  openedItem,
  pathWithSearchParam,
  pruneRow,
  viewStateResult,
  visibleRowsResult,
  type PageToolColumn,
} from './webmcpPageTools';
import { describe, expect, it } from 'vitest';

const COLUMNS: Array<PageToolColumn> = [
  { key: 'name', fields: ['name'], required: true },
  { key: 'status', fields: ['status'] },
  { key: 'replicas', fields: ['running', 'desired'] },
  { key: 'created_at', fields: ['createdAt'], defaultHidden: true },
];

const ROW = {
  id: 'a',
  name: 'alpha',
  status: 'RUNNING',
  running: 1,
  desired: 2,
  createdAt: '2026-09-25',
};

describe('hiddenRowFields', () => {
  it('hides default-hidden columns when nothing is overridden', () => {
    expect(hiddenRowFields(COLUMNS, undefined)).toEqual(['createdAt']);
  });

  it('always hides a column the table does not render', () => {
    expect(
      hiddenRowFields([{ key: 'agent', fields: ['agentIds'], absent: true }], {
        agent: { hidden: false },
      }),
    ).toEqual(['agentIds']);
  });

  it('follows the user overrides, but never hides a required column', () => {
    expect(
      hiddenRowFields(COLUMNS, {
        name: { hidden: true },
        replicas: { hidden: true },
        created_at: { hidden: false },
      }),
    ).toEqual(['running', 'desired']);
  });
});

describe('pruneRow', () => {
  it('keeps id even when a column claims it', () => {
    expect(pruneRow(ROW, ['id', 'status', 'createdAt'])).toEqual({
      id: 'a',
      name: 'alpha',
      running: 1,
      desired: 2,
    });
  });
});

describe('visibleRowsResult', () => {
  it('returns the pruned rows with count and pagination', () => {
    expect(
      visibleRowsResult({
        rows: [ROW],
        columns: COLUMNS,
        columnOverrides: { status: { hidden: true } },
        page: 2,
        pageSize: 10,
        total: 11,
      }),
    ).toEqual({
      rows: [{ id: 'a', name: 'alpha', running: 1, desired: 2 }],
      count: 1,
      page: 2,
      pageSize: 10,
      total: 11,
    });
  });

  it('keeps every field without columns and reports an unknown total as null', () => {
    expect(visibleRowsResult({ rows: [ROW], page: 1, pageSize: 5 })).toEqual({
      rows: [ROW],
      count: 1,
      page: 1,
      pageSize: 5,
      total: null,
    });
  });
});

describe('viewStateResult', () => {
  it('serializes the params into a path bai_navigate can reopen', () => {
    expect(
      viewStateResult('/project/my%20proj/session', {
        type: 'batch',
        filter: 'name ilike "%a&b%"',
        order: null,
        statusCategory: undefined,
        empty: '',
        current: 2,
        pageSize: 20,
      }),
    ).toEqual({
      path: '/project/my%20proj/session?type=batch&filter=name+ilike+%22%25a%26b%25%22&current=2&pageSize=20',
      searchParams: {
        type: 'batch',
        filter: 'name ilike "%a&b%"',
        current: '2',
        pageSize: '20',
      },
    });
  });

  it('returns the bare pathname when there are no params', () => {
    expect(viewStateResult('/project/p/data', { filter: null })).toEqual({
      path: '/project/p/data',
      searchParams: {},
    });
  });
});

describe('pathWithSearchParam', () => {
  it('sets one param and keeps the rest of the search', () => {
    expect(
      pathWithSearchParam(
        '/project/p/data',
        '?mode=all&folder=x',
        'folder',
        'y',
      ),
    ).toBe('/project/p/data?mode=all&folder=y');
  });
});

describe('openedItem', () => {
  it('is null when nothing is open', () => {
    expect(openedItem([ROW], null, '/x')).toBeNull();
    expect(openedItem([ROW], '', '/x')).toBeNull();
  });

  it('returns the rendered row plus its path', () => {
    expect(openedItem([ROW], 'a', '/x?d=a')).toEqual({
      ...ROW,
      path: '/x?d=a',
    });
  });

  it('still answers with id and path when the item is not on this page', () => {
    expect(openedItem([ROW], 'b', '/x?d=b')).toEqual({
      id: 'b',
      path: '/x?d=b',
    });
  });

  it('uses the given matcher', () => {
    expect(
      openedItem([ROW], 'A', '/x', (row, id) => row.id === id.toLowerCase()),
    ).toMatchObject({ id: 'a', name: 'alpha' });
  });
});

describe('tool builders', () => {
  const list = visibleRowsResult({ rows: [ROW], page: 1, pageSize: 10 });
  const tools = [
    createListVisibleTool({
      noun: 'thing',
      plural: 'things',
      rowFields: 'Row fields: id, name.',
      readRows: () => list,
    }),
    createViewStateTool({
      noun: 'thing',
      plural: 'things',
      readViewState: () => viewStateResult('/p', { a: 1 }),
    }),
    createCurrentItemTool({
      noun: 'thing',
      currentMeaning: 'the open thing',
      readCurrent: () => null,
    }),
  ];

  it('names the triple after the noun', () => {
    expect(tools.map((tool) => tool.name)).toEqual([
      'bai_list_visible_thing',
      'bai_get_thing_filter',
      'bai_get_current_thing',
    ]);
  });

  it('declares closed no-argument schemas and read-only, untrusted annotations', () => {
    for (const tool of tools) {
      expect(tool.inputSchema).toEqual({
        type: 'object',
        properties: {},
        additionalProperties: false,
      });
      expect(tool.annotations).toEqual({
        readOnlyHint: true,
        untrustedContentHint: true,
      });
      expect(tool).not.toHaveProperty('outputSchema');
    }
  });

  it('answers from the readers', async () => {
    const [listTool, viewTool, currentTool] = tools;
    expect(await listTool.execute({})).toBe(list);
    expect(await viewTool.execute({})).toEqual({
      path: '/p?a=1',
      searchParams: { a: '1' },
    });
    expect(await currentTool.execute({})).toEqual({ current: null });
  });
});
