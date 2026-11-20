/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  applyAssistantActions,
  buildDashboardEditPrompt,
  isNoopAction,
  parseDashboardActions,
  sanitizeAssistantActions,
  settingsTouchedBy,
} from './assistantActions';
import type { DashboardBoard, PanelDefinition } from './types';

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
  minSize: { columnSpan: 1, rowSpan: 2 },
  ...extra,
});

const preset: PanelDefinition = {
  key: 'resource.session',
  page: ['project'],
  group: 'other',
  titleKey: 'webui.menu.Sessions',
  kind: 'preset',
  source: 'session',
  viz: 'table',
  defaultSize: { columnSpan: 4, rowSpan: 3 },
  minSize: { columnSpan: 2, rowSpan: 2 },
};

const catalog = [
  card('a'),
  card('b'),
  card('c', { settings: ['range'] }),
  preset,
];
const context = {
  definitionByKey: new Map(catalog.map((d) => [d.key, d])),
  catalog,
  page: 'project' as const,
};

const board: DashboardBoard = {
  panels: [
    { id: 'a', key: 'a', columnSpan: 2, rowSpan: 2 },
    {
      id: 'c',
      key: 'c',
      columnSpan: 2,
      rowSpan: 2,
      columnOffset: { 4: 2 },
    },
    {
      id: 'mine',
      key: 'resource.session',
      viz: 'table',
      columnSpan: 4,
      rowSpan: 3,
    },
  ],
  knownKeys: ['a', 'b', 'c'],
};

const ids = [
  { id: 'a', title: 'My sessions' },
  { id: 'b', title: 'Activity' },
  { id: 'c', title: 'Pending Sessions and Reasons', range: 'default' },
  { id: 'mine', title: 'Sessions' },
];

describe('sanitizeAssistantActions', () => {
  it('keeps well-formed actions on listed ids and drops the rest', () => {
    expect(
      sanitizeAssistantActions(
        {
          actions: [
            { type: 'show', id: 'b' },
            { type: 'show', id: 'unknown' },
            { type: 'explode', id: 'a' },
            { type: 'resize', id: 'a', columnSpan: 3.4 },
            { type: 'resize', id: 'a' },
            { type: 'setRange', id: 'c', range: 'now-7d' },
            { type: 'setRange', id: 'c', range: 'yesterday' },
            { type: 'setRange', id: 'a', range: 'now-1h' },
            { type: 'reset' },
            'hide a',
          ],
        },
        ids,
      ),
    ).toEqual([
      { type: 'show', id: 'b' },
      { type: 'resize', id: 'a', columnSpan: 3, rowSpan: undefined },
      { type: 'setRange', id: 'c', range: 'now-7d' },
      { type: 'reset' },
    ]);
  });

  it('resolves a paraphrased id by the card id or title', () => {
    expect(
      sanitizeAssistantActions(
        [
          { type: 'hide', id: 'pendingSessionsAndReasons' },
          { type: 'hide', id: 'pendingSessionsReasons' },
          { type: 'hide', id: 'MY_SESSIONS' },
          { type: 'show', id: 'B' },
          { type: 'show', id: '???' },
          { type: 'show', id: 'session' },
        ],
        ids,
      ),
    ).toEqual([
      { type: 'hide', id: 'c' },
      { type: 'hide', id: 'c' },
      { type: 'hide', id: 'a' },
      { type: 'show', id: 'b' },
      { type: 'show', id: 'mine' },
    ]);
  });

  it('accepts a bare array', () => {
    expect(sanitizeAssistantActions([{ type: 'hide', id: 'a' }], ids)).toEqual([
      { type: 'hide', id: 'a' },
    ]);
  });
});

describe('parseDashboardActions', () => {
  it('reads a fenced block', () => {
    expect(
      parseDashboardActions(
        'Sure.\n```dashboard-actions\n{"actions":[{"type":"hide","id":"a"}]}\n```',
        ids,
      ),
    ).toEqual([{ type: 'hide', id: 'a' }]);
  });

  it('reads bare JSON around other text', () => {
    expect(
      parseDashboardActions(
        'Here: {"actions":[{"type":"show","id":"b"}]} done',
        ids,
      ),
    ).toEqual([{ type: 'show', id: 'b' }]);
  });

  it('returns nothing for text without JSON or with invalid JSON', () => {
    expect(parseDashboardActions('Plain answer', ids)).toEqual([]);
    expect(parseDashboardActions('{not json}', ids)).toEqual([]);
  });
});

