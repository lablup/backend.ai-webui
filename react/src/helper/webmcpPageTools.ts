/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  isColumnVisible,
  useWebMCPTool,
  type BAITableColumnOverrideRecord,
  type WebMCPInputSchema,
  type WebMCPTool,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useLocation } from 'react-router-dom';

/** One rendered row: `id` identifies it, the other keys are visible columns. */
export type PageToolRow = { id: string } & Record<string, unknown>;

/** A table column as these tools see it: the row fields it renders. */
export interface PageToolColumn {
  key: string;
  fields: ReadonlyArray<string>;
  defaultHidden?: boolean;
  required?: boolean;
  /** The table does not render this column here (role, version, config). */
  absent?: boolean;
}

/** Row fields whose column the user (or the column default) has hidden. */
export const hiddenRowFields = (
  columns: ReadonlyArray<PageToolColumn>,
  overrides: BAITableColumnOverrideRecord | null | undefined,
): Array<string> =>
  _.flatMap(columns, (column) =>
    !column.absent &&
    isColumnVisible(column, column.key, overrides ?? undefined)
      ? []
      : [...column.fields],
  );

/** `row` without the hidden fields. `id` always survives. */
export const pruneRow = (
  row: PageToolRow,
  hiddenFields: ReadonlyArray<string>,
): PageToolRow => _.omit(row, _.without(hiddenFields, 'id')) as PageToolRow;

export interface VisibleRowsResult {
  rows: Array<PageToolRow>;
  count: number;
  page: number;
  pageSize: number;
  total: number | null;
  /** The page is loading a new view, so `rows` still belong to the previous one. */
  pending?: true;
}

export const visibleRowsResult = ({
  rows,
  columns,
  columnOverrides,
  page,
  pageSize,
  total,
  pending,
}: {
  rows: ReadonlyArray<PageToolRow>;
  columns?: ReadonlyArray<PageToolColumn>;
  columnOverrides?: BAITableColumnOverrideRecord | null;
  page: number;
  pageSize: number;
  total?: number | null;
  pending?: boolean;
}): VisibleRowsResult => {
  const hidden = columns ? hiddenRowFields(columns, columnOverrides) : [];
  const visible = _.map(rows, (row) => pruneRow(row, hidden));
  return {
    rows: visible,
    count: visible.length,
    page,
    pageSize,
    total: total ?? null,
    ...(pending ? { pending: true as const } : {}),
  };
};

export type ViewParamValue = string | number | boolean | null | undefined;

export interface ViewStateResult {
  /** In-app path that reopens this view; pass it to `bai_navigate {path}`. */
  path: string;
  /** The page's own URL params, exactly as they appear in `path`. */
  searchParams: Record<string, string>;
  /** The rows on screen do not reflect this view yet. */
  pending?: true;
}

/** Serializes a page's URL state. Nil and empty values are left out. */
export const viewStateResult = (
  pathname: string,
  params: Readonly<Record<string, ViewParamValue>>,
  pending = false,
): ViewStateResult => {
  const searchParams: Record<string, string> = {};
  _.forEach(params, (value, key) => {
    if (_.isNil(value) || value === '') return;
    searchParams[key] = String(value);
  });
  const search = new URLSearchParams(searchParams).toString();
  return {
    path: search ? `${pathname}?${search}` : pathname,
    searchParams,
    ...(pending ? { pending: true as const } : {}),
  };
};

/** `search` with `key` set to `value`, appended to `pathname`. */
export const pathWithSearchParam = (
  pathname: string,
  search: string,
  key: string,
  value: string,
): string => {
  const params = new URLSearchParams(search);
  params.set(key, value);
  return `${pathname}?${params.toString()}`;
};

/**
 * The opened item as `bai_get_current_<noun>` reports it. An item that is not
 * on the rendered page still answers with its id and path.
 */
export const openedItem = (
  rows: ReadonlyArray<PageToolRow>,
  openedId: string | null | undefined,
  path: string,
): (PageToolRow & { path: string }) | null => {
  if (!openedId) return null;
  const row = _.find(rows, { id: openedId });
  return { ...(row ?? { id: openedId }), path };
};

export const listVisibleToolName = (noun: string) => `bai_list_visible_${noun}`;
export const filterToolName = (noun: string) => `bai_get_${noun}_filter`;
export const currentToolName = (noun: string) => `bai_get_current_${noun}`;

