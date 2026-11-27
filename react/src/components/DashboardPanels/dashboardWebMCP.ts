/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { generateUUID } from '../../helper/uuid';
import {
  AGENT_PREFILL_PARAM,
  DASHBOARD_DRAFT_PARAM,
  WEBUI_URL_SOFT_LIMIT,
} from '../../helper/webmcpConstants';
import {
  actionTargetId,
  BOARD_COLUMNS,
  isNoopAction,
  MAX_ROW_SPAN,
  type DashboardAssistantAction,
} from './assistantActions';
import {
  parseDashboardChatReply,
  type DashboardChatContext,
  type DashboardChatPanel,
} from './dashboardChat';
import {
  describePanelSources,
  inputOfDraft,
  panelDraftOf,
  sanitizeConditions,
  type PanelCondition,
} from './panelFromRequest';
import { RANGE_PRESETS } from './panelSettings';
import { CHART_TYPES, PANEL_TYPES } from './types';
import type { WebMCPInputSchema, WebMCPTool } from 'backend.ai-ui';
import * as _ from 'lodash-es';

export { DASHBOARD_DRAFT_PARAM };

const ACTION_TYPES = [
  'show',
  'hide',
  'moveToTop',
  'moveToBottom',
  'resize',
  'setRange',
  'reset',
  'addPanel',
  'editPanel',
  'createBoard',
] as const;

const ID_TYPES = [
  'show',
  'hide',
  'moveToTop',
  'moveToBottom',
  'resize',
  'setRange',
  'editPanel',
];

export const PREPARE_DASHBOARD_INPUT_SCHEMA: WebMCPInputSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ACTION_TYPES,
      description:
        'The change. show / hide / moveToTop / moveToBottom / resize / setRange take id. reset restores the default layout. addPanel adds a custom panel from resourceType, panelType and the optional fields. editPanel changes the named fields of the custom panel id. createBoard (pages with boards only) starts a new board titled title; the changes after it land on that board.',
    },
    id: {
      type: 'string',
      minLength: 1,
      maxLength: 200,
      description:
        'A card or custom panel id from bai_get_current_dashboard (cards[].id, panels[].id).',
    },
    columnSpan: {
      type: 'integer',
      minimum: 1,
      maximum: BOARD_COLUMNS,
      description: `resize only: width in columns; the grid has 4 to ${BOARD_COLUMNS} columns depending on the screen. Clamped to the card's minimum.`,
    },
    rowSpan: {
      type: 'integer',
      minimum: 1,
      maximum: MAX_ROW_SPAN,
      description:
        "resize only: height in rows; clamped to the card's minimum.",
    },
    range: {
      type: 'string',
      enum: RANGE_PRESETS,
      description:
        'setRange: the range of a card listed with a range. addPanel / editPanel: the range of a chart over time.',
    },
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 200,
      description:
        'addPanel / editPanel: the panel title. createBoard: the board title.',
    },
    resourceType: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      description:
        'addPanel / editPanel: a source key from sources[].key (bai_get_current_dashboard with withSources).',
    },
    panelType: {
      type: 'string',
      enum: PANEL_TYPES,
      description:
        'addPanel / editPanel: resourceTable (rows), resourceCount (a number), resourceChart (a chart), sessionResourceGrid (session cards). Only the types the source lists.',
    },
    chartType: {
      type: 'string',
      enum: CHART_TYPES,
      description: 'resourceChart only.',
    },
    groupBy: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      description:
        'resourceChart only: a grouping key from the source in sourcesHelp.',
    },
    conditions: {
      type: 'string',
      maxLength: 2000,
      description:
        'addPanel / editPanel: the panel filter, conditions separated by ";", each "<property> <operator> <value>" with a property, operator and value sourcesHelp lists for the source; "in" and "notIn" take comma-separated values. Example: "status == RUNNING". editPanel without conditions keeps the panel\'s own; an empty string removes them.',
    },
    clearDraft: {
      type: 'boolean',
      description:
        'Drop the changes previewed so far before adding this one. Defaults to false: changes accumulate.',
    },
  },
  required: ['type'],
  additionalProperties: false,
};