describe('applyAssistantActions', () => {
  it('adds a catalog card and removes another', () => {
    const next = applyAssistantActions(
      board,
      [
        { type: 'show', id: 'b' },
        { type: 'hide', id: 'a' },
      ],
      context,
    );
    expect(next.panels.map((panel) => panel.id)).toEqual(['c', 'mine', 'b']);
  });

  it('hides a user-made panel instead of removing it', () => {
    const next = applyAssistantActions(
      board,
      [{ type: 'hide', id: 'mine' }],
      context,
    );
    expect(next.panels.find((panel) => panel.id === 'mine')?.hidden).toBe(true);
  });

  it('moves a card to the top without its column offset', () => {
    const next = applyAssistantActions(
      board,
      [{ type: 'moveToTop', id: 'c' }],
      context,
    );
    expect(next.panels.map((panel) => panel.id)).toEqual(['c', 'a', 'mine']);
    expect(next.panels[0].columnOffset).toBeUndefined();
  });

  it('clamps a resize to the minimum size and the board width', () => {
    const next = applyAssistantActions(
      board,
      [
        { type: 'resize', id: 'a', columnSpan: 9, rowSpan: 1 },
        { type: 'resize', id: 'mine', columnSpan: 1 },
      ],
      context,
    );
    expect(next.panels[0]).toMatchObject({ columnSpan: 4, rowSpan: 2 });
    expect(next.panels[2]).toMatchObject({ columnSpan: 2, rowSpan: 3 });
  });

  it('sets a card range and resets to the template', () => {
    const ranged = applyAssistantActions(
      board,
      [{ type: 'setRange', id: 'c', range: 'now-1h' }],
      context,
    );
    expect(ranged.panels[1].settings).toEqual({ range: 'now-1h' });
    const reset = applyAssistantActions(ranged, [{ type: 'reset' }], context);
    expect(reset.panels.map((panel) => panel.id)).toEqual([
      'a',
      'b',
      'c',
      'mine',
    ]);
  });

  it('returns the same board when nothing applies', () => {
    expect(
      applyAssistantActions(board, [{ type: 'show', id: 'a' }], context),
    ).toBe(board);
  });
});

describe('settingsTouchedBy', () => {
  it('names the cards whose saved settings change', () => {
    expect(
      settingsTouchedBy([
        { type: 'setRange', id: 'c', range: 'now-1h' },
        { type: 'moveToTop', id: 'a' },
        { type: 'hide', id: 'b' },
      ]),
    ).toEqual(['c', 'b']);
    expect(settingsTouchedBy([{ type: 'reset' }])).toBe('all');
  });
});

describe('buildDashboardEditPrompt', () => {
  it('lists the cards and asks for JSON only', () => {
    const prompt = buildDashboardEditPrompt({
      page: 'project',
      cards: [
        {
          id: 'a',
          title: 'My sessions',
          shown: true,
          columnSpan: 2,
          rowSpan: 2,
        },
        { id: 'c', title: 'Activity', shown: false, range: 'default' },
      ],
    });
    expect(prompt).toContain('- a | My sessions | on board | size 2x2');
    expect(prompt).toContain('- c | Activity | not on board | range default');
    expect(prompt).toContain('Reply with only a JSON object');
  });
});

describe('isNoopAction', () => {
  const cards = [
    { id: 'a', title: 'A', shown: true, columnSpan: 2, rowSpan: 2 },
    {
      id: 'b',
      title: 'B',
      shown: true,
      columnSpan: 4,
      rowSpan: 3,
      range: 'now-1h',
    },
    { id: 'c', title: 'C', shown: false },
  ];

  it('flags changes the board already reflects', () => {
    expect(isNoopAction({ type: 'show', id: 'a' }, cards)).toBe(true);
    expect(isNoopAction({ type: 'hide', id: 'c' }, cards)).toBe(true);
    expect(isNoopAction({ type: 'moveToTop', id: 'a' }, cards)).toBe(true);
    expect(isNoopAction({ type: 'moveToBottom', id: 'b' }, cards)).toBe(true);
    expect(
      isNoopAction({ type: 'resize', id: 'a', columnSpan: 2 }, cards),
    ).toBe(true);
    expect(
      isNoopAction({ type: 'setRange', id: 'b', range: 'now-1h' }, cards),
    ).toBe(true);
  });

  it('keeps changes that would alter the board', () => {
    expect(isNoopAction({ type: 'show', id: 'c' }, cards)).toBe(false);
    expect(isNoopAction({ type: 'hide', id: 'a' }, cards)).toBe(false);
    expect(isNoopAction({ type: 'moveToTop', id: 'b' }, cards)).toBe(false);
    expect(isNoopAction({ type: 'resize', id: 'a', rowSpan: 4 }, cards)).toBe(
      false,
    );
    expect(
      isNoopAction({ type: 'setRange', id: 'b', range: 'now-7d' }, cards),
    ).toBe(false);
    expect(isNoopAction({ type: 'reset' }, cards)).toBe(false);
  });
});

describe('applyAssistantActions with panels and boards', () => {
  const newPanel = {
    id: 'session-new',
    key: 'resource.session',
    viz: 'table' as const,
    title: 'New',
    columnSpan: 4,
    rowSpan: 3,
  };

  it('adds a custom panel with its fixed id', () => {
    const next = applyAssistantActions(
      board,
      [{ type: 'addPanel', panel: newPanel }],
      context,
    );
    expect(next.panels.at(-1)).toMatchObject({
      id: 'session-new',
      title: 'New',
    });
  });

  it('edits a custom panel and resizes it when its kind changes', () => {
    const next = applyAssistantActions(
      board,
      [
        {
          type: 'editPanel',
          id: 'mine',
          input: {
            panelType: 'resourceCount',
            resourceType: 'session',
            title: 'Count',
            filter: null,
          },
        },
      ],
      context,
    );
    const mine = next.panels.find((panel) => panel.id === 'mine');
    expect(mine).toMatchObject({ title: 'Count', viz: 'stat' });
  });

  it('fills a new board with the actions after createBoard', () => {
    const empty = { panels: [], knownKeys: ['a', 'b', 'c'] };
    const next = applyAssistantActions(
      board,
      [
        { type: 'createBoard', title: 'Incidents' },
        { type: 'show', id: 'b' },
      ],
      { ...context, emptyBoard: empty },
    );
    expect(next.panels.map((panel) => panel.id)).toEqual(['b']);
  });
});
