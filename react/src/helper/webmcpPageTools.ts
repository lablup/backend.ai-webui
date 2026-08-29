/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * The read-only, page-scoped WebMCP tool triple every list page registers
 * (FR-3766 / FR-3767): "what rows do I see", "what is selected", "how do I
 * reproduce this view".
 *
 * A page owns the data, so it builds the config from state it already has —
 * this module only turns that config into three `bai_*` tools with stable
 * names, JSON-Schema output shapes and `readOnlyHint`. Nothing here fetches.
 *
 * Deliberately generic: the admin pages (FR-3767) register the same triple
 * with their own nouns, rows and filter params.
 */
import { useWebMCPTool, type WebMCPTool } from '../hooks/useWebMCPTool';
import type { ListResource } from './resourcePath';
import type {
  CallToolResult,
  JsonObject,
  JsonSchemaForInference,
  JsonValue,
} from '@mcp-b/webmcp-types';
import * as _ from 'lodash-es';
import type { DependencyList } from 'react';

/** One rendered row. `id` identifies it; the rest are the visible columns. */
export type PageToolRow = JsonObject & { id: string };

/**
 * The list page's URL state, named as the params actually appear in the URL
 * (`LIST_PAGES` in `resourcePath.ts`). Pages may add their own params —
 * `type` on sessions, `mode` on vfolders, `sort` on the model store — which
 * ride along at the top level and are declared via `extraFilterProperties`.
 */
export interface PageFilterState {
  filter?: string | null;
  statusCategory?: string | null;
  order?: string | null;
  current?: number | null;
  pageSize?: number | null;
  [param: string]: string | number | null | undefined;
}

export interface PageReadToolsConfig {
  /** snake_case noun the tool names are built from, e.g. `session`. */
  noun: string;
  /** Plural used in the tool descriptions, e.g. `sessions`. */
  plural: string;
  /** `bai_open_resource`'s `resource` value for this page's list. */
  resource: ListResource;
  /** JSON-Schema properties of one row (`id` is always present). */
  rowProperties: Readonly<Record<string, JsonSchemaForInference>>;
  /** The rows rendered on the CURRENT page, in the current sort order. */
  rows: ReadonlyArray<PageToolRow>;
  /** Column keys the user hid; pruned from every row (`id` never is). */
  hiddenColumns?: ReadonlyArray<string>;
  pagination: { current: number; pageSize: number; total?: number | null };
  filter: PageFilterState;
  /** Schema for the page-specific params carried in `filter`. */
  extraFilterProperties?: Readonly<Record<string, JsonSchemaForInference>>;
  /** The opened/selected item, already carrying `webui_path`, or `null`. */
  current: PageToolRow | null;
  /** Extra JSON-Schema properties `current` has beyond `rowProperties`. */
  currentProperties?: Readonly<Record<string, JsonSchemaForInference>>;
}

/**
 * `helper/webmcp`'s `webmcpResult` widened to any JSON value: these tools
 * answer with arrays of objects, which its flat `WebMCPPayload` cannot hold.
 */
export const webmcpJsonResult = (payload: JsonValue): CallToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  structuredContent: payload,
});

/** Drops `undefined`/`null` params so the payload mirrors the URL exactly. */
export const compactFilterState = (filter: PageFilterState): JsonObject =>
  _.omitBy(filter, _.isNil) as JsonObject;

/** A `BAITable` `tableSettings.columnOverrides` record, as pages persist it. */
export type TableColumnOverrides =
  Readonly<Record<string, { hidden?: boolean } | undefined>> | null | undefined;

/**
 * The row a page-scoped "current item" URL param points at.
 *
 * The opened item is normally one of the rendered rows, so the answer carries
 * every column the row has. When it is not (the drawer outlived its page of
 * the list), the id and the deep link are still answerable and more useful
 * than `null` — only "nothing is open" answers `null`.
 */
export const resolveOpenedRow = (
  rows: ReadonlyArray<PageToolRow>,
  openedId: string | null | undefined,
  toWebuiPath: (id: string) => string,
  matches: (row: PageToolRow, openedId: string) => boolean = (row, id) =>
    row.id === id,
): PageToolRow | null => {
  if (!openedId) {
    return null;
  }
  const row = _.find(rows, (candidate) => matches(candidate, openedId));
  const id = row?.id ?? openedId;
  return { ...(row ?? {}), id, webui_path: toWebuiPath(id) };
};

/**
 * The column keys a `BAITable` `columnOverrides` record currently hides. Pages
 * translate those keys into row-field names before handing them over, because
 * a column key and the GraphQL field it renders do not always match
 * (`resourceGroup` renders `scaling_group`).
 */
