/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebMCPRoleListToolsFragment$key } from '../__generated__/WebMCPRoleListToolsFragment.graphql';
import {
  openedItem,
  overridesFromHiddenKeys,
  pathWithSearchParam,
  usePageReadTools,
  viewStateResult,
  visibleRowsResult,
  type PageToolColumn,
  type PageToolRow,
  type ViewParamValue,
} from '../helper/webmcpPageTools';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import { filterOutNullAndUndefined, useBAIWebMCPActive } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useLocation } from 'react-router-dom';

const ROLE_DETAIL_PARAM = 'roleDetail';

/** `RoleNodes` columns that render a reported field. */
export const ROLE_TOOL_COLUMNS: ReadonlyArray<PageToolColumn> = [
  { key: 'name', fields: ['name'] },
  { key: 'description', fields: ['description'] },
  { key: 'scope', fields: ['scopeType'] },
  { key: 'scopeId', fields: ['scopeId'] },
  { key: 'source', fields: ['source'] },
  { key: 'autoAssign', fields: ['autoAssign'] },
  { key: 'createdAt', fields: ['createdAt'] },
  { key: 'updatedAt', fields: ['updatedAt'] },
];

export interface WebMCPRoleListToolsProps {
  rolesFrgmt: WebMCPRoleListToolsFragment$key;
  page: number;
  pageSize: number;
  total?: number | null;
  /** The rows are still those of the previous view. */
  pending?: boolean;
  /** The list's URL params (`status`, `filter`, `order`). */
  viewParams: Readonly<Record<string, ViewParamValue>>;
  /** Global id of the role whose detail drawer is open. */
  selectedRoleId?: string | null;
}

const RoleListToolsRegistrar: React.FC<WebMCPRoleListToolsProps> = ({
  rolesFrgmt,
  page,
  pageSize,
  total,
  pending,
  viewParams,
  selectedRoleId,
}) => {
  'use memo';
  const [hiddenColumnKeys] = useHiddenColumnKeysSetting('RoleList');
  const { pathname, search } = useLocation();

  const roles = useFragment(
    graphql`
      fragment WebMCPRoleListToolsFragment on Role @relay(plural: true) {
        id
        entityId
        name
        description
        source
        status
        autoAssign
        createdAt
        updatedAt
        scopeType
        scopeId
      }
    `,
    rolesFrgmt,
  );

  const nodes = filterOutNullAndUndefined(roles);
  const rows: Array<PageToolRow> = _.map(nodes, (role) => ({
    id: role.entityId,
    name: role.name ?? null,
    description: role.description ?? null,
    scopeType: role.scopeType ?? null,
    scopeId: role.scopeId ?? null,
    source: role.source ?? null,
    status: role.status ?? null,
    autoAssign: role.autoAssign ?? null,
    createdAt: role.createdAt ?? null,
    updatedAt: role.updatedAt ?? null,
    path: pathWithSearchParam(pathname, search, ROLE_DETAIL_PARAM, role.id),
  }));
  const list = visibleRowsResult({
    rows,
    columns: ROLE_TOOL_COLUMNS,
    columnOverrides: overridesFromHiddenKeys(hiddenColumnKeys),
    page,
    pageSize,
    total,
    pending,
  });
  // The URL and the drawer key on the global id: rows report the UUID as `id`
  // and carry the global id only inside `path`.
  const openedId = _.find(nodes, { id: selectedRoleId ?? '' })?.entityId;

  usePageReadTools({
    noun: 'role',
    plural: 'roles',
    rowFields:
      'Row fields: id (role UUID), name, description, scopeType, scopeId, source, status, autoAssign, createdAt, updatedAt, path (pass it to bai_navigate to open the role).',
    currentMeaning: 'the role whose detail drawer is open',
    readRows: () => list,
    readViewState: () =>
      viewStateResult(
        pathname,
        { ...viewParams, current: page, pageSize },
        pending,
      ),
    readCurrent: () =>
      openedItem(
        list.rows,
        openedId,
        pathWithSearchParam(
          pathname,
          search,
          ROLE_DETAIL_PARAM,
          selectedRoleId ?? '',
        ),
      ),
  });

  return null;
};

/**
 * `bai_list_visible_role`, `bai_get_role_filter` and `bai_get_current_role`
 * for the RBAC role list (ADR 0017).
 */
const WebMCPRoleListTools: React.FC<WebMCPRoleListToolsProps> = (props) => {
  'use memo';
  const isActive = useBAIWebMCPActive();
  return isActive ? <RoleListToolsRegistrar {...props} /> : null;
};

export default WebMCPRoleListTools;
