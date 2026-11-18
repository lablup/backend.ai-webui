/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  applyAssistantActions,
  buildDashboardPromptSection,
  extractDashboardActions,
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

const ids = new Set(['a', 'b', 'c', 'mine']);

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

  it('accepts a bare array', () => {
    expect(sanitizeAssistantActions([{ type: 'hide', id: 'a' }], ids)).toEqual([
      { type: 'hide', id: 'a' },
    ]);
  });
});

describe('extractDashboardActions', () => {
  it('strips the block from the text and parses its actions', () => {
    expect(
      extractDashboardActions(
        'Sure, I will hide it.\n```dashboard-actions\n{"actions":[{"type":"hide","id":"a"}]}\n```',
        ids,
      ),
    ).toEqual({
      text: 'Sure, I will hide it.',
      actions: [{ type: 'hide', id: 'a' }],
    });
  });

  it('hides an unclosed block while it streams', () => {
    expect(
      extractDashboardActions('Okay.\n```dashboard-actions\n{"act', ids),
    ).toEqual({ text: 'Okay.', actions: [] });
  });

  it('leaves text without a block and ignores invalid JSON', () => {
    expect(extractDashboardActions('Plain answer', ids)).toEqual({
      text: 'Plain answer',
      actions: [],
    });
    expect(
      extractDashboardActions('x\n```dashboard-actions\nnot json\n```', ids),
    ).toEqual({ text: 'x', actions: [] });
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

describe('buildDashboardPromptSection', () => {
  it('lists the cards and the action format', () => {
    const section = buildDashboardPromptSection({
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
    expect(section).toContain('- a | My sessions | on board | size 2x2');
    expect(section).toContain('- c | Activity | not on board | range default');
    expect(section).toContain('```dashboard-actions');
  });
});