export const hiddenColumnKeys = (
  overrides:
    | Readonly<Record<string, { hidden?: boolean } | undefined>>
    | null
    | undefined,
): Array<string> =>
  _.keys(_.pickBy(overrides ?? {}, (o) => o?.hidden === true));

/** A row with the user-hidden columns removed. `id` always survives. */
export const visibleRow = (
  row: PageToolRow,
  hiddenColumns: ReadonlyArray<string> = [],
): JsonObject => _.omit(row, _.without(hiddenColumns, 'id')) as JsonObject;

export const listVisibleToolName = (noun: string): string =>
  `bai_list_visible_${noun}`;
export const filterToolName = (noun: string): string =>
  `bai_get_${noun}_filter`;
export const currentToolName = (noun: string): string =>
  `bai_get_current_${noun}`;

const NO_ARGS = { type: 'object', properties: {} } as const;

export const createListVisibleTool = (
  config: PageReadToolsConfig,
): WebMCPTool => {
  const rows = _.map(config.rows, (row) =>
    visibleRow(row, config.hiddenColumns),
  );
  return {
    name: listVisibleToolName(config.noun),
    description: `The ${config.plural} currently rendered in this Backend.AI WebUI tab: the rows of the page being shown, in the current sort order, with the columns the user has visible. Not the whole result set — call ${filterToolName(config.noun)} for the query that produced it.`,
    inputSchema: NO_ARGS,
    outputSchema: {
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: config.rowProperties,
            required: ['id'],
          },
        },
        count: { type: 'integer', description: 'Rows on this page.' },
        page: { type: 'integer', description: '1-based page number.' },
        pageSize: { type: 'integer' },
        total: {
          type: 'integer',
          description: 'Rows matching the filter across all pages.',
        },
      },
      required: ['rows', 'count', 'page', 'pageSize'],
    },
    annotations: { readOnlyHint: true },
    execute: (): CallToolResult =>
      webmcpJsonResult({
        rows,
        count: rows.length,
        page: config.pagination.current,
        pageSize: config.pagination.pageSize,
        ...(_.isNil(config.pagination.total)
          ? {}
          : { total: config.pagination.total }),
      }),
  };
};

export const createPageFilterTool = (
  config: PageReadToolsConfig,
): WebMCPTool => {
  const payload = {
    resource: config.resource,
    ...compactFilterState(config.filter),
  };
  return {
    name: filterToolName(config.noun),
    description: `The active filter, sort, pagination and status category of this ${config.plural} list, as the page's own URL params. Feed them back to bai_open_resource {"type":"list","resource":"${config.resource}", …} to reproduce this view.`,
    inputSchema: NO_ARGS,
    outputSchema: {
      type: 'object',
      properties: {
        resource: { type: 'string', const: config.resource },
        filter: {
          type: 'string',
          description: 'Filter param, verbatim (free text or JSON per page).',
        },
        statusCategory: { type: 'string' },
        order: { type: 'string' },
        current: { type: 'integer', description: '1-based page number.' },
        pageSize: { type: 'integer' },
        ...(config.extraFilterProperties ?? {}),
      },
      required: ['resource'],
    },
    annotations: { readOnlyHint: true },
    execute: (): CallToolResult => webmcpJsonResult(payload),
  };
};

export const createCurrentItemTool = (
  config: PageReadToolsConfig,
): WebMCPTool => ({
  name: currentToolName(config.noun),
  description: `The ${config.noun} currently opened or selected in this Backend.AI WebUI tab (detail drawer, detail page, explorer or modal). Answers {"current": null} when nothing is open; otherwise the item plus webui_path, the deep link back to it.`,
  inputSchema: NO_ARGS,
  // The single-key envelope is not decoration: MCP's CallToolResult schema
  // requires `structuredContent` to be an object, so a bare `null` is rejected
  // by the relay ("Tool returned an invalid result").
  outputSchema: {
    type: 'object',
    properties: {
      current: {
        type: ['object', 'null'],
        description: `The open ${config.noun}, or null when nothing is open.`,
        properties: {
          ...config.rowProperties,
          ...(config.currentProperties ?? {}),
          webui_path: {
            type: 'string',
            description: 'WebUI route that reopens this item.',
          },
        },
      },
    },
    required: ['current'],
  },
  annotations: { readOnlyHint: true },
  execute: (): CallToolResult => webmcpJsonResult({ current: config.current }),
});

/**
 * Registers the read-only triple for as long as the page is mounted. The tools
 * disappear on navigation (the hook aborts each registration), which is what
 * makes the relay's tool list follow the route.
 */
export const usePageReadTools = (
  config: PageReadToolsConfig,
  deps: DependencyList,
): void => {
  useWebMCPTool(createListVisibleTool(config), deps);
  useWebMCPTool(createPageFilterTool(config), deps);
  useWebMCPTool(createCurrentItemTool(config), deps);
};
