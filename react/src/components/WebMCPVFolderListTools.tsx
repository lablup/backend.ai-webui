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

/** `VFolderNodes` columns that render a reported field, with their defaults. */
export const VFOLDER_TOOL_COLUMNS: ReadonlyArray<PageToolColumn> = [
  { key: 'name', fields: ['name'], required: true },
  { key: 'status', fields: ['status'] },
  { key: 'host', fields: ['host'] },
  { key: 'permission', fields: ['permission'], defaultHidden: true },
  { key: 'ownership_type', fields: ['ownershipType'] },
  { key: 'owner', fields: ['owner'] },
  { key: 'creator', fields: ['creator'], defaultHidden: true },
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
      fragment WebMCPVFolderListToolsFragment on VirtualFolderNode
      @relay(plural: true) {
        row_id
        name
        status
        host
        permission
        ownership_type
        user_email
        group_name
        creator
        usage_mode
        num_files
        cur_size
        cloneable
        last_used
        created_at
      }
    `,
    vfoldersFrgmt,
  );

  const rows: Array<PageToolRow> = _.map(
    filterOutNullAndUndefined(vfolders),
    (vfolder) => ({
      id: vfolder.row_id ?? '',
      name: vfolder.name ?? null,
      status: vfolder.status ?? null,
      host: vfolder.host ?? null,
      permission: vfolder.permission ?? null,
      ownershipType: vfolder.ownership_type ?? null,
      owner:
        (vfolder.ownership_type === 'user'
          ? vfolder.user_email
          : vfolder.group_name) ?? null,
      creator: vfolder.creator ?? null,
      usageMode: vfolder.usage_mode ?? null,
      numFiles: vfolder.num_files ?? null,
      usageBytes: vfolder.cur_size ?? null,
      cloneable: vfolder.cloneable ?? null,
      lastUsed: vfolder.last_used ?? null,
      createdAt: vfolder.created_at ?? null,
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
      'Row fields: id (folder UUID), name, status, host, permission, ownershipType (user or group), owner, creator, usageMode, numFiles, usageBytes, cloneable, lastUsed, createdAt.',
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
 * `bai_get_current_vfolder` for the folder list (ADR 0009).
 */
const WebMCPVFolderListTools: React.FC<WebMCPVFolderListToolsProps> = (
  props,
) => {
  'use memo';
  const isActive = useBAIWebMCPActive();
  return isActive ? <VFolderListToolsRegistrar {...props} /> : null;
};

export default WebMCPVFolderListTools;
