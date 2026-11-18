/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  addPanel,
  removePanel,
  resetBoard,
  setPanelsHidden,
  sizeOf,
  updatePanel,
} from './boardModel';
import {
  RANGE_PRESETS,
  isRangePreset,
  mergeSettings,
  type RangePreset,
} from './panelSettings';
import type { DashboardBoard, PanelDefinition, PanelPage } from './types';
import { atom } from 'jotai';
import * as _ from 'lodash-es';

/** The fence the WebUI Assistant wraps a dashboard change in. */
export const DASHBOARD_ACTIONS_FENCE = 'dashboard-actions';
/** The board grid's column count (BAIBoard). */
const BOARD_COLUMNS = 4;
const MAX_ROW_SPAN = 12;

/** One change the WebUI Assistant proposes to the dashboard the user is on. */
export type DashboardAssistantAction =
  | { type: 'show' | 'hide' | 'moveToTop' | 'moveToBottom'; id: string }
  | { type: 'resize'; id: string; columnSpan?: number; rowSpan?: number }
  | { type: 'setRange'; id: string; range: RangePreset }
  | { type: 'reset' };

/** A card the viewer can place on the current board, as the assistant sees it. */
export interface DashboardAssistantCard {
  /** The catalog key of a single-instance card, or the id of a user-made panel. */
  id: string;
  title: string;
  shown: boolean;
  columnSpan?: number;
  rowSpan?: number;
  /** Set when the card takes a range setting; the saved range, or `default`. */
  range?: string;
}

/** What the mounted dashboard hands the WebUI Assistant. */
export interface DashboardAssistantBridge {
  page: PanelPage;
  /** Cards on the board first, in board order, then the ones the user can add. */
  cards: Array<DashboardAssistantCard>;
  apply: (actions: ReadonlyArray<DashboardAssistantAction>) => void;
}

/** Set while a dashboard page is mounted. */
export const dashboardAssistantBridgeAtom =
  atom<DashboardAssistantBridge | null>(null);

const OPEN_FENCE = '```' + DASHBOARD_ACTIONS_FENCE;

const toInt = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.round(value)
    : undefined;

/** The actions in a raw JSON value, keeping only the well-formed ones on known ids. */
export const sanitizeAssistantActions = (
  value: unknown,
  knownIds: ReadonlySet<string>,
): Array<DashboardAssistantAction> => {
  const list = Array.isArray(value)
    ? value
    : _.isPlainObject(value) &&
        Array.isArray((value as { actions?: unknown }).actions)
      ? (value as { actions: Array<unknown> }).actions
      : [];
  return list.flatMap((raw): Array<DashboardAssistantAction> => {
    if (!_.isPlainObject(raw)) return [];
    const { type, id, columnSpan, rowSpan, range } = raw as Record<
      string,
      unknown
    >;
    if (type === 'reset') return [{ type }];
    if (typeof id !== 'string' || !knownIds.has(id)) return [];
    switch (type) {
      case 'show':
      case 'hide':
      case 'moveToTop':
      case 'moveToBottom':
        return [{ type, id }];
      case 'resize': {
        const columns = toInt(columnSpan);
        const rows = toInt(rowSpan);
        return columns === undefined && rows === undefined
          ? []
          : [{ type, id, columnSpan: columns, rowSpan: rows }];
      }
      case 'setRange':
        return isRangePreset(range) ? [{ type, id, range }] : [];
      default:
        return [];
    }
  });
};

/**
 * Splits an assistant reply into the text to show and the dashboard actions it
 * carries. An unclosed fence (still streaming) is hidden and yields no actions.
 */
export const extractDashboardActions = (
  text: string,
  knownIds: ReadonlySet<string>,
): { text: string; actions: Array<DashboardAssistantAction> } => {
  const start = text.indexOf(OPEN_FENCE);
  if (start < 0) return { text, actions: [] };
  const bodyStart = start + OPEN_FENCE.length;
  const end = text.indexOf('```', bodyStart);
  const visible = (
    text.slice(0, start) + (end < 0 ? '' : text.slice(end + 3))
  ).trim();
  if (end < 0) return { text: visible, actions: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(bodyStart, end));
  } catch {
    return { text: visible, actions: [] };
  }
  return { text: visible, actions: sanitizeAssistantActions(parsed, knownIds) };
};

