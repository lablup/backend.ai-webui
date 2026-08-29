/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * `/session` (FR-3766): `bai_list_visible_session`, `bai_get_session_filter`
 * and `bai_get_current_session`, registered by `ComputeSessionListPage` from
 * state it already holds — no extra query.
 */
import { resourcePath } from '../../helper/resourcePath';
import {
  hiddenColumnKeys,
  resolveOpenedRow,
  usePageReadTools,
  type PageToolRow,
  type TableColumnOverrides,
} from '../../helper/webmcpPageTools';
import type { JsonSchemaForInference } from '@mcp-b/webmcp-types';
import * as _ from 'lodash-es';

/** The node fields `ComputeSessionListPageQuery` selects for these tools. */
export interface SessionRowSource {
  readonly id?: string | null;
  readonly row_id?: string | null;
  readonly name?: string | null;
  readonly status?: string | null;
  readonly type?: string | null;
  readonly created_at?: string | null;
  readonly scaling_group?: string | null;
}

export const SESSION_ROW_PROPERTIES: Readonly<
  Record<string, JsonSchemaForInference>
> = {
  id: { type: 'string', description: 'Session UUID (row_id).' },
  name: { type: 'string' },
  status: { type: 'string' },
  type: {
    type: 'string',
    description: 'interactive | batch | inference | system.',
  },
  created_at: { type: 'string' },
  scaling_group: { type: 'string', description: 'Resource group.' },
};

/**
 * `SessionNodes` column key -> the row field it renders. Only the fields these
 * tools expose need an entry; anything else the user hides is not in the
 * payload to begin with.
 */
const SESSION_COLUMN_FIELDS: Readonly<Record<string, string>> = {
  name: 'name',
  status: 'status',
  type: 'type',
  created_at: 'created_at',
  resourceGroup: 'scaling_group',
};

export const toSessionRow = (node: SessionRowSource): PageToolRow => ({
  id: node.row_id ?? node.id ?? '',
  name: node.name ?? null,
  status: node.status ?? null,
  type: node.type ?? null,
  created_at: node.created_at ?? null,
  scaling_group: node.scaling_group ?? null,
});

export interface SessionListWebMCPToolsInput {
  sessions: ReadonlyArray<SessionRowSource>;
  columnOverrides?: TableColumnOverrides;
  pagination: { current: number; pageSize: number; total?: number | null };
  queryParams: {
    filter?: string | null;
    statusCategory?: string | null;
    order?: string | null;
    type?: string | null;
  };
  /** `sessionDetail` search param — the session whose drawer is open. */
  openedSessionId?: string | null;
}

export const useSessionListWebMCPTools = ({
  sessions,
  columnOverrides,
  pagination,
  queryParams,
  openedSessionId,
}: SessionListWebMCPToolsInput): void => {
  const rows = _.map(sessions, toSessionRow);
  const hiddenColumns = _.compact(
    _.map(
      hiddenColumnKeys(columnOverrides),
      (key) => SESSION_COLUMN_FIELDS[key],
    ),
  );

  usePageReadTools(
    {
      noun: 'session',
      plural: 'sessions',
      resource: 'session',
      rowProperties: SESSION_ROW_PROPERTIES,
      rows,
      hiddenColumns,
      pagination,
      filter: {
        filter: queryParams.filter || null,
        statusCategory: queryParams.statusCategory ?? null,
        order: queryParams.order ?? null,
        type: queryParams.type ?? null,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      extraFilterProperties: {
        type: {
          type: 'string',
          description: 'Session-type tab: all | interactive | batch | …',
        },
      },
      current: resolveOpenedRow(rows, openedSessionId, (id) =>
        resourcePath({ type: 'session', id }),
      ),
    },
    [
      JSON.stringify(rows),
      JSON.stringify(hiddenColumns),
      pagination.current,
      pagination.pageSize,
      pagination.total,
      queryParams.filter,
      queryParams.statusCategory,
      queryParams.order,
      queryParams.type,
      openedSessionId,
    ],
  );
};
