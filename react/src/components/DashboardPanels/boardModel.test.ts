/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  addPanel,
  applyLayout,
  catalogFor,
  siderEntries,
  removePanel,
  resetBoard,
  sanitizeBoard,
  seedBoard,
  syncBoard,
  toBoardLayout,
  toLegacyPanel,
} from './boardModel';
import type { DashboardBoard, PanelDefinition, PersistedPanel } from './types';

const card = (
  key: string,
  extra: Partial<PanelDefinition> = {},
): PanelDefinition => ({
  key,
  page: ['project'],
  group: 'session',
  titleKey: key,
  kind: 'custom',
  defaultSize: { columnSpan: 2, rowSpan: 2 },
  minSize: { columnSpan: 2, rowSpan: 2 },
  ...extra,
});

const sessionPreset: PanelDefinition = {
  key: 'resource.session',
  page: ['project', 'admin'],
  group: 'other',
  titleKey: 'webui.menu.Sessions',
  kind: 'preset',
  source: 'session',
  viz: 'table',
  defaultSize: { columnSpan: 2, rowSpan: 3 },
  minSize: { columnSpan: 2, rowSpan: 3 },
  sizeByViz: {
    stat: {
      defaultSize: { columnSpan: 1, rowSpan: 2 },
      minSize: { columnSpan: 1, rowSpan: 2 },
    },
  },
};

const definitions: ReadonlyArray<PanelDefinition> = [
  card('a'),
  card('b', { defaultSize: { columnSpan: 4, rowSpan: 3 } }),
  card('hidden', { defaultHidden: true }),
  card('adminOnly', { page: ['admin'] }),
  sessionPreset,
];

const ids = (board: DashboardBoard) => board.panels.map((panel) => panel.id);

describe('seedBoard', () => {
  it('places every single-instance card of the page except defaultHidden ones', () => {
    const board = seedBoard(definitions, 'project');
    expect(ids(board)).toEqual(['a', 'b']);
    expect(board.panels[1]).toEqual({
      id: 'b',
      key: 'b',
      columnSpan: 4,
      rowSpan: 3,
    });
  });

  it('remembers defaultHidden cards as known, so a sync does not add them', () => {
    const board = seedBoard(definitions, 'project');
    expect(board.knownKeys).toEqual(['a', 'b', 'hidden']);
    expect(syncBoard(board, definitions, 'project')).toBe(board);
  });

  it('never seeds presets', () => {
    expect(ids(seedBoard(definitions, 'admin'))).toEqual(['adminOnly']);
  });

  it('hides a card by default only on the pages its defaultHidden lists, and orders cards per page', () => {
    const shared: ReadonlyArray<PanelDefinition> = [
      card('first', { page: ['project', 'admin'], defaultHidden: ['admin'] }),
      card('second', { page: ['project', 'admin'], order: { admin: 2 } }),
      card('third', { page: ['project', 'admin'], order: { admin: 1 } }),
    ];
    expect(ids(seedBoard(shared, 'project'))).toEqual([
      'first',
      'second',
      'third',
    ]);
    const admin = seedBoard(shared, 'admin');
    expect(ids(admin)).toEqual(['third', 'second']);
    expect(admin.knownKeys).toEqual(['third', 'second', 'first']);
  });
});

describe('syncBoard', () => {
  it('appends a card a release added, but not one the user removed', () => {
    const board: DashboardBoard = {
      panels: [{ id: 'b', key: 'b', columnSpan: 4, rowSpan: 3 }],
      knownKeys: ['a', 'b'],
    };
    const synced = syncBoard(
      board,
      [...definitions, card('new'), card('newHidden', { defaultHidden: true })],
      'project',
    );
    expect(ids(synced)).toEqual(['b', 'new']);
    expect(synced.knownKeys).toEqual(['a', 'b', 'hidden', 'new', 'newHidden']);
  });
});

describe('addPanel / removePanel', () => {
  const board = seedBoard(definitions, 'project');

  it('adds a single-instance card under its key, once', () => {
    const added = addPanel(board, definitions[2]);
    expect(ids(added)).toEqual(['a', 'b', 'hidden']);
    expect(addPanel(added, definitions[2])).toBe(added);
  });

  it('removes by id and is a no-op for an absent id', () => {
    const removed = removePanel(board, 'a');
    expect(ids(removed)).toEqual(['b']);
    expect(removePanel(removed, 'a')).toBe(removed);
  });

  it('keeps a removed card removed through a sync', () => {
    const removed = removePanel(board, 'a');
    expect(ids(syncBoard(removed, definitions, 'project'))).toEqual(['b']);
  });

  it('adds presets under the given id, sized for their viz', () => {
    const added = addPanel(board, sessionPreset, {
      id: 'session-1',
      viz: 'stat',
      title: 'Running',
    });
    expect(added.panels.at(-1)).toEqual({
      id: 'session-1',
      key: 'resource.session',
      viz: 'stat',
      title: 'Running',
      columnSpan: 1,
      rowSpan: 2,
    });
    expect(addPanel(board, sessionPreset)).toBe(board);
  });
});

