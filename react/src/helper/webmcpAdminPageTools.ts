/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Builders for the read-only, page-scoped WebMCP tools the admin list pages
 * register (FR-3767): `bai_list_visible_<noun>`, `bai_get_current_<noun>` and
 * `bai_get_<noun>_filter`.
 *
 * Every tool here answers from what the page already rendered — the Relay
 * fragment it drew the table from, its pagination state and its nuqs URL
 * params. None of them fetches, and all three carry
 * `annotations.readOnlyHint`.
 */
import type { WebMCPTool } from '../hooks/useWebMCPTool';
import type {
  CallToolResult,
  InputSchema,
  JsonObject,
  JsonValue,
} from '@mcp-b/webmcp-types';
import * as _ from 'lodash-es';

/** One rendered table row, flattened to the columns the page shows. */
export type WebMCPRow = JsonObject;

/** These tools report what the page renders, so none of them takes arguments. */
export const NO_ARGS_INPUT_SCHEMA: InputSchema = {
  type: 'object',
  properties: {},
  additionalProperties: false,
};

const jsonResult = (payload: JsonObject): CallToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  structuredContent: payload,
});

/** Drops `undefined` entries so a payload only carries columns that exist. */
export const webmcpRow = (
  row: Record<string, JsonValue | undefined>,
): WebMCPRow => _.omitBy(row, _.isUndefined) as WebMCPRow;

/**
 * A GraphQL JSON-string column (`occupied_slots`, …) as an object, or `null`
 * when it is absent or unparseable.
 */
export const parseJsonColumn = (
  value: string | null | undefined,
): JsonObject | null => {
  if (!value) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(value);
    return _.isPlainObject(parsed) ? (parsed as JsonObject) : null;
  } catch {
    return null;
  }
};

/** What `bai_list_visible_<noun>` answers with. */
export interface WebMCPVisibleRows {
  /** The rows on the page right now, in the order the table renders them. */
  rows: Array<WebMCPRow>;
  /** Total matching the current filter, i.e. the pagination total. */
  count: number;
  /** 1-based page number. */
  page: number;
  pageSize: number;
  /** The table's current sort (`-created_at`), or `null` for the default. */
  sort?: string | null;
}

/** What `bai_get_<noun>_filter` answers with — the page's URL params. */
export interface WebMCPPageFilter {
  filter?: string | null;
  status?: string | null;
  tab?: string | null;
  /** 1-based page number, spelled as the table's `current`. */
  current?: number;
  pageSize?: number;
}

/** What `bai_get_current_<noun>` answers with. */
export interface WebMCPCurrentItem {
  /** The opened / selected row, or `null` when nothing is open. */
  current: WebMCPRow | null;
  /** Deep link to it, or `null` for pages that have no per-row URL yet. */
  webui_path: string | null;
}

export const createListVisibleTool = (
  noun: string,
  description: string,
  visible: WebMCPVisibleRows,
): WebMCPTool => ({
  name: `bai_list_visible_${noun}`,
  description,
  inputSchema: NO_ARGS_INPUT_SCHEMA,
  annotations: { readOnlyHint: true },
  execute: (): CallToolResult =>
    jsonResult({
      rows: visible.rows,
      count: visible.count,
      page: visible.page,
      pageSize: visible.pageSize,
      sort: visible.sort ?? null,
    }),
});

export const createGetCurrentTool = (
  noun: string,
  description: string,
  item: WebMCPCurrentItem,
): WebMCPTool => ({
  name: `bai_get_current_${noun}`,
  description,
  inputSchema: NO_ARGS_INPUT_SCHEMA,
  annotations: { readOnlyHint: true },
  execute: (): CallToolResult =>
    jsonResult({ current: item.current, webui_path: item.webui_path }),
});

export const createGetFilterTool = (
  noun: string,
  description: string,
  filter: WebMCPPageFilter,
): WebMCPTool => ({
  name: `bai_get_${noun}_filter`,
  description,
  inputSchema: NO_ARGS_INPUT_SCHEMA,
  annotations: { readOnlyHint: true },
  execute: (): CallToolResult =>
    jsonResult(_.omitBy(filter, _.isUndefined) as JsonObject),
});

/**
 * Finds the row a page's "currently open" id points at. `column` is the row
 * key that id is expressed in — the Relay global `id` for most pages, the
 * per-page readable id where the URL param carries that instead.
 */
export const findRowById = (
  rows: Array<WebMCPRow>,
  id: string | null | undefined,
  column: string = 'id',
): WebMCPRow | null =>
  id ? (_.find(rows, (row) => row[column] === id) ?? null) : null;
