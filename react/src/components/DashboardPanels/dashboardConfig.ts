/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { resetBoard, sanitizeBoard, seedBoard } from './boardModel';
import { ownedSettingKeys, panelDefinitionOf } from './panelSettings';
import { isRefreshOption } from './refreshScheduler';
import type {
  DashboardBoardVars,
  DashboardConfig,
  DashboardModel,
  DashboardPageConfig,
  PanelDefinition,
  PanelPage,
  PersistedPanelV2,
} from './types';
import * as _ from 'lodash-es';

export const PANEL_PAGES: ReadonlyArray<PanelPage> = [
  'project',
  'projectAdmin',
  'admin',
];

/** The id of a page's first board, whether it came from a template or the code default. */
export const DEFAULT_BOARD_ID = 'default';

export const DEFAULT_BOARD_VARS: DashboardBoardVars = {
  refresh: '1m',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const nonEmptyString = (value: unknown, fallback: string) =>
  typeof value === 'string' && value ? value : fallback;

/** Keeps only the values the dashboard still reads; older `project`, `rg` and `range` drop. */
export const sanitizeBoardVars = (value: unknown): DashboardBoardVars => {
  const vars = isRecord(value) ? value : {};
  return {
    refresh: isRefreshOption(vars.refresh)
      ? vars.refresh
      : DEFAULT_BOARD_VARS.refresh,
  };
};

/** Validates one stored board; panels go through `sanitizeBoard`. Null when unusable. */
export const sanitizeDashboardModel = (
  value: unknown,
  definitions: ReadonlyArray<PanelDefinition>,
  page: PanelPage,
  fallbackId?: string,
): DashboardModel | null => {
  if (!isRecord(value)) return null;
  const board = sanitizeBoard(value, definitions, page);
  const id = nonEmptyString(value.id, fallbackId ?? '');
  if (!board || !id) return null;
  return {
    id,
    title: typeof value.title === 'string' ? value.title : '',
    vars: sanitizeBoardVars(value.vars),
    panels: board.panels,
    knownKeys: board.knownKeys,
  };
};

/** Validates one page's `{ boards, active }`. Null when no board survives. */
export const sanitizeDashboardPageConfig = (
  value: unknown,
  definitions: ReadonlyArray<PanelDefinition>,
  page: PanelPage,
): DashboardPageConfig | null => {
  if (!isRecord(value) || !Array.isArray(value.boards)) return null;
  const seenIds = new Set<string>();
  const boards = value.boards.flatMap((item) => {
    const board = sanitizeDashboardModel(item, definitions, page);
    if (!board || seenIds.has(board.id)) return [];
    seenIds.add(board.id);
    return [board];
  });
  if (boards.length === 0) return null;
  return {
    boards,
    active:
      typeof value.active === 'string' && seenIds.has(value.active)
        ? value.active
        : boards[0].id,
  };
};

/**
 * Adds back what this client cannot read in the stored page: cards of a newer
 * catalog, and the settings a card's definition here does not declare. Without
 * it, a save from an older WebUI on the same manager erases what a newer one added.
 */
export const keepUnreadablePanels = (
  written: DashboardPageConfig,
  stored: unknown,
  definitions: ReadonlyArray<PanelDefinition>,
  page: PanelPage,
): DashboardPageConfig => {
  if (!isRecord(stored) || !Array.isArray(stored.boards)) return written;
  const byKey = new Map(
    definitions.map((definition) => [definition.key, definition]),
  );
  const storedBoards = new Map(
    stored.boards.filter(isRecord).map((board) => [board.id, board]),
  );
  return {
    ...written,
    boards: written.boards.map((board) => {
      const storedValue = storedBoards.get(board.id)?.panels;
      const storedPanels = Array.isArray(storedValue)
        ? storedValue.filter(isRecord)
        : [];
      if (storedPanels.length === 0) return board;
      const storedById = new Map(
        storedPanels.map((panel) => [panel.id, panel]),
      );
      const panels = board.panels.map((panel) => {
        const storedSettings = storedById.get(panel.id)?.settings;
        const definition = byKey.get(panel.key);
        if (!isRecord(storedSettings) || !definition) return panel;
        const kept = _.omit(
          storedSettings,
          ownedSettingKeys(panelDefinitionOf(definition, panel)),
        );
        return _.isEmpty(kept)
          ? panel
          : { ...panel, settings: { ...kept, ...panel.settings } };
      });
      const writtenIds = new Set(board.panels.map((panel) => panel.id));
      // A card this client knows for this page and left out was removed here.
      const unreadable = storedPanels.filter(
        (panel) =>
          typeof panel.id === 'string' &&
          !writtenIds.has(panel.id) &&
          !(
            typeof panel.key === 'string' &&
            byKey.get(panel.key)?.page.includes(page)
          ),
      ) as unknown as Array<PersistedPanelV2>;
      return { ...board, panels: [...panels, ...unreadable] };
    }),
  };
};

/**
 * This tab's panel edits (`base` to `edited`) applied on the panels the server
 * holds now: a panel added, removed or changed elsewhere since `base` stays so
 * unless this tab changed that same panel.
 */
export const mergePanelEdits = (
  base: ReadonlyArray<PersistedPanelV2>,
  edited: ReadonlyArray<PersistedPanelV2>,
  current: ReadonlyArray<PersistedPanelV2>,
): Array<PersistedPanelV2> => {
  const baseById = new Map(base.map((panel) => [panel.id, panel]));
  const currentById = new Map(current.map((panel) => [panel.id, panel]));
  const editedIds = new Set(edited.map((panel) => panel.id));
  const kept = edited.flatMap((panel) => {
    const before = baseById.get(panel.id);
    if (!before || !_.isEqual(before, panel)) return [panel];
    const now = currentById.get(panel.id);
    return now ? [now] : [];
  });
  const addedElsewhere = current.filter(
    (panel) => !baseById.has(panel.id) && !editedIds.has(panel.id),
  );
  return [...kept, ...addedElsewhere];
};

/** Validates `userConfig.dashboard`; a page that does not survive is left out. */
export const sanitizeDashboardConfig = (
  value: unknown,
  definitions: ReadonlyArray<PanelDefinition>,
): DashboardConfig => {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    PANEL_PAGES.flatMap((page) => {
      const config = sanitizeDashboardPageConfig(
        value[page],
        definitions,
        page,
      );
      return config ? [[page, config]] : [];
    }),
  );
};

