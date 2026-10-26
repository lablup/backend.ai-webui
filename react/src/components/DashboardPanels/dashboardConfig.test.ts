/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { syncBoard } from './boardModel';
import {
  DEFAULT_BOARD_ID,
  DEFAULT_BOARD_VARS,
  addBoard,
  createEmptyBoard,
  migrateLocalStorage,
  removeBoard,
  renameBoard,
  resetActiveBoard,
  resolveBoards,
  resolveTemplate,
  sanitizeDashboardConfig,
  selectBoard,
} from './dashboardConfig';
import type {
  DashboardModel,
  DashboardPageConfig,
  PanelDefinition,
} from './types';

const card = (
  key: string,
  extra: Partial<PanelDefinition> = {},
): PanelDefinition => ({
  key,
  page: ['project', 'admin'],
  group: 'session',
  titleKey: key,
  kind: 'custom',
  defaultSize: { columnSpan: 2, rowSpan: 2 },
  minSize: { columnSpan: 2, rowSpan: 2 },
  refresh: { min: '30s' },
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
  refresh: { min: '1m' },
};

const definitions: ReadonlyArray<PanelDefinition> = [
  card('a'),
  card('b'),
  card('c', { defaultHidden: true }),
  sessionPreset,
];

const keysOf = (board: { panels: ReadonlyArray<{ key: string }> }) =>
  board.panels.map((panel) => panel.key);

const board = (
  id: string,
  extra: Partial<DashboardModel> = {},
): DashboardModel => ({
  id,
  title: id,
  vars: { ...DEFAULT_BOARD_VARS },
  panels: [{ id: 'a', key: 'a', columnSpan: 2, rowSpan: 2 }],
  knownKeys: ['a', 'b', 'c'],
  ...extra,
});

const noLocal = {};
const noTemplates = {};

describe('resolveTemplate', () => {
  it('prefers the domain template over the public one', () => {
    const template = resolveTemplate(
      {
        domainTemplates: { project: { panels: [{ id: 'b', key: 'b' }] } },
        publicTemplates: { project: { panels: [{ id: 'a', key: 'a' }] } },
      },
      definitions,
      'project',
    );
    expect(keysOf(template)).toEqual(['b']);
    expect(template.id).toBe(DEFAULT_BOARD_ID);
  });

  it('falls back to the public template when the domain has none for the page', () => {
    const template = resolveTemplate(
      {
        domainTemplates: { admin: { panels: [{ id: 'b', key: 'b' }] } },
        publicTemplates: { project: { panels: [{ id: 'a', key: 'a' }] } },
      },
      definitions,
      'project',
    );
    expect(keysOf(template)).toEqual(['a']);
  });

  it('falls back to the code default when no template is usable', () => {
    const template = resolveTemplate(
      { domainTemplates: 'broken', publicTemplates: { project: 42 } },
      definitions,
      'project',
    );
    expect(template).toEqual({
      id: DEFAULT_BOARD_ID,
      title: '',
      vars: DEFAULT_BOARD_VARS,
      panels: [
        { id: 'a', key: 'a', columnSpan: 2, rowSpan: 2 },
        { id: 'b', key: 'b', columnSpan: 2, rowSpan: 2 },
      ],
      knownKeys: ['a', 'b', 'c'],
    });
  });

  it('treats a template without knownKeys as knowing every current card', () => {
    const template = resolveTemplate(
      { publicTemplates: { project: { panels: [{ id: 'b', key: 'b' }] } } },
      definitions,
      'project',
    );
    expect(template.knownKeys).toEqual(['a', 'b', 'c']);
    expect(template.panels[0]).toEqual({
      id: 'b',
      key: 'b',
      columnSpan: 2,
      rowSpan: 2,
    });
  });
});

describe('migrateLocalStorage', () => {
  it('prefers the dashboard_board.<page> key over the legacy keys', () => {
    const migrated = migrateLocalStorage(
      {
        board: { panels: [{ id: 'b', key: 'b' }], knownKeys: ['a', 'b'] },
        layout: [{ id: 'a', columnSpan: 3, rowSpan: 2 }],
      },
      definitions,
      'project',
    );
    expect(keysOf(migrated!)).toEqual(['b']);
  });

  it('builds the project board from the legacy layout and custom panels', () => {
    const migrated = migrateLocalStorage(
      {
        layout: [
          { id: 'a', columnSpan: 3, rowSpan: 2 },
          { id: 'p1', columnSpan: 4, rowSpan: 3 },
        ],
        customPanels: [
          {
            id: 'p1',
            panelType: 'resourceTable',
            descriptor: { resourceType: 'session', title: 'Mine' },
          },
        ],
      },
      definitions,
      'project',
    );
    expect(migrated?.panels).toEqual([
      { id: 'a', key: 'a', columnSpan: 3, rowSpan: 2 },
      expect.objectContaining({
        id: 'p1',
        key: 'resource.session',
        title: 'Mine',
        columnSpan: 4,
        rowSpan: 3,
      }),
    ]);
  });

  it('reads admin_dashboard_board_items only for the admin page', () => {
    const sources = { adminLayout: [{ id: 'b', columnSpan: 2, rowSpan: 2 }] };
    expect(keysOf(migrateLocalStorage(sources, definitions, 'admin')!)).toEqual(
      ['b'],
    );
    expect(migrateLocalStorage(sources, definitions, 'project')).toBeNull();
    expect(
      migrateLocalStorage(sources, definitions, 'projectAdmin'),
    ).toBeNull();
  });

  it('returns null when the browser kept nothing', () => {
    expect(migrateLocalStorage({}, definitions, 'project')).toBeNull();
  });
});

describe('sanitizeDashboardConfig', () => {
  it('drops malformed pages, boards and panels and repairs active', () => {
    const sanitized = sanitizeDashboardConfig(
      {
        project: {
          boards: [
            board('one', {
              panels: [
                { id: 'a', key: 'a', columnSpan: 2, rowSpan: 2 },
                { id: 'x', key: 'unknown', columnSpan: 2, rowSpan: 2 },
              ],
            }),
            board('one'),
            { title: 'no id', panels: [] },
          ],
          active: 'missing',
          migrated: true,
        },
        admin: { boards: [] },
        projectAdmin: 'nope',
      },
      definitions,
    );
    expect(Object.keys(sanitized)).toEqual(['project']);
    expect(sanitized.project?.boards.map((item) => item.id)).toEqual(['one']);
    expect(keysOf(sanitized.project!.boards[0])).toEqual(['a']);
    expect(sanitized.project?.active).toBe('one');
    expect(sanitized.project?.migrated).toBe(true);
  });

  it('keeps only the refresh var and drops retired values and pins', () => {
    const sanitized = sanitizeDashboardConfig(
      {
        admin: {
          boards: [
            {
              ...board('one'),
              vars: {
                project: ['p1'],
                rg: ['g'],
                range: 'now-1h',
                refresh: '7s',
              },
              pinned: { project: ['p1'] },
            },
          ],
          active: 'one',
        },
      },
      definitions,
    );
    const model = sanitized.admin!.boards[0];
    expect(model.vars).toEqual({ refresh: DEFAULT_BOARD_VARS.refresh });
    expect(model).not.toHaveProperty('pinned');
  });

  it('returns an empty config for a non-object', () => {
    expect(sanitizeDashboardConfig(null, definitions)).toEqual({});
  });
});

describe('resolveBoards', () => {
  const localBoard = {
    board: { panels: [{ id: 'b', key: 'b' }], knownKeys: ['a', 'b', 'c'] },
  };

  it('uses the stored config and plans no migration, even with a local board', () => {
    const stored: DashboardPageConfig = {
      boards: [board('saved')],
      active: 'saved',
      migrated: true,
    };
    const resolved = resolveBoards({
      stored,
      local: localBoard,
      templates: noTemplates,
      definitions,
      page: 'project',
    });
    expect(resolved.migration).toBeNull();
    expect(resolved.config.boards.map((item) => item.id)).toEqual(['saved']);
  });

  it('migrates a local board onto the template frame, flagged, when nothing is stored', () => {
    const resolved = resolveBoards({
      stored: undefined,
      local: localBoard,
      templates: {
        publicTemplates: {
          project: {
            title: 'Team',
            vars: { refresh: '1m' },
            panels: [{ id: 'a', key: 'a' }],
          },
        },
      },
      definitions,
      page: 'project',
    });
    expect(resolved.migration).toBe(resolved.config);
    expect(resolved.config.migrated).toBe(true);
    expect(resolved.config.active).toBe(DEFAULT_BOARD_ID);
    const [migrated] = resolved.config.boards;
    expect(migrated.title).toBe('Team');
    expect(migrated.vars.refresh).toBe('1m');
    expect(keysOf(migrated)).toEqual(['b']);
  });

  it('shows the template without writing it when there is nothing to migrate', () => {
    const resolved = resolveBoards({
      stored: undefined,
      local: noLocal,
      templates: noTemplates,
      definitions,
      page: 'admin',
    });
    expect(resolved.migration).toBeNull();
    expect(resolved.config.boards).toEqual([resolved.template]);
    expect(resolved.config.migrated).toBeUndefined();
  });

  it('runs the migration once: the written config resolves without one', () => {
    const first = resolveBoards({
      stored: undefined,
      local: localBoard,
      templates: noTemplates,
      definitions,
      page: 'project',
    });
    const second = resolveBoards({
      stored: JSON.parse(JSON.stringify(first.migration)),
      local: localBoard,
      templates: noTemplates,
      definitions,
      page: 'project',
    });
    expect(second.migration).toBeNull();
    expect(second.config).toEqual(first.config);
  });
});

describe('board operations', () => {
  const config: DashboardPageConfig = {
    boards: [board('one'), board('two'), board('three')],
    active: 'two',
  };

  it('creates an empty board that every current card counts as seen, and makes it active', () => {
    const next = addBoard(
      config,
      createEmptyBoard({ id: 'new', title: 'New' }, definitions, 'project'),
    );
    expect(next.active).toBe('new');
    const created = next.boards[3];
    expect(created).toMatchObject({ id: 'new', title: 'New', panels: [] });
    expect(created.vars).toEqual(DEFAULT_BOARD_VARS);
    expect(syncBoard(created, definitions, 'project').panels).toEqual([]);
  });

  it('hands the active board over to its neighbour on removal and keeps the last one', () => {
    expect(removeBoard(config, 'two')).toMatchObject({ active: 'three' });
    expect(removeBoard({ ...config, active: 'three' }, 'three').active).toBe(
      'two',
    );
    expect(removeBoard(config, 'one').active).toBe('two');
    const single: DashboardPageConfig = {
      boards: [board('one')],
      active: 'one',
    };
    expect(removeBoard(single, 'one')).toBe(single);
  });

  it('selects only an existing board', () => {
    expect(selectBoard(config, 'three').active).toBe('three');
    expect(selectBoard(config, 'missing')).toBe(config);
  });

  it('renames with a trimmed title', () => {
    const renamed = renameBoard(config, 'one', '  NLP  ');
    expect(renamed.boards[0].title).toBe('NLP');
  });

  it('resets the active board to the template panels and keeps its title', () => {
    const template = board(DEFAULT_BOARD_ID, {
      panels: [{ id: 'b', key: 'b', columnSpan: 2, rowSpan: 2 }],
    });
    const edited: DashboardPageConfig = {
      boards: [
        board('one', {
          title: 'Mine',
          panels: [
            { id: 'a', key: 'a', columnSpan: 6, rowSpan: 6 },
            {
              id: 'p1',
              key: 'resource.session',
              viz: 'table',
              columnSpan: 6,
              rowSpan: 6,
            },
          ],
        }),
      ],
      active: 'one',
    };
    const [reset] = resetActiveBoard(
      edited,
      template,
      definitions,
      'project',
    ).boards;
    expect(reset.title).toBe('Mine');
    expect(reset.panels.map((panel) => panel.id)).toEqual(['b', 'p1']);
    expect(reset.panels[1]).toMatchObject({ columnSpan: 2, rowSpan: 3 });
  });
});
