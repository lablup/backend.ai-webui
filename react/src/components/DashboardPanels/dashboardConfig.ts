/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  migrateLegacyBoard,
  resetBoard,
  sanitizeBoard,
  seedBoard,
} from './boardModel';
import type {
  DashboardBoard,
  DashboardBoardVars,
  DashboardConfig,
  DashboardModel,
  DashboardPageConfig,
  PanelDefinition,
  PanelPage,
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
  project: 'all',
  rg: 'all',
  range: 'now-24h',
  refresh: '1m',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isStringArray = (value: unknown): value is Array<string> =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const sanitizeScopeVar = (value: unknown): Array<string> | 'all' =>
  isStringArray(value) ? _.uniq(value) : 'all';

const nonEmptyString = (value: unknown, fallback: string) =>
  typeof value === 'string' && value ? value : fallback;

export const sanitizeBoardVars = (value: unknown): DashboardBoardVars => {
  const vars = isRecord(value) ? value : {};
  return {
    project: sanitizeScopeVar(vars.project),
    rg: sanitizeScopeVar(vars.rg),
    range: nonEmptyString(vars.range, DEFAULT_BOARD_VARS.range),
    refresh: nonEmptyString(vars.refresh, DEFAULT_BOARD_VARS.refresh),
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
    ...(value.migrated === true ? { migrated: true as const } : {}),
  };
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

/** The localStorage values a page's board can be migrated from. */
export interface LocalBoardSources {
  /** `dashboard_board.<page>`, written by the localStorage store of #10580. */
  board?: unknown;
  /** `dashboard_board_items`, the project page's pre-catalog layout. */
  layout?: unknown;
  /** `admin_dashboard_board_items`. */
  adminLayout?: unknown;
  /** `custom_dashboard_panels`, the project page's custom panels. */
  customPanels?: unknown;
}

/** The board this browser kept for `page`, newest key first. Null when it kept none. */
export const migrateLocalStorage = (
  { board, layout, adminLayout, customPanels }: LocalBoardSources,
  definitions: ReadonlyArray<PanelDefinition>,
  page: PanelPage,
): DashboardBoard | null => {
  const stored = sanitizeBoard(board, definitions, page);
  if (stored) return stored;
  const legacy =
    page === 'project'
      ? migrateLegacyBoard({ layout, customPanels })
      : page === 'admin'
        ? migrateLegacyBoard({ layout: adminLayout, customPanels: [] })
        : null;
  return sanitizeBoard(legacy, definitions, page);
};

export interface ResolvedBoards {
  config: DashboardPageConfig;
  template: DashboardModel;
  /** The page config to upsert once, built from localStorage; null when there is nothing to migrate. */
  migration: DashboardPageConfig | null;
}

/**
 * One page's boards: the stored config when there is one, else this browser's
 * localStorage board on the template's frame (to be upserted), else the
 * template alone, which is written only when the user first edits it.
 */
export const resolveBoards = ({
  stored,
  local,
  templates,
  definitions,
  page,
}: {
  stored: unknown;
  local: LocalBoardSources;
  templates: DashboardTemplateSources;
  definitions: ReadonlyArray<PanelDefinition>;
  page: PanelPage;
}): ResolvedBoards => {
  const template = resolveTemplate(templates, definitions, page);
  const storedConfig = sanitizeDashboardPageConfig(stored, definitions, page);
  if (storedConfig) return { config: storedConfig, template, migration: null };
  const localBoard = migrateLocalStorage(local, definitions, page);
  if (localBoard) {
    const config: DashboardPageConfig = {
      boards: [
        {
          ...template,
          panels: localBoard.panels,
          knownKeys: localBoard.knownKeys,
        },
      ],
      active: template.id,
      migrated: true,
    };
    return { config, template, migration: config };
  }
  return {
    config: { boards: [template], active: template.id },
    template,
    migration: null,
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