export interface PrepareDashboardInput {
  type: (typeof ACTION_TYPES)[number];
  id?: string;
  columnSpan?: number;
  rowSpan?: number;
  range?: string;
  title?: string;
  resourceType?: string;
  panelType?: string;
  chartType?: string;
  groupBy?: string;
  conditions?: string;
  clearDraft?: boolean;
}

const unquote = (value: string) =>
  /^(["']).*\1$/.test(value) ? value.slice(1, -1) : value;

/** `"status == RUNNING; type in A,B"` as conditions, or the first part that does not read. */
export const parseConditionsText = (
  text: string,
): { conditions: Array<PanelCondition> } | { invalid: string } => {
  const conditions: Array<PanelCondition> = [];
  for (const part of text.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const match = /^(\S+)\s+(\S+)\s+(.+)$/.exec(trimmed);
    if (!match) return { invalid: trimmed };
    const [, property, operator, rawValue] = match;
    const value = unquote(rawValue.trim());
    conditions.push({
      property,
      operator,
      value:
        operator === 'in' || operator === 'notIn'
          ? _.compact(value.split(',').map((item) => unquote(item.trim())))
          : value,
    });
  }
  return { conditions };
};

/** The action object the assistant's parser reads, from the tool's flat input. */
export const rawActionOfInput = (
  input: PrepareDashboardInput,
): { raw: Record<string, unknown> } | { field: string; reason: string } => {
  const { type, conditions, ...rest } = input;
  const fields = _.omit(rest, 'clearDraft');
  if (ID_TYPES.includes(type) && !fields.id) {
    return { field: 'id', reason: `${type} needs the id of a card or panel.` };
  }
  if (type === 'createBoard' && !fields.title) {
    return { field: 'title', reason: 'createBoard needs a title.' };
  }
  if (type === 'addPanel' && !fields.resourceType) {
    return { field: 'resourceType', reason: 'addPanel needs a resourceType.' };
  }
  // A new panel's id is made here, never taken from the input.
  const given = type === 'addPanel' ? _.omit(fields, 'id') : fields;
  const raw: Record<string, unknown> = { type, ..._.omitBy(given, _.isNil) };
  if (conditions !== undefined) {
    const parsed = parseConditionsText(conditions);
    if ('invalid' in parsed) {
      return {
        field: 'conditions',
        reason: `"${parsed.invalid}" is not "<property> <operator> <value>".`,
      };
    }
    raw.conditions = parsed.conditions;
  }
  return { raw };
};

const panelOfAdd = (
  raw: Record<string, unknown>,
  action: Extract<DashboardAssistantAction, { type: 'addPanel' }>,
  ctx: DashboardChatContext,
): DashboardChatPanel | null => {
  const draft = panelDraftOf(raw, ctx.sources);
  return draft
    ? {
        id: action.panel.id,
        title: action.panel.title ?? '',
        input: inputOfDraft(draft),
      }
    : null;
};

const STORED_ID = /^[\w-]{1,200}$/;

/**
 * The raw actions read in order with the assistant's own parser. Each sees
 * the custom panels the earlier ones added, so an `editPanel` on a panel this
 * draft added still resolves when the link opens on the saved board.
 */
export const draftOfRawActions = (
  raws: ReadonlyArray<unknown>,
  ctx: DashboardChatContext,
): Array<{ raw: unknown; action: DashboardAssistantAction | null }> => {
  let current = ctx;
  let hasNewBoard = false;
  return raws.map((raw) => {
    const [action = null] = parseDashboardChatReply(
      JSON.stringify({ actions: [raw] }),
      current,
    ).actions;
    // Every createBoard starts the same empty board, so a second would drop what the first collected.
    if (action?.type === 'createBoard') {
      if (hasNewBoard) return { raw, action: null };
      hasNewBoard = true;
    }
    if (action?.type !== 'addPanel') return { raw, action };
    const storedId = (raw as Record<string, unknown>).id;
    // The tool stores the id it showed the agent, so later edits name the same panel.
    const isFreeId =
      typeof storedId === 'string' &&
      STORED_ID.test(storedId) &&
      !current.cards.some((card) => card.id === storedId) &&
      !current.panels.some((panel) => panel.id === storedId);
    const kept: DashboardAssistantAction =
      isFreeId && typeof storedId === 'string'
        ? { ...action, panel: { ...action.panel, id: storedId } }
        : action;
    const panel =
      kept.type === 'addPanel'
        ? panelOfAdd(raw as Record<string, unknown>, kept, current)
        : null;
    // Listed as a card too, so a later resize, move or hide on it resolves.
    if (panel)
      current = {
        ...current,
        panels: [...current.panels, panel],
        cards: [
          ...current.cards,
          { id: panel.id, title: panel.title, shown: true },
        ],
      };
    return { raw, action: kept };
  });
};

/** The raw action list in a `dashboardDraft` value; anything but a JSON array reads as none. */
export const rawActionsOfParam = (
  value: string | null | undefined,
): Array<unknown> => {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_DRAFT_ACTIONS) : [];
  } catch {
    return [];
  }
};