/** The code default, used when neither template document has the page. */
export const defaultBoardModel = (
  definitions: ReadonlyArray<PanelDefinition>,
  page: PanelPage,
): DashboardModel => ({
  id: DEFAULT_BOARD_ID,
  title: '',
  vars: { ...DEFAULT_BOARD_VARS },
  ...seedBoard(definitions, page),
});

export interface DashboardTemplateSources {
  /** `domainConfig.dashboardTemplates`. */
  domainTemplates?: unknown;
  /** `publicConfigByDomain[domain].dashboardTemplates`. */
  publicTemplates?: unknown;
}

/**
 * The page's role template: the domain's, else the installation's, else the
 * code default. A template that omits `knownKeys` is taken to know every card
 * the catalog has today, so the cards it leaves out stay out.
 */
export const resolveTemplate = (
  { domainTemplates, publicTemplates }: DashboardTemplateSources,
  definitions: ReadonlyArray<PanelDefinition>,
  page: PanelPage,
): DashboardModel => {
  for (const templates of [domainTemplates, publicTemplates]) {
    const candidate = isRecord(templates) ? templates[page] : undefined;
    const model = sanitizeDashboardModel(
      candidate,
      definitions,
      page,
      DEFAULT_BOARD_ID,
    );
    if (!model) continue;
    if (isRecord(candidate) && Array.isArray(candidate.knownKeys)) return model;
    return {
      ...model,
      knownKeys: _.uniq([
        ...seedBoard(definitions, page).knownKeys,
        ...model.panels.map((panel) => panel.key),
      ]),
    };
  }
  return defaultBoardModel(definitions, page);
};

export interface ResolvedBoards {
  config: DashboardPageConfig;
  template: DashboardModel;
}

/**
 * One page's boards: the stored config when there is one, else the template
 * alone, which is written only when the user first edits it.
 */
export const resolveBoards = ({
  stored,
  templates,
  definitions,
  page,
}: {
  stored: unknown;
  templates: DashboardTemplateSources;
  definitions: ReadonlyArray<PanelDefinition>;
  page: PanelPage;
}): ResolvedBoards => {
  const template = resolveTemplate(templates, definitions, page);
  const storedConfig = sanitizeDashboardPageConfig(stored, definitions, page);
  return {
    config: storedConfig ?? { boards: [template], active: template.id },
    template,
  };
};

export const activeBoardOf = (config: DashboardPageConfig): DashboardModel =>
  config.boards.find((board) => board.id === config.active) ?? config.boards[0];

export const updateBoard = (
  config: DashboardPageConfig,
  id: string,
  update: (board: DashboardModel) => DashboardModel,
): DashboardPageConfig => ({
  ...config,
  boards: config.boards.map((board) =>
    board.id === id ? update(board) : board,
  ),
});

export const selectBoard = (
  config: DashboardPageConfig,
  id: string,
): DashboardPageConfig =>
  config.boards.some((board) => board.id === id)
    ? { ...config, active: id }
    : config;

/**
 * A new board with no panels. Every current catalog key counts as seen, so
 * the default cards do not fill it on the next render.
 */
export const createEmptyBoard = (
  { id, title }: { id: string; title: string },
  definitions: ReadonlyArray<PanelDefinition>,
  page: PanelPage,
): DashboardModel => ({
  id,
  title,
  vars: { ...DEFAULT_BOARD_VARS },
  panels: [],
  knownKeys: seedBoard(definitions, page).knownKeys,
});

/** Appends a board and makes it active. */
export const addBoard = (
  config: DashboardPageConfig,
  board: DashboardModel,
): DashboardPageConfig =>
  config.boards.some((item) => item.id === board.id)
    ? config
    : { ...config, boards: [...config.boards, board], active: board.id };

/** Removes a board; the last one stays. An active board hands over to its neighbour. */
export const removeBoard = (
  config: DashboardPageConfig,
  id: string,
): DashboardPageConfig => {
  const index = config.boards.findIndex((board) => board.id === id);
  if (index < 0 || config.boards.length <= 1) return config;
  const boards = config.boards.filter((board) => board.id !== id);
  return {
    ...config,
    boards,
    active:
      config.active === id
        ? boards[Math.min(index, boards.length - 1)].id
        : config.active,
  };
};

export const renameBoard = (
  config: DashboardPageConfig,
  id: string,
  title: string,
): DashboardPageConfig =>
  updateBoard(config, id, (board) => ({ ...board, title: title.trim() }));

/** Puts the active board back on the template's panels; its title and filters stay. */
export const resetActiveBoard = (
  config: DashboardPageConfig,
  template: DashboardModel,
  definitions: ReadonlyArray<PanelDefinition>,
  page: PanelPage,
): DashboardPageConfig =>
  updateBoard(config, activeBoardOf(config).id, (board) => ({
    ...board,
    ...resetBoard(board, definitions, page, template),
  }));