const moveTo = (
  board: DashboardBoard,
  id: string,
  edge: 'top' | 'bottom',
): DashboardBoard => {
  const panel = board.panels.find((item) => item.id === id);
  if (!panel) return board;
  // A column offset was set for the old neighbours, so it does not follow the card.
  const moved = _.omit(panel, 'columnOffset');
  const rest = board.panels.filter((item) => item.id !== id);
  return {
    ...board,
    panels: edge === 'top' ? [moved, ...rest] : [...rest, moved],
  };
};

export interface ApplyAssistantActionsContext {
  definitionByKey: ReadonlyMap<string, PanelDefinition>;
  catalog: ReadonlyArray<PanelDefinition>;
  page: PanelPage;
  /** What "Reset layout" restores. */
  template?: DashboardBoard;
}

/** `actions` applied to `board` in order; an action that does not fit the board is skipped. */
export const applyAssistantActions = (
  board: DashboardBoard,
  actions: ReadonlyArray<DashboardAssistantAction>,
  { definitionByKey, catalog, page, template }: ApplyAssistantActionsContext,
): DashboardBoard =>
  actions.reduce((current, action) => {
    if (action.type === 'reset')
      return resetBoard(current, catalog, page, template);
    const panel = current.panels.find((item) => item.id === action.id);
    const definition = definitionByKey.get(panel?.key ?? action.id);
    if (!definition) return current;
    // A user-made panel is only hidden, so it stays listed; a catalog card is removed.
    const isUserPanel = definition.kind === 'preset';
    switch (action.type) {
      case 'show':
        return isUserPanel
          ? setPanelsHidden(current, [action.id], false)
          : addPanel(current, definition);
      case 'hide':
        return isUserPanel
          ? setPanelsHidden(current, [action.id], true)
          : removePanel(current, action.id);
      case 'moveToTop':
        return moveTo(current, action.id, 'top');
      case 'moveToBottom':
        return moveTo(current, action.id, 'bottom');
      case 'resize': {
        if (!panel) return current;
        const { minSize } = sizeOf(definition, panel.viz);
        return updatePanel(current, action.id, {
          columnSpan: _.clamp(
            action.columnSpan ?? panel.columnSpan,
            minSize.columnSpan,
            BOARD_COLUMNS,
          ),
          rowSpan: _.clamp(
            action.rowSpan ?? panel.rowSpan,
            minSize.rowSpan,
            MAX_ROW_SPAN,
          ),
        });
      }
      case 'setRange':
        return panel
          ? updatePanel(current, action.id, {
              settings: mergeSettings(panel.settings, { range: action.range }),
            })
          : current;
    }
    return current;
  }, board);

/** The ids whose saved settings an action changes, so their header picks are dropped. */
export const settingsTouchedBy = (
  actions: ReadonlyArray<DashboardAssistantAction>,
): Array<string> | 'all' =>
  actions.some((action) => action.type === 'reset')
    ? 'all'
    : actions.flatMap((action) =>
        action.type === 'setRange' || action.type === 'hide' ? [action.id] : [],
      );

const cardLine = (card: DashboardAssistantCard) =>
  [
    card.id,
    card.title,
    card.shown ? 'on board' : 'not on board',
    card.shown && card.columnSpan
      ? `size ${card.columnSpan}x${card.rowSpan}`
      : undefined,
    card.range !== undefined ? `range ${card.range}` : undefined,
  ]
    .filter(Boolean)
    .join(' | ');

/** The system prompt section that lets the assistant propose dashboard changes. */
export const buildDashboardPromptSection = (
  bridge: Pick<DashboardAssistantBridge, 'page' | 'cards'>,
): string =>
  [
    '## Dashboard editing',
    `The user is on a dashboard page (${bridge.page}). You can change this dashboard for them. Its cards, on-board ones in board order (id | title | state | size in columns x rows | range):`,
    bridge.cards.map((card) => `- ${cardLine(card)}`).join('\n'),
    [
      'When the user asks to change the dashboard, reply with one short sentence and end the reply with exactly one block:',
      `${OPEN_FENCE}\n{"actions":[{"type":"show","id":"<card id>"}]}\n\`\`\``,
      'Action types: show {id}, hide {id}, moveToTop {id}, moveToBottom {id}, ' +
        `resize {id, columnSpan 1-${BOARD_COLUMNS}, rowSpan 1-${MAX_ROW_SPAN}}, ` +
        `setRange {id, range: ${RANGE_PRESETS.join(' | ')}} (only cards with a range), reset {} (the default layout).`,
      'Use only ids from the list above, and match a card by its title in any language. The user applies the change with a button, so never say it is already done. Do not add the block when the user only asks a question.',
    ].join('\n'),
  ].join('\n\n');
