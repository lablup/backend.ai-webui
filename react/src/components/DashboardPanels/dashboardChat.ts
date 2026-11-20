/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  jsonValuesOfReply,
  sanitizeAssistantActions,
  type DashboardAssistantAction,
  type DashboardAssistantCard,
} from './assistantActions';
import { createPanel } from './defaults';
import {
  PANEL_FIELDS_HELP,
  describePanelSources,
  exampleConditionOf,
  inputOfDraft,
  panelDraftOf,
  type PanelSourceSpec,
} from './panelFromRequest';
import { RANGE_PRESETS } from './panelSettings';
import type { PanelInput, PanelPage } from './types';
import * as _ from 'lodash-es';

/** A custom panel on the (draft) board, with the input the panel modal would show. */
export interface DashboardChatPanel {
  id: string;
  title: string;
  input: PanelInput;
}

export interface DashboardChatContext {
  page: PanelPage;
  /** The draft board's cards, so a follow-up request sees what the chat already changed. */
  cards: ReadonlyArray<DashboardAssistantCard>;
  panels: ReadonlyArray<DashboardChatPanel>;
  sources: ReadonlyArray<PanelSourceSpec>;
  /** Pages with board tabs; the member page has a single board. */
  canCreateBoard: boolean;
}

const BOARD_COLUMNS = 4;
const MAX_ROW_SPAN = 12;
const LAYOUT_TYPES = [
  'show',
  'hide',
  'moveToTop',
  'moveToBottom',
  'resize',
  'setRange',
  'reset',
];

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

const panelLine = (panel: DashboardChatPanel) =>
  [
    panel.id,
    panel.title,
    panel.input.resourceType,
    panel.input.panelType,
    panel.input.filter
      ? typeof panel.input.filter === 'string'
        ? panel.input.filter
        : JSON.stringify(panel.input.filter)
      : 'no condition',
  ].join(' | ');

/** Worked examples from this board and its sources; a small model follows an example better than a rule. */
const examplesOf = (ctx: DashboardChatContext): string => {
  const card = ctx.cards.find((item) => item.shown);
  const source = ctx.sources.find((item) => exampleConditionOf(item));
  const condition = source && exampleConditionOf(source);
  const lines = [
    card &&
      `User: Hide the ${card.title} card\n${JSON.stringify({
        reply: `Hid the ${card.title} card.`,
        actions: [{ type: 'hide', id: card.id }],
      })}`,
    source &&
      condition &&
      `User: Add a table of ${source.label.toLowerCase()} whose ${condition.label.toLowerCase()} is ${condition.value}\n${JSON.stringify(
        {
          reply: `Added a table of ${source.label.toLowerCase()}.`,
          actions: [
            {
              type: 'addPanel',
              resourceType: source.key,
              panelType: 'resourceTable',
              title: `${condition.value} ${source.label}`,
              conditions: [
                {
                  property: condition.property,
                  operator: condition.operator,
                  value: condition.value,
                },
              ],
            },
          ],
        },
      )}`,
  ].filter(Boolean);
  return lines.length ? ['Examples:', ...lines].join('\n') : '';
};

/** The system prompt of the dashboard chat, built from the draft board. */
export const buildDashboardChatPrompt = (ctx: DashboardChatContext): string =>
  [
    `You edit a Backend.AI WebUI dashboard (${ctx.page} page) in a chat. Turn each request into changes. Reply with only a JSON object, no other text:`,
    '{"reply":"<one short sentence in the user\'s language>","actions":[{"type":"show","id":"<card id>"}]}',
    'Cards, on-board ones in board order (id | title | state | size in columns x rows | range):',
    ctx.cards.map((card) => `- ${cardLine(card)}`).join('\n'),
    ctx.panels.length
      ? [
          'Custom panels (id | title | source | type | condition):',
          ctx.panels.map((panel) => `- ${panelLine(panel)}`).join('\n'),
        ].join('\n')
      : 'There are no custom panels yet.',
    'Data sources for new panels:',
    describePanelSources(ctx.sources),
    [
      'Actions:',
      '- show {id}, hide {id}, moveToTop {id}, moveToBottom {id}',
      `- resize {id, columnSpan 1-${BOARD_COLUMNS}, rowSpan 1-${MAX_ROW_SPAN}}`,
      `- setRange {id, range: ${RANGE_PRESETS.join(' | ')}} (only cards with a range)`,
      '- reset {} (the default layout)',
      '- addPanel {resourceType, panelType, title, conditions, chartType, groupBy, range}: a new custom panel',
      '- editPanel {id, and only the fields to change}: change a custom panel; conditions replaces its condition',
      ...(ctx.canCreateBoard
        ? [
            '- createBoard {title}: a new empty board; the actions after it fill that board',
          ]
        : []),
      PANEL_FIELDS_HELP,
    ].join('\n'),
    examplesOf(ctx),
    'Copy ids exactly from the lists. Match what the user names by its title, in any language; "it" or "that" means the panel or card changed last. Check the state first: never show a card that is already on board or hide one that is not. If nothing fits, return "actions":[] and say why in "reply".',
  ].join('\n\n');

