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
import { panelConfigFromInput, settingsFromInput } from './defaults';
import {
  RANGE_PRESETS,
  isRangePreset,
  mergeSettings,
  type RangePreset,
} from './panelSettings';
import type {
  DashboardBoard,
  PanelDefinition,
  PanelInput,
  PanelPage,
  PersistedPanelV2,
} from './types';
import * as _ from 'lodash-es';

/** The board grid's column count (BAIBoard). */
const BOARD_COLUMNS = 4;
const MAX_ROW_SPAN = 12;

/** One change the WebUI Assistant proposes to the dashboard the user is on. */
export type DashboardAssistantAction =
  | { type: 'show' | 'hide' | 'moveToTop' | 'moveToBottom'; id: string }
  | { type: 'resize'; id: string; columnSpan?: number; rowSpan?: number }
  | { type: 'setRange'; id: string; range: RangePreset }
  | { type: 'reset' }
  /** A new custom panel; its id is fixed when the reply is read, so a preview keeps it. */
  | { type: 'addPanel'; panel: PersistedPanelV2 }
  /** A custom panel's full new configuration. */
  | { type: 'editPanel'; id: string; input: PanelInput }
  /** A new board; the actions after it apply to that board. */
  | { type: 'createBoard'; title: string };

/** The id of the card an action changes, if it changes one. */
export const actionTargetId = (
  action: DashboardAssistantAction,
): string | undefined =>
  action.type === 'reset' || action.type === 'createBoard'
    ? undefined
    : action.type === 'addPanel'
      ? action.panel.id
      : action.id;

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

/** The JSON a reply carries: a `dashboard-actions` (or any) fence, else its outermost braces. */
export const jsonOfReply = (text: string): unknown => {
  const fenced = /```(?:[\w-]+)?\s*([\s\S]*?)```/.exec(text);
  const body = fenced
    ? fenced[1]
    : text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  try {
    return body ? JSON.parse(body) : undefined;
  } catch {
    return undefined;
  }
};

/** The dashboard actions in a model reply, sanitized against `cards`. */
export const parseDashboardActions = (
  text: string,
  cards: ReadonlyArray<AssistantCardRef>,
): Array<DashboardAssistantAction> =>
  sanitizeAssistantActions(jsonOfReply(text), cards);

/** The action changes nothing on the board as `cards` describe it. */
export const isNoopAction = (
  action: DashboardAssistantAction,
  cards: ReadonlyArray<DashboardAssistantCard>,
): boolean => {
  if (
    action.type === 'reset' ||
    action.type === 'createBoard' ||
    action.type === 'addPanel' ||
    action.type === 'editPanel'
  )
    return false;
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
  /** The board a `createBoard` action starts from; without it the action is skipped. */
  emptyBoard?: DashboardBoard;
}

/** `actions` applied to `board` in order; an action that does not fit the board is skipped. */
export const applyAssistantActions = (
  board: DashboardBoard,
  actions: ReadonlyArray<DashboardAssistantAction>,
  {
    definitionByKey,
    catalog,
    page,
    template,
    emptyBoard,
  }: ApplyAssistantActionsContext,
): DashboardBoard =>
  actions.reduce((current, action) => {
    if (action.type === 'reset')
      return resetBoard(current, catalog, page, template);
    if (action.type === 'createBoard') return emptyBoard ?? current;
    if (action.type === 'addPanel') {
      const definition = definitionByKey.get(action.panel.key);
      return definition ? addPanel(current, definition, action.panel) : current;
    }
    if (action.type === 'editPanel') {
      const panel = current.panels.find((item) => item.id === action.id);
      const next = panelConfigFromInput(action.input);
      const definition = definitionByKey.get(next.key);
      if (!panel || !definition) return current;
      // A kind switch rewrites the size, as the panel modal's edit does.
      const resized =
        panel.viz !== next.viz
          ? {
              ...sizeOf(definition, next.viz).defaultSize,
              columnOffset: undefined,
            }
          : {};
      return updatePanel(current, action.id, {
        ...next,
        ...resized,
        settings: settingsFromInput(panel.settings, action.input),
      });
    }
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
        action.type === 'setRange' ||
        action.type === 'hide' ||
        action.type === 'editPanel'
          ? [action.id]
          : [],
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

/** The system prompt that turns one request into dashboard actions. */
export const buildDashboardEditPrompt = ({
  page,
  cards,
}: {
  page: PanelPage;
  cards: ReadonlyArray<DashboardAssistantCard>;
}): string =>
  [
    `You edit a Backend.AI WebUI dashboard (${page} page). Turn the user's request into changes to this dashboard.`,
    'Cards, on-board ones in board order (id | title | state | size in columns x rows | range):',
    cards.map((card) => `- ${cardLine(card)}`).join('\n'),
    'Reply with only a JSON object, no other text:',
    '{"actions":[{"type":"show","id":"<card id>"}]}',
    `Action types: show {id}, hide {id}, moveToTop {id}, moveToBottom {id}, resize {id, columnSpan 1-${BOARD_COLUMNS}, rowSpan 1-${MAX_ROW_SPAN}}, setRange {id, range: ${RANGE_PRESETS.join(' | ')}} (only cards with a range), reset {} (the default layout).`,
    'Copy the id exactly from the list. Match the card the user names by its title, in any language. Check the state first: never show a card that is already on board or hide one that is not. If nothing in the list fits, reply {"actions":[]}.',
  ].join('\n\n');