export const MAX_DRAFT_ACTIONS = 50;

/**
 * Whether `action` changes nothing after the earlier draft changes. Only shown /
 * hidden is followed through the draft; after a reset or a new board, or for
 * another kind of change behind earlier ones, it is never called a no-op.
 */
const isNoopOnDraft = (
  action: DashboardAssistantAction,
  earlier: ReadonlyArray<{ action: DashboardAssistantAction | null }>,
  saved: DashboardChatContext,
): boolean => {
  const prior = _.compact(earlier.map((item) => item.action));
  if (!prior.length) return isNoopAction(action, saved.cards);
  if (action.type !== 'show' && action.type !== 'hide') return false;
  if (
    prior.some((item) => item.type === 'reset' || item.type === 'createBoard')
  )
    return false;
  const shown = new Map(saved.cards.map((card) => [card.id, card.shown]));
  for (const item of prior) {
    if (item.type === 'show') shown.set(item.id, true);
    if (item.type === 'hide') shown.set(item.id, false);
    if (item.type === 'addPanel') shown.set(item.panel.id, true);
  }
  return shown.get(action.id) === (action.type === 'show');
};

/** The conditions of an addPanel / editPanel the source does not accept, as "<property> <operator> <value>". */
const droppedConditionsOf = (
  raw: Record<string, unknown>,
  action: DashboardAssistantAction,
  ctx: DashboardChatContext,
): Array<string> => {
  if (!Array.isArray(raw.conditions)) return [];
  const resourceType =
    action.type === 'editPanel' ? action.input.resourceType : raw.resourceType;
  const source = ctx.sources.find((item) => item.key === resourceType);
  if (!source) return [];
  return (raw.conditions as Array<PanelCondition>)
    .filter((condition) => !sanitizeConditions([condition], source).length)
    .map(({ property, operator, value }) =>
      [property, operator, ([] as Array<string>).concat(value).join(',')].join(
        ' ',
      ),
    );
};

// The ids an agent can use, so a retry needs no second read.
const idsOf = (items: ReadonlyArray<{ id: string; title: string }>) =>
  items.map((item) => `${item.id} (${item.title})`).join(', ');

