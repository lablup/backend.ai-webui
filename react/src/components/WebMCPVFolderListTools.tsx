/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebMCPVFolderListToolsFragment$key } from '../__generated__/WebMCPVFolderListToolsFragment.graphql';
import {
  openedItem,
  pathWithSearchParam,
  usePageReadTools,
  viewStateResult,
  visibleRowsResult,
  type PageToolColumn,
  type PageToolRow,
  type ViewParamValue,
} from '../helper/webmcpPageTools';
import {
  filterOutNullAndUndefined,
  useBAIWebMCPActive,
  type BAITableColumnOverrideRecord,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useLocation } from 'react-router-dom';

/** `FolderExplorerOpener`'s params. */
const FOLDER_PARAM = 'folder';
const FOLDER_PATH_PARAM = 'path';

/** `VFolderNodesV2` columns that render a reported field, with their defaults. */
export const VFOLDER_TOOL_COLUMNS: ReadonlyArray<PageToolColumn> = [
  { key: 'name', fields: ['name'], required: true },
  { key: 'status', fields: ['status'] },
  { key: 'host', fields: ['host'] },
  { key: 'permissions', fields: ['permission'] },
  { key: 'ownership_type', fields: ['ownershipType'] },
  { key: 'owner', fields: ['owner'] },
  { key: 'usage_mode', fields: ['usageMode'], defaultHidden: true },
  { key: 'num_files', fields: ['numFiles'], defaultHidden: true },
  { key: 'cur_size', fields: ['usageBytes'], defaultHidden: true },
  { key: 'cloneable', fields: ['cloneable'], defaultHidden: true },
  { key: 'last_used', fields: ['lastUsed'], defaultHidden: true },
  { key: 'created_at', fields: ['createdAt'], defaultHidden: true },
];

/** The explorer puts the folder id in the URL without dashes. */
const sameFolderId = (row: PageToolRow, id: string): boolean =>
  row.id.replaceAll('-', '').toLowerCase() ===
  id.replaceAll('-', '').toLowerCase();

export interface WebMCPVFolderListToolsProps {
  vfoldersFrgmt: WebMCPVFolderListToolsFragment$key;
  columnOverrides?: BAITableColumnOverrideRecord | null;
  page: number;
  pageSize: number;
  total?: number | null;
  /** The list's URL params (`statusCategory`, `mode`, `filter`, `order`). */
  viewParams: Readonly<Record<string, ViewParamValue>>;
}

const VFolderListToolsRegistrar: React.FC<WebMCPVFolderListToolsProps> = ({
  vfoldersFrgmt,
  columnOverrides,
  page,
  pageSize,
  total,
  viewParams,
}) => {
  'use memo';
  const { pathname, search } = useLocation();

  const vfolders = useFragment(
    graphql`
      fragment WebMCPVFolderListToolsFragment on VFolder @relay(plural: true) {
        id
        vfolderStatus: status
        host
        usage {
          numFiles
          usedBytes {
            expr @since(version: "26.8.0")
          }
        }
        metadata {
          name
          usageMode
          createdAt
          lastUsed
          cloneable
        }
        accessControl {
          permission
          ownershipType
        }
        ownership {
          user {
            basicInfo {
              email
            }
          }
          project {
            basicInfo {
              name
            }
          }
        }
      }
    `,
    vfoldersFrgmt,
  );

  const rows: Array<PageToolRow> = _.map(
    filterOutNullAndUndefined(vfolders),
    (vfolder) => ({
      id: vfolder.id ?? '',
      name: vfolder.metadata?.name ?? null,
      status: vfolder.vfolderStatus ?? null,
      host: vfolder.host ?? null,
      permission: vfolder.accessControl?.permission ?? null,
      ownershipType: vfolder.accessControl?.ownershipType ?? null,
      owner:
        (vfolder.accessControl?.ownershipType === 'USER'
          ? vfolder.ownership?.user?.basicInfo?.email
          : vfolder.ownership?.project?.basicInfo?.name) ?? null,
      usageMode: vfolder.metadata?.usageMode ?? null,
      numFiles: vfolder.usage?.numFiles ?? null,
      usageBytes: vfolder.usage?.usedBytes?.expr ?? null,
      cloneable: vfolder.metadata?.cloneable ?? null,
      lastUsed: vfolder.metadata?.lastUsed ?? null,
      createdAt: vfolder.metadata?.createdAt ?? null,
    }),
  );
  const list = visibleRowsResult({
    rows,
    columns: VFOLDER_TOOL_COLUMNS,
    columnOverrides,
    page,
    pageSize,
    total,
  });
  const params = new URLSearchParams(search);
  const openedId = params.get(FOLDER_PARAM);
  const folderPath = params.get(FOLDER_PATH_PARAM);

  usePageReadTools({
    noun: 'vfolder',
    plural: 'folders',
    rowFields:
      'Row fields: id (folder UUID), name, status, host, permission, ownershipType (USER or GROUP), owner, usageMode, numFiles, usageBytes, cloneable, lastUsed, createdAt.',
    currentMeaning:
      'the folder open in the file explorer, with folderPath being the directory shown inside it',
    readRows: () => list,
    readViewState: () =>
      viewStateResult(pathname, { ...viewParams, current: page, pageSize }),
    readCurrent: () => {
      const opened = openedItem(
        list.rows,
        openedId,
        pathWithSearchParam(pathname, search, FOLDER_PARAM, openedId ?? ''),
        sameFolderId,
      );
      return opened && { ...opened, folderPath: folderPath ?? null };
    },
  });

  return null;
};

/**
 * `bai_list_visible_vfolder`, `bai_get_vfolder_filter` and
 * `bai_get_current_vfolder` for the folder list (ADR 0011).
 */
const WebMCPVFolderListTools: React.FC<WebMCPVFolderListToolsProps> = (
  props,
) => {
  'use memo';
  const isActive = useBAIWebMCPActive();
  return isActive ? <VFolderListToolsRegistrar {...props} /> : null;
};

export default WebMCPVFolderListTools;