describe('applyLayout', () => {
  const board: DashboardBoard = {
    panels: [
      { id: 'a', key: 'a', columnSpan: 2, rowSpan: 2 },
      { id: 'locked', key: 'b', columnSpan: 2, rowSpan: 2 },
      { id: 'c', key: 'a', columnSpan: 2, rowSpan: 2, columnOffset: { 4: 2 } },
    ],
    knownKeys: [],
  };

  it('writes the reported order, spans and offsets back verbatim', () => {
    const next = applyLayout(board, [
      { id: 'c', columnSpan: 3, rowSpan: 4 },
      { id: 'a', columnSpan: 2, rowSpan: 2, columnOffset: { 4: 1, 6: 2 } },
    ]);
    expect(next.panels).toEqual([
      { id: 'c', key: 'a', columnSpan: 3, rowSpan: 4 },
      { id: 'locked', key: 'b', columnSpan: 2, rowSpan: 2 },
      {
        id: 'a',
        key: 'a',
        columnSpan: 2,
        rowSpan: 2,
        columnOffset: { 4: 1, 6: 2 },
      },
    ]);
  });

  it('round-trips: the layout it produces is what the board reported', () => {
    const reported = [
      { id: 'c', columnSpan: 3, rowSpan: 4 },
      { id: 'a', columnSpan: 2, rowSpan: 2, columnOffset: { 4: 1 } },
    ];
    const next = applyLayout(board, reported);
    const layout = toBoardLayout(
      next,
      [card('a'), card('b')],
      (panel) => panel.id !== 'locked',
    ).map(({ definition: _definition, ...entry }) => entry);
    expect(layout).toEqual(reported);
  });

  it('ignores ids the board does not hold', () => {
    const next = applyLayout(board, [
      { id: 'ghost', columnSpan: 1, rowSpan: 2 },
      { id: 'a', columnSpan: 2, rowSpan: 2 },
      { id: 'c', columnSpan: 2, rowSpan: 2 },
    ]);
    expect(ids(next)).toEqual(['a', 'locked', 'c']);
  });
});

describe('resetBoard', () => {
  it('restores the default cards and keeps presets at their default size', () => {
    const board: DashboardBoard = {
      panels: [
        {
          id: 'session-1',
          key: 'resource.session',
          viz: 'table',
          columnSpan: 4,
          rowSpan: 6,
          columnOffset: { 4: 2 },
        },
        { id: 'b', key: 'b', columnSpan: 1, rowSpan: 2 },
      ],
      knownKeys: ['a', 'b', 'hidden', 'gone'],
    };
    const reset = resetBoard(board, definitions, 'project');
    expect(ids(reset)).toEqual(['a', 'b', 'session-1']);
    expect(reset.panels[2]).toEqual({
      id: 'session-1',
      key: 'resource.session',
      viz: 'table',
      columnSpan: 2,
      rowSpan: 3,
    });
    expect(reset.knownKeys).toEqual(['a', 'b', 'hidden', 'gone']);
  });
});

