/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { generateUUID } from '../../helper/uuid';
import { AGENT_PREFILL_PARAM } from '../../helper/webmcpConstants';
import {
  actionTargetId,
  BOARD_COLUMNS,
  MAX_ROW_SPAN,
  type DashboardAssistantAction,
} from './assistantActions';
import {
  parseDashboardChatReply,
  type DashboardChatContext,
  type DashboardChatPanel,
} from './dashboardChat';
import {
  PANEL_FIELDS_HELP,
  describePanelSources,
  inputOfDraft,
  panelDraftOf,
  type PanelCondition,
} from './panelFromRequest';
import { RANGE_PRESETS } from './panelSettings';
import { CHART_TYPES, PANEL_TYPES } from './types';
import type { WebMCPInputSchema, WebMCPTool } from 'backend.ai-ui';
import * as _ from 'lodash-es';

/** Search param carrying the changes `bai_prepare_dashboard` previews, as raw action objects. */
export const DASHBOARD_DRAFT_PARAM = 'dashboardDraft';

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

// Below the 8 KB request line of default aiohttp and nginx; not measured on a deployment.
export const WEBUI_URL_SOFT_LIMIT = 6000;

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
      description: `resize only: width in columns of a ${BOARD_COLUMNS}-column grid; clamped to the card's minimum.`,
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
      description: 'addPanel / editPanel: a source key from sources[].key.',
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
        'addPanel / editPanel: the panel filter, conditions separated by ";", each "<property> <operator> <value>" with a property, operator and value sourcesHelp lists for the source; "in" and "notIn" take comma-separated values. Example: "status == RUNNING; type in INTERACTIVE,BATCH". editPanel without conditions keeps the panel\'s own; an empty string removes them.',
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
  const raw: Record<string, unknown> = { type, ..._.omitBy(fields, _.isNil) };
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
  return raws.map((raw) => {
    const [action = null] = parseDashboardChatReply(
      JSON.stringify({ actions: [raw] }),
      current,
    ).actions;
    if (action?.type !== 'addPanel') return { raw, action };
    const storedId = (raw as Record<string, unknown>).id;
    // The tool stores the id it showed the agent, so later edits name the same panel.
    const kept: DashboardAssistantAction =
      typeof storedId === 'string' && STORED_ID.test(storedId)
        ? { ...action, panel: { ...action.panel, id: storedId } }
        : action;
    const panel =
      kept.type === 'addPanel'
        ? panelOfAdd(raw as Record<string, unknown>, kept, current)
        : null;
    if (panel) current = { ...current, panels: [...current.panels, panel] };
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
        reason: `"${String(raw.id)}" is not a custom panel on this board; see panels.`,
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
    reason: `"${String(raw.id)}" is not a card on this board; see cards.`,
  };
};

export const PREPARE_DASHBOARD_NEXT_STEP =
  'The change is previewed on the dashboard in this tab, marked as proposed by an AI agent; nothing is saved. Call again for more changes, then give webui_url to the user: they open it in their own signed-in browser, review the preview and press Apply or Discard (the user must do this).';

export const PREPARE_DASHBOARD_REJECTED =
  'The change was not added, and the preview was left as it was. Fix the rejected field and call again, or tell the user what could not be done.';

export const PREPARE_DASHBOARD_LINK_TOO_LONG =
  'webui_url is long enough that a server may refuse it (see warnings). Tell the user to apply the changes so far in this tab first, or call with clearDraft and fewer changes.';

export interface DashboardWebMCPDeps {
  /** The board on screen as the assistant reads it, draft included. */
  getContext: () => DashboardChatContext;
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
    "Read the dashboard open in this tab, as it is previewed now. Returns { page, cards: [{ id, title, onBoard, columnSpan?, rowSpan?, range? }], panels: [{ id, title, resourceType, panelType, filter }], sources: [{ key, label, panelTypes }], sourcesHelp, panelFieldsHelp, canCreateBoard, draft: [string] }. cards are the cards this user can place, on the board or not; panels are the custom panels; sourcesHelp lists each source's filter properties with their operators and allowed values, for bai_prepare_dashboard conditions; draft describes the changes previewed and not yet applied. Change the board with bai_prepare_dashboard.",
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: () => {
    const ctx = getContext();
    const draft = draftOfRawActions(getRawDraft(), ctx);
    return {
      page: ctx.page,
      cards: cardsOf(ctx),
      panels: panelsOf(ctx),
      sources: ctx.sources.map((source) => ({
        key: source.key,
        label: source.label,
        panelTypes: source.panelTypes,
      })),
      sourcesHelp: describePanelSources(ctx.sources),
      panelFieldsHelp: PANEL_FIELDS_HELP,
      canCreateBoard: ctx.canCreateBoard,
      draft: _.compact(draft.map(({ action }) => action && describe(action))),
    };
  },
});

/** `bai_prepare_dashboard` (ADR 0025): adds one change to the preview; it never saves. */
export const createPrepareDashboardTool = ({
  getContext,
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
    const built = rawActionOfInput(request);
    if (!('raw' in built)) return reject(built);
    const ctx = getContext();
    const base = request.clearDraft ? [] : getRawDraft();
    if (base.length >= MAX_DRAFT_ACTIONS) {
      return reject({
        field: 'type',
        reason: `The preview already holds ${MAX_DRAFT_ACTIONS} changes; ask the user to apply or discard them first.`,
      });
    }
    // Resolved against the saved board plus the earlier changes, as the link will be.
    const [result] = draftOfRawActions([built.raw], ctx);
    const action = result?.action;
    if (!action) return reject(rejectionOf(built.raw, ctx));
    // The id resolved here is stored, so the link does not depend on fuzzy matching.
    const target = actionTargetId(action);
    const stored = target ? { ...built.raw, id: target } : built.raw;
    const raws = [...base, stored];
    const params = new URLSearchParams(getSearch());
    params.set(DASHBOARD_DRAFT_PARAM, JSON.stringify(raws));
    params.set(AGENT_PREFILL_PARAM, generateUUID());
    const search = `?${params.toString()}`;
    openPreview(search);
    const path = pathWith(search);
    const webuiUrl = new URL(path, window.location.origin).href;
    const isLinkTooLong = webuiUrl.length > WEBUI_URL_SOFT_LIMIT;
    const draft = draftOfRawActions(raws, ctx);
    return {
      path,
      webui_url: webuiUrl,
      applied: [describe(action)],
      rejected: [],
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
      nextStep: isLinkTooLong
        ? PREPARE_DASHBOARD_LINK_TOO_LONG
        : PREPARE_DASHBOARD_NEXT_STEP,
    };
  },
});
