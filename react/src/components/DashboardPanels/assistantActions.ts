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
  /** Outlines a card on the board, or clears the outline with `null`. */
  highlight: (id: string | null) => void;
  /** Scrolls to a card once the board has rendered it, and flashes it. */
  reveal: (id: string) => void;
}

/** Set while a dashboard page is mounted. */
export const dashboardAssistantBridgeAtom =
  atom<DashboardAssistantBridge | null>(null);

const OPEN_FENCE = '```' + DASHBOARD_ACTIONS_FENCE;

const toInt = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.round(value)
    : undefined;

type AssistantCardRef = Pick<DashboardAssistantCard, 'id' | 'title' | 'range'>;

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

const bigrams = (value: string) =>
  Array.from({ length: Math.max(value.length - 1, 0) }, (_v, i) =>
    value.slice(i, i + 2),
  );

/** Sørensen-Dice similarity of two strings' character bigrams, 0 to 1. */
const similarity = (a: string, b: string) => {
  const left = bigrams(a);
  const right = bigrams(b);
  if (!left.length || !right.length) return a === b ? 1 : 0;
  const pool = [...right];
  const shared = left.filter((pair) => {
    const index = pool.indexOf(pair);
    if (index < 0) return false;
    pool.splice(index, 1);
    return true;
  }).length;
  return (2 * shared) / (left.length + right.length);
};

const MIN_ID_SIMILARITY = 0.75;

/**
 * The listed card `id` names. Small models paraphrase ids
 * (`pendingSessionsReasons` for `pendingSessions`), so an inexact id takes the
 * card whose id or title is clearly the closest, and none when two tie.
 */
const resolveCardId = (
  id: unknown,
  cards: ReadonlyArray<AssistantCardRef>,
): string | undefined => {
  if (typeof id !== 'string') return undefined;
  if (cards.some((card) => card.id === id)) return id;
  const key = normalize(id);
  if (!key) return undefined;
  const [best, second] = _.orderBy(
    cards.map((card) => ({
      id: card.id,
      score: Math.max(
        similarity(key, normalize(card.id)),
        similarity(key, normalize(card.title)),
      ),
    })),
    'score',
    'desc',
  );
  return best &&
    best.score >= MIN_ID_SIMILARITY &&
    best.score > (second?.score ?? 0)
    ? best.id
    : undefined;
};

/** The actions in a raw JSON value, keeping only the well-formed ones on listed cards. */
export const sanitizeAssistantActions = (
  value: unknown,
  cards: ReadonlyArray<AssistantCardRef>,
): Array<DashboardAssistantAction> => {
  const list = Array.isArray(value)
    ? value
    : _.isPlainObject(value) &&
        Array.isArray((value as { actions?: unknown }).actions)
      ? (value as { actions: Array<unknown> }).actions
      : [];
  return list.flatMap((raw): Array<DashboardAssistantAction> => {
    if (!_.isPlainObject(raw)) return [];
    const { type, columnSpan, rowSpan, range, ...rest } = raw as Record<
      string,
      unknown
    >;
    if (type === 'reset') return [{ type }];
    const id = resolveCardId(rest.id, cards);
    if (!id) return [];
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
        // Only cards listed with a range take one.
        return isRangePreset(range) &&
          cards.find((card) => card.id === id)?.range !== undefined
          ? [{ type, id, range }]
          : [];
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
  cards: ReadonlyArray<AssistantCardRef>,
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
  return { text: visible, actions: sanitizeAssistantActions(parsed, cards) };
};

/** The action changes nothing on the board as `cards` describe it. */
export const isNoopAction = (
  action: DashboardAssistantAction,
  cards: ReadonlyArray<DashboardAssistantCard>,
): boolean => {
  if (action.type === 'reset') return false;
  const card = cards.find((item) => item.id === action.id);
  if (!card) return true;
  const shown = cards.filter((item) => item.shown);
  switch (action.type) {
    case 'show':
      return card.shown;
    case 'hide':
      return !card.shown;
    case 'moveToTop':
      return !card.shown || shown[0]?.id === card.id;
    case 'moveToBottom':
      return !card.shown || shown[shown.length - 1]?.id === card.id;
    case 'resize':
      return (
        !card.shown ||
        ((action.columnSpan ?? card.columnSpan) === card.columnSpan &&
          (action.rowSpan ?? card.rowSpan) === card.rowSpan)
      );
    case 'setRange':
      return card.range === action.range;
  }
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
      'Copy the id exactly as it appears before the first | in the list; never make one up. Match the card the user names by its title, in any language. Check the state column first: never show a card that is already on board or hide one that is not; say so instead. The user applies the change with a button, so never say it is already done. Do not add the block when the user only asks a question.',
    ].join('\n'),
  ].join('\n\n');