const markPending = <T extends object>(result: T, pending: boolean): T =>
  pending ? { ...result, pending: true as const } : result;

// The router keeps the search it was given; `window.location` percent-encodes it.
const sameSearch = (a: string, b: string): boolean =>
  new URLSearchParams(a).toString() === new URLSearchParams(b).toString();

const NO_INPUT: WebMCPInputSchema = {
  type: 'object',
  properties: {},
  additionalProperties: false,
};

// Rows, filters and paths carry names and filter text the user typed.
const READ_ANNOTATIONS = { readOnlyHint: true, untrustedContentHint: true };

export interface PageReadToolsConfig {
  /** snake_case singular noun, e.g. `session`. */
  noun: string;
  /** Plural for the descriptions, e.g. `sessions`. */
  plural: string;
  /** Extra description text for the row fields, e.g. `Row fields: …`. */
  rowFields: string;
  readRows: () => VisibleRowsResult;
  readViewState: () => ViewStateResult;
  readCurrent: () => (PageToolRow & { path: string }) | null;
  /** What "current" means on this page, e.g. `the session open in the detail drawer`. */
  currentMeaning: string;
}

export const createListVisibleTool = ({
  noun,
  plural,
  rowFields,
  readRows,
}: Pick<
  PageReadToolsConfig,
  'noun' | 'plural' | 'rowFields' | 'readRows'
>): WebMCPTool => ({
  name: listVisibleToolName(noun),
  description: `The ${plural} rendered on the current page of this Backend.AI WebUI list, in the current sort order, limited to the columns the user shows. Returns {rows, count, page, pageSize, total}; total counts every match across pages. With pending: true the page is still loading the requested view and rows belong to the previous one, so call again. ${rowFields} Call ${filterToolName(noun)} for the filter that produced them.`,
  inputSchema: NO_INPUT,
  annotations: READ_ANNOTATIONS,
  execute: () => readRows(),
});

export const createViewStateTool = ({
  noun,
  plural,
  readViewState,
}: Pick<
  PageReadToolsConfig,
  'noun' | 'plural' | 'readViewState'
>): WebMCPTool => ({
  name: filterToolName(noun),
  description: `The filter, sort, tab and pagination of this ${plural} list as the page's URL params. Returns {path, searchParams}; bai_navigate {"path": path} reopens this exact view. With pending: true the rows on screen do not reflect this view yet.`,
  inputSchema: NO_INPUT,
  annotations: READ_ANNOTATIONS,
  execute: () => readViewState(),
});

export const createCurrentItemTool = ({
  noun,
  currentMeaning,
  readCurrent,
  readPending = () => false,
}: Pick<PageReadToolsConfig, 'noun' | 'currentMeaning' | 'readCurrent'> & {
  readPending?: () => boolean;
}): WebMCPTool => ({
  name: currentToolName(noun),
  description: `The ${noun} currently open in this Backend.AI WebUI tab: ${currentMeaning}. Returns {current: {id, …row fields, path}} where path is the in-app path that reopens it, or {current: null} when nothing is open. With pending: true the page is still loading the requested view and this answer may be out of date, so call again.`,
  inputSchema: NO_INPUT,
  annotations: READ_ANNOTATIONS,
  execute: () => markPending({ current: readCurrent() }, readPending()),
});

/**
 * Registers `bai_list_visible_<noun>`, `bai_get_<noun>_filter` and
 * `bai_get_current_<noun>` while the caller is mounted.
 */
export const usePageReadTools = (config: PageReadToolsConfig): void => {
  'use memo';
  const { search } = useLocation();

  // A `bai_navigate` reaches the page in a transition, where `useDeferredValue`
  // does not defer: the old tree stays committed, so only the URL shows the lag.
  const isBehindUrl = () => !sameSearch(search, window.location.search);

  useWebMCPTool(
    createListVisibleTool({
      ...config,
      readRows: () => markPending(config.readRows(), isBehindUrl()),
    }),
  );
  useWebMCPTool(
    createViewStateTool({
      ...config,
      readViewState: () => markPending(config.readViewState(), isBehindUrl()),
    }),
  );
  useWebMCPTool(
    createCurrentItemTool({
      ...config,
      readPending: () => isBehindUrl() || config.readRows().pending === true,
    }),
  );
};