const rejectionOf = (
  raw: Record<string, unknown>,
  ctx: DashboardChatContext,
): { field: string; reason: string } => {
  const type = raw.type as PrepareDashboardInput['type'];
  if (type === 'createBoard' && !ctx.canCreateBoard) {
    return {
      field: 'type',
      reason: 'This page has a single board, so createBoard is not available.',
    };
  }
  if (type === 'addPanel' || type === 'editPanel') {
    if (
      raw.resourceType !== undefined &&
      !ctx.sources.some((source) => source.key === raw.resourceType)
    ) {
      return {
        field: 'resourceType',
        reason: `"${String(raw.resourceType)}" is not a source this user can add here; see sources.`,
      };
    }
    if (type === 'editPanel' && !ctx.panels.some((p) => p.id === raw.id)) {
      return {
        field: 'id',
        reason: `"${String(raw.id)}" is not a custom panel on this board. Panels: ${idsOf(ctx.panels) || 'none'}.`,
      };
    }
    return {
      field: 'conditions',
      reason:
        'None of the conditions names a property, operator and value listed for this source in sourcesHelp, so the panel was not changed.',
    };
  }
  if (type === 'setRange') {
    return {
      field: 'range',
      reason: `"${String(raw.id)}" is not a card listed with a range, or range is missing.`,
    };
  }
  if (
    type === 'resize' &&
    raw.columnSpan === undefined &&
    raw.rowSpan === undefined
  ) {
    return {
      field: 'columnSpan',
      reason: 'resize needs columnSpan or rowSpan.',
    };
  }
  return {
    field: 'id',
    reason: `"${String(raw.id)}" is not a card on this board. Pass one of these ids: ${idsOf(ctx.cards)}.`,
  };
};

export const PREPARE_DASHBOARD_NEXT_STEP =
  'The change is previewed on the dashboard in this tab, marked as proposed by an AI agent; nothing is saved. Call again for more changes, then give webui_url to the user: they open it in their own signed-in browser, review the preview and press Apply or Discard (the user must do this).';

export const PREPARE_DASHBOARD_REJECTED =
  'The change was not added, and the preview was left as it was. Fix the rejected field and call again, or tell the user what could not be done.';

export const PREPARE_DASHBOARD_PARTLY_APPLIED =
  'The change is previewed without the conditions listed in rejected. Call again with editPanel and valid conditions, or tell the user which ones were left out. Nothing is saved.';

export const PREPARE_DASHBOARD_LINK_TOO_LONG =
  'webui_url is long enough that a server may refuse it (see warnings). Tell the user to apply the changes so far in this tab first, or call with clearDraft and fewer changes.';

/** Field rules for addPanel / editPanel in this tool's flat input. */
export const PREPARE_PANEL_FIELDS_HELP = `panelType: resourceTable (rows), resourceCount (a number), resourceChart (a chart), sessionResourceGrid (session cards). chartType (charts only): ${CHART_TYPES.join(' ')}. range (charts over time only): ${RANGE_PRESETS.join(' ')}. conditions: text, "<property> <operator> <value>" separated by ";", with the keys, operators and values sourcesHelp lists for the source. For the signed-in user's own sessions ("my sessions"), a panel on the session source (any panelType, sessionResourceGrid included) takes the condition "user_id == <userId>" with the userId bai_whoami returns (the email may be masked); other sources have no user_id property.`;

export interface DashboardWebMCPDeps {
  /** The board on screen as the assistant reads it, draft included. */
  getContext: () => DashboardChatContext;
  /** The saved board, which the draft's changes are read against in order. */
  getSavedContext: () => DashboardChatContext;
  /** The raw actions the preview holds now. */
  getRawDraft: () => ReadonlyArray<unknown>;
  /** The current search params, so the board tab and filters carry over. */
  getSearch: () => string;
  /** This tab's browser path, router basename included, with `search` in place of the current one. */
  pathWith: (search: string) => string;
  /** Navigates this tab to `search`; the board previews the draft the URL carries. */
  openPreview: (search: string) => void;
  describe: (action: DashboardAssistantAction) => string;
}

const cardsOf = (ctx: DashboardChatContext) =>
  ctx.cards.map((card) => ({
    id: card.id,
    title: card.title,
    onBoard: card.shown,
    ...(card.shown && card.columnSpan
      ? { columnSpan: card.columnSpan, rowSpan: card.rowSpan }
      : {}),
    ...(card.range !== undefined ? { range: card.range } : {}),
  }));