/** A custom panel's id as the model wrote it, matched loosely like a card id. */
const resolvePanelId = (
  value: unknown,
  panels: ReadonlyArray<DashboardChatPanel>,
): DashboardChatPanel | undefined => {
  if (typeof value !== 'string') return undefined;
  const [id] = sanitizeAssistantActions(
    [{ type: 'hide', id: value }],
    panels.map((panel) => ({ id: panel.id, title: panel.title })),
  ).map((action) => (action.type === 'hide' ? action.id : undefined));
  return panels.find((panel) => panel.id === id);
};

/** The input an `editPanel` object asks for: the panel's own, with the named fields changed. */
const editedInputOf = (
  raw: Record<string, unknown>,
  panel: DashboardChatPanel,
  sources: ReadonlyArray<PanelSourceSpec>,
): PanelInput | null => {
  const base = panel.input;
  const draft = panelDraftOf(
    {
      resourceType: raw.resourceType ?? base.resourceType,
      panelType: raw.panelType ?? base.panelType,
      title: raw.title ?? base.title,
      conditions: raw.conditions,
      chartType: raw.chartType ?? base.chart?.type,
      groupBy: raw.groupBy ?? base.chart?.groupBy,
      range: raw.range ?? base.range,
    },
    sources,
  );
  if (!draft) return null;
  const sameSource = draft.resourceType === base.resourceType;
  const input = inputOfDraft(draft);
  return {
    ...input,
    // An omitted condition keeps the panel's own, which only fits its own source.
    filter:
      'conditions' in raw
        ? input.filter
        : sameSource
          ? (base.filter ?? null)
          : null,
    order: sameSource ? (base.order ?? null) : null,
    gridView: sameSource ? (base.gridView ?? null) : null,
  };
};

/** The reply text and the checked actions of one chat answer. */
export const parseDashboardChatReply = (
  text: string,
  ctx: DashboardChatContext,
): { reply: string; actions: Array<DashboardAssistantAction> } => {
  const values = jsonValuesOfReply(text);
  const objects = values.filter(_.isPlainObject) as Array<
    Record<string, unknown>
  >;
  // Several objects in one reply each carry part of the answer.
  const rawActions = [
    ...objects.flatMap((object) =>
      Array.isArray(object.actions) ? object.actions : [],
    ),
    ...values.filter(Array.isArray).flat(),
  ];
  const actions = rawActions.flatMap(
    (value): Array<DashboardAssistantAction> => {
      if (!_.isPlainObject(value)) return [];
      const raw = value as Record<string, unknown>;
      if (LAYOUT_TYPES.includes(raw.type as string)) {
        return sanitizeAssistantActions([raw], ctx.cards);
      }
      if (raw.type === 'addPanel') {
        const draft = panelDraftOf(raw, ctx.sources);
        return draft
          ? [{ type: 'addPanel', panel: createPanel(inputOfDraft(draft)) }]
          : [];
      }
      if (raw.type === 'editPanel') {
        const panel = resolvePanelId(raw.id, ctx.panels);
        const input = panel ? editedInputOf(raw, panel, ctx.sources) : null;
        return panel && input
          ? [{ type: 'editPanel', id: panel.id, input }]
          : [];
      }
      if (raw.type === 'createBoard' && ctx.canCreateBoard) {
        const title = typeof raw.title === 'string' ? raw.title.trim() : '';
        return title ? [{ type: 'createBoard', title }] : [];
      }
      return [];
    },
  );
  // A model that writes two objects often repeats an action in the second.
  const unique = _.uniqBy(actions, (action) =>
    action.type === 'addPanel'
      ? JSON.stringify({ ..._.omit(action.panel, 'id') })
      : JSON.stringify(action),
  );
  const reply =
    objects
      .map((object) => object.reply)
      .find((value): value is string => typeof value === 'string')
      ?.trim() ??
    // Unreadable JSON is not shown as the reply.
    (values.length || text.includes('{') ? '' : text.trim());
  return { reply, actions: unique };
};