describe('sanitizeBoard', () => {
  it('returns null for anything that is not a board', () => {
    expect(sanitizeBoard(undefined, definitions, 'project')).toBeNull();
    expect(sanitizeBoard('undefined', definitions, 'project')).toBeNull();
    expect(sanitizeBoard({ panels: 'x' }, definitions, 'project')).toBeNull();
  });

  it('drops unknown keys, off-page keys, duplicate ids and malformed panels', () => {
    const sanitized = sanitizeBoard(
      {
        panels: [
          { id: 'a', key: 'a', columnSpan: 2, rowSpan: 2 },
          { id: 'retired', key: 'retired', columnSpan: 2, rowSpan: 2 },
          { id: 'adminOnly', key: 'adminOnly', columnSpan: 2, rowSpan: 2 },
          { id: 'a', key: 'a', columnSpan: 3, rowSpan: 3 },
          { id: 's', key: 'resource.session', viz: 'pie' },
          { id: 't', key: 'resource.session', title: 42 },
          null,
          'legacy',
        ],
        knownKeys: ['a', 7],
      },
      definitions,
      'project',
    );
    expect(sanitized).toEqual({
      panels: [{ id: 'a', key: 'a', columnSpan: 2, rowSpan: 2 }],
      knownKeys: ['a'],
    });
  });

  it('keeps only the settings a card declares, valid values and the first resource group only', () => {
    const withSettings: ReadonlyArray<PanelDefinition> = [
      card('rg', { settings: ['resourceGroup'] }),
      card('range', { settings: ['range'] }),
      card('plain'),
    ];
    const sanitized = sanitizeBoard(
      {
        panels: [
          {
            id: 'rg',
            key: 'rg',
            columnSpan: 2,
            rowSpan: 2,
            settings: { resourceGroups: ['g1', 'g1', 'g2'], range: 'now-1h' },
          },
          {
            id: 'range',
            key: 'range',
            columnSpan: 2,
            rowSpan: 2,
            settings: { range: 'now-3y', resourceGroups: ['g1'] },
          },
          {
            id: 'plain',
            key: 'plain',
            columnSpan: 2,
            rowSpan: 2,
            settings: { range: 'now-1h' },
          },
        ],
      },
      withSettings,
      'project',
    );
    expect(sanitized?.panels).toEqual([
      {
        id: 'rg',
        key: 'rg',
        columnSpan: 2,
        rowSpan: 2,
        settings: { resourceGroups: ['g1'] },
      },
      { id: 'range', key: 'range', columnSpan: 2, rowSpan: 2 },
      { id: 'plain', key: 'plain', columnSpan: 2, rowSpan: 2 },
    ]);
  });

  it('fills a missing or invalid span from the catalog', () => {
    const sanitized = sanitizeBoard(
      { panels: [{ id: 'b', key: 'b', columnSpan: 0 }] },
      definitions,
      'project',
    );
    expect(sanitized?.panels).toEqual([
      { id: 'b', key: 'b', columnSpan: 4, rowSpan: 3 },
    ]);
  });
});

describe('catalogFor', () => {
  const entries = [
    card('everyone'),
    card('superadmin', { requires: { role: 'superadmin' } }),
    card('projectAdmin', { requires: { role: 'projectAdmin' } }),
    card('blocked', { requires: { menuKey: 'data' } }),
    card('inactive', { requires: { menuKey: 'job' } }),
    card('agents', {
      requires: { config: (config) => !config.hideAgents },
    }),
    card('otherPage', { page: ['admin'] }),
  ];

  it('drops entries of another page, another role, or a disabled menu', () => {
    const keys = catalogFor(entries, {
      page: 'project',
      role: 'user',
      config: { blockList: ['data'], inactiveList: ['job'] },
    }).map((entry) => entry.definition.key);
    expect(keys).toEqual(['everyone', 'agents']);
  });

  it('keeps role-gated entries for the roles that meet them', () => {
    const keys = (role: 'admin' | 'superadmin') =>
      catalogFor(entries, { page: 'project', role, config: {} }).map(
        (entry) => entry.definition.key,
      );
    expect(keys('admin')).toContain('projectAdmin');
    expect(keys('admin')).not.toContain('superadmin');
    expect(keys('superadmin')).toEqual(
      expect.arrayContaining(['superadmin', 'projectAdmin']),
    );
  });

  it('leaves a locked entry out of the edit sider', () => {
    const keys = siderEntries(
      catalogFor(entries, {
        page: 'project',
        role: 'user',
        config: { hideAgents: true },
      }),
    ).map((entry) => entry.definition.key);
    expect(keys).not.toContain('agents');
    expect(keys).toContain('everyone');
  });

  it('locks an entry whose config check fails instead of dropping it', () => {
    const agents = catalogFor(entries, {
      page: 'project',
      role: 'user',
      config: { hideAgents: true },
    }).find((entry) => entry.definition.key === 'agents');
    expect(agents?.locked).toBe(true);
  });
});

describe('toLegacyPanel', () => {
  it('turns a stored preset panel into the modal shape', () => {
    const legacyPanel: PersistedPanel = {
      id: 'session-1',
      panelType: 'resourceCount',
      descriptor: {
        resourceType: 'session',
        title: 'Running',
        filter: 'status == "RUNNING"',
        order: null,
      },
    };
    expect(
      toLegacyPanel(
        {
          id: 'session-1',
          key: 'resource.session',
          viz: 'stat',
          title: 'Running',
          filter: 'status == "RUNNING"',
          order: null,
          gridView: null,
          columnSpan: 2,
          rowSpan: 4,
        },
        sessionPreset,
      ),
    ).toEqual({
      ...legacyPanel,
      descriptor: {
        ...legacyPanel.descriptor,
        gridView: null,
        resourceGroups: null,
      },
    });
  });
});