const panelsOf = (ctx: DashboardChatContext) =>
  ctx.panels.map((panel) => ({
    id: panel.id,
    title: panel.title,
    resourceType: panel.input.resourceType,
    panelType: panel.input.panelType,
    filter: panel.input.filter ?? null,
  }));

/** `bai_get_current_dashboard` (ADR 0025): the board on screen, read only. */
export const createGetCurrentDashboardTool = ({
  getContext,
  getRawDraft,
  describe,
}: Pick<
  DashboardWebMCPDeps,
  'getContext' | 'getRawDraft' | 'describe'
>): WebMCPTool => ({
  name: 'bai_get_current_dashboard',
  description:
    "Read the dashboard open in this tab, as it is previewed now. Returns { page, cards: [{ id, title, onBoard, columnSpan?, rowSpan?, range? }], panels: [{ id, title, resourceType, panelType, filter }], canCreateBoard, draft: [string] }, and with withSources also { sources: [{ key, label, panelTypes }], sourcesHelp, panelFieldsHelp }. cards are the cards this user can place, on the board or not; panels are the custom panels; draft describes the changes previewed and not yet applied. Pass withSources before adding or editing a panel: sourcesHelp lists each source's filter properties with their operators and allowed values, for bai_prepare_dashboard conditions. Change the board with bai_prepare_dashboard.",
  inputSchema: {
    type: 'object',
    properties: {
      withSources: {
        type: 'boolean',
        description:
          'Also return the data sources and their filter properties, which a new or edited panel needs. Defaults to false.',
      },
    },
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: (input) => {
    const ctx = getContext();
    const draft = draftOfRawActions(getRawDraft(), ctx);
    return {
      page: ctx.page,
      cards: cardsOf(ctx),
      panels: panelsOf(ctx),
      canCreateBoard: ctx.canCreateBoard,
      draft: _.compact(draft.map(({ action }) => action && describe(action))),
      // Several kilobytes: a small model's whole context, so only on request.
      ...(input.withSources === true && {
        sources: ctx.sources.map((source) => ({
          key: source.key,
          label: source.label,
          panelTypes: source.panelTypes,
        })),
        sourcesHelp: describePanelSources(ctx.sources),
        panelFieldsHelp: PREPARE_PANEL_FIELDS_HELP,
      }),
    };
  },
});

/** `bai_prepare_dashboard` (ADR 0025): adds one change to the preview; it never saves. */
export const createPrepareDashboardTool = ({
  getContext,
  getSavedContext,
  getRawDraft,
  getSearch,
  pathWith,
  openPreview,
  describe,
}: DashboardWebMCPDeps): WebMCPTool => ({
  name: 'bai_prepare_dashboard',
  description:
    "Preview one change to the dashboard open in this tab for the user to review. Call bai_get_current_dashboard first for the ids, sources and filter properties. Changes accumulate in a preview, marked as proposed by an AI agent, until the user presses Apply or Discard on the dashboard; this tool never saves. Returns { path, webui_url, applied: [string], rejected: [{ field, reason }], draft: [string], target?, nextStep, warnings? }; webui_url opens the same preview in any browser signed in as this user. applied describes the change added, draft every previewed change, target the id of the card or panel it changed (addPanel: the new panel's id, for a later editPanel). When the change is rejected the preview is left as it was and path and webui_url are null.",
  inputSchema: PREPARE_DASHBOARD_INPUT_SCHEMA,
  annotations: { untrustedContentHint: true },
  execute: (input) => {
    const request = input as unknown as PrepareDashboardInput;
    const reject = (rejected: { field: string; reason: string }) => ({
      path: null,
      webui_url: null,
      applied: [],
      rejected: [rejected],
      nextStep: PREPARE_DASHBOARD_REJECTED,
    });
    const ctx = getContext();
    const built = rawActionOfInput(request);
    if (!('raw' in built)) {
      return reject(
        built.field === 'id'
          ? { ...built, reason: `${built.reason} Cards: ${idsOf(ctx.cards)}.` }
          : built,
      );
    }
    const base = request.clearDraft ? [] : getRawDraft();
    if (base.length >= MAX_DRAFT_ACTIONS) {
      return reject({
        field: 'type',
        reason: `The preview already holds ${MAX_DRAFT_ACTIONS} changes; ask the user to apply or discard them first.`,
      });
    }
    // Read in order against the saved board, as the link will be.
    const savedCtx = getSavedContext();
    const resolved = draftOfRawActions([...base, built.raw], savedCtx);
    const action = resolved[resolved.length - 1]?.action;
    if (!action) {
      return reject(
        built.raw.type === 'createBoard' &&
          base.some((raw) => (raw as { type?: unknown }).type === 'createBoard')
          ? {
              field: 'type',
              reason:
                'The preview already starts a new board; one per preview.',
            }
          : rejectionOf(built.raw, ctx),
      );
    }
    // A change the board already shows is not previewed, judged on the saved
    // board plus the earlier changes, not on the preview of the last render.
    if (isNoopOnDraft(action, resolved.slice(0, -1), savedCtx)) {
      return reject({
        field: 'type',
        reason: 'The board already shows this; nothing to change.',
      });
    }
    // The id resolved here is stored, so the link does not depend on fuzzy matching.
    const target = actionTargetId(action);
    const stored = target ? { ...built.raw, id: target } : built.raw;
    // A model that repeats a call would otherwise preview the same change twice.
    // A new panel's id is made per call, so only its other fields can repeat.
    const sameAs = (raw: unknown) =>
      action.type === 'addPanel'
        ? _.isEqual(_.omit(raw as object, 'id'), _.omit(stored, 'id'))
        : _.isEqual(raw, stored);
    // A show / hide / move after an opposite change is new again, so only the latest
    // counts for those; a panel, an edit or a reset repeats wherever it is.
    const repeatsAnywhere =
      action.type === 'addPanel' ||
      action.type === 'editPanel' ||
      action.type === 'reset';
    if (
      repeatsAnywhere
        ? base.some(sameAs)
        : base.length > 0 && sameAs(base[base.length - 1])
    ) {
      return reject({
        field: 'type',
        reason: 'This change is already in the preview.',
      });
    }
    const dropped = droppedConditionsOf(built.raw, action, savedCtx);
    const raws = [...base, stored];
    const params = new URLSearchParams(getSearch());
    params.set(DASHBOARD_DRAFT_PARAM, JSON.stringify(raws));
    params.set(AGENT_PREFILL_PARAM, generateUUID());
    const search = `?${params.toString()}`;
    openPreview(search);
    const path = pathWith(search);
    const webuiUrl = new URL(path, window.location.origin).href;
    const isLinkTooLong = webuiUrl.length > WEBUI_URL_SOFT_LIMIT;
    const draft = draftOfRawActions(raws, savedCtx);
    return {
      path,
      webui_url: webuiUrl,
      applied: [describe(action)],
      rejected: dropped.length
        ? [
            {
              field: 'conditions',
              reason: `Left out, not listed for this source in sourcesHelp: ${dropped.join('; ')}.`,
            },
          ]
        : [],
      draft: _.compact(
        draft.map((item) => item.action && describe(item.action)),
      ),
      ...(target ? { target } : {}),
      ...(isLinkTooLong && {
        warnings: [
          {
            field: 'webui_url',
            reason: `This link is ${webuiUrl.length} characters long and a server may refuse it.`,
          },
        ],
      }),
      nextStep: dropped.length
        ? PREPARE_DASHBOARD_PARTLY_APPLIED
        : isLinkTooLong
          ? PREPARE_DASHBOARD_LINK_TOO_LONG
          : PREPARE_DASHBOARD_NEXT_STEP,
    };
  },
});
