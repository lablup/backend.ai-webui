/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * `/data` (FR-3766): `bai_list_visible_vfolder`, `bai_get_vfolder_filter` and
 * `bai_get_current_vfolder` — "current" being the folder open in the explorer
 * modal (`?folder=…&path=…`, see `FolderExplorerOpener`).
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
import { toLocalId } from 'backend.ai-ui';
import * as _ from 'lodash-es';

/** The node fields `VFolderNodeListPageQuery` selects for these tools. */
export interface VFolderRowSource {
  readonly id: string;
  readonly name?: string | null;
  readonly status?: string | null;
  readonly host?: string | null;
  readonly usage_mode?: string | null;
  readonly ownership_type?: string | null;
  readonly created_at?: string | null;
}

export const VFOLDER_ROW_PROPERTIES: Readonly<
  Record<string, JsonSchemaForInference>
> = {
  id: { type: 'string', description: 'VFolder UUID.' },
  name: { type: 'string' },
  status: { type: 'string' },
  host: { type: 'string', description: 'Storage host.' },
  usage_mode: { type: 'string' },
  ownership_type: { type: 'string', description: 'user | group.' },
  created_at: { type: 'string' },
};

/** `VFolderNodes` column keys map 1:1 onto the row fields above. */
const VFOLDER_COLUMN_FIELDS: Readonly<Record<string, string>> = {
  name: 'name',
  status: 'status',
  host: 'host',
  usage_mode: 'usage_mode',
  ownership_type: 'ownership_type',
  created_at: 'created_at',
};

export const toVFolderRow = (node: VFolderRowSource): PageToolRow => ({
  id: toLocalId(node.id) ?? node.id,
  name: node.name ?? null,
  status: node.status ?? null,
  host: node.host ?? null,
  usage_mode: node.usage_mode ?? null,
  ownership_type: node.ownership_type ?? null,
  created_at: node.created_at ?? null,
});

/** The explorer strips dashes from the id it puts in the URL. */
const sameFolderId = (a: string, b: string): boolean =>
  a.replaceAll('-', '').toLowerCase() === b.replaceAll('-', '').toLowerCase();

export interface VFolderListWebMCPToolsInput {
  vfolders: ReadonlyArray<VFolderRowSource>;
  columnOverrides?: TableColumnOverrides;
  pagination: { current: number; pageSize: number; total?: number | null };
  queryParams: {
    filter?: string | null;
    statusCategory?: string | null;
    order?: string | null;
    mode?: string | null;
  };
  /** `folder` search param — the folder open in the explorer. */
  openedFolderId?: string | null;
  /** `path` search param — where inside that folder the explorer is. */
  openedFolderPath?: string | null;
}

export const useVFolderListWebMCPTools = ({
  vfolders,
  columnOverrides,
  pagination,
  queryParams,
  openedFolderId,
  openedFolderPath,
}: VFolderListWebMCPToolsInput): void => {
  const rows = _.map(vfolders, toVFolderRow);
  const hiddenColumns = _.compact(
    _.map(
      hiddenColumnKeys(columnOverrides),
      (key) => VFOLDER_COLUMN_FIELDS[key],
    ),
  );
  const opened = resolveOpenedRow(
    rows,
    openedFolderId,
    (id) =>
      resourcePath({
        type: 'vfolder',
        id,
        ...(openedFolderPath ? { path: openedFolderPath } : {}),
      }),
    (row, id) => sameFolderId(row.id, id),
  );

  usePageReadTools(
    {
      noun: 'vfolder',
      plural: 'folders',
      resource: 'vfolder',
      rowProperties: VFOLDER_ROW_PROPERTIES,
      rows,
      hiddenColumns,
      pagination,
      filter: {
        filter: queryParams.filter || null,
        statusCategory: queryParams.statusCategory ?? null,
        order: queryParams.order ?? null,
        mode: queryParams.mode ?? null,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      extraFilterProperties: {
        mode: {
          type: 'string',
          description:
            'Usage-mode tab: all | general | data | automount | model.',
        },
      },
      current:
        opened === null ? null : { ...opened, path: openedFolderPath ?? null },
      currentProperties: {
        path: { type: 'string', description: 'Path open in the explorer.' },
      },
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
      queryParams.mode,
      openedFolderId,
      openedFolderPath,
    ],
  );
};
