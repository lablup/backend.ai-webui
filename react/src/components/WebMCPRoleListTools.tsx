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
import { useSuspendedBackendaiClient } from '../hooks';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import { filterOutNullAndUndefined, useBAIWebMCPActive } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useLocation } from 'react-router-dom';

const ROLE_DETAIL_PARAM = 'roleDetail';

/** `RoleNodes` columns that render a reported field. */
export const roleToolColumns = (
  supportsAutoAssign: boolean,
): Array<PageToolColumn> => [
  { key: 'name', fields: ['name'] },
  { key: 'description', fields: ['description'] },
  { key: 'scope', fields: ['scopeType'] },
  { key: 'scopeId', fields: ['scopeId'] },
  { key: 'source', fields: ['source'] },
  { key: 'autoAssign', fields: ['autoAssign'], absent: !supportsAutoAssign },
  { key: 'createdAt', fields: ['createdAt'] },
  { key: 'updatedAt', fields: ['updatedAt'] },
];

export interface WebMCPRoleListToolsProps {
  rolesFrgmt: WebMCPRoleListToolsFragment$key;
  page: number;
  pageSize: number;
  total?: number | null;
  /** The list's URL params (`status`, `filter`, `order`). */
  viewParams: Readonly<Record<string, ViewParamValue>>;
}

const RoleListToolsRegistrar: React.FC<WebMCPRoleListToolsProps> = ({
  rolesFrgmt,
  page,
  pageSize,
  total,
  viewParams,
}) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const [hiddenColumnKeys] = useHiddenColumnKeysSetting('RoleList');
  const { pathname, search } = useLocation();

  const roles = useFragment(
    graphql`
      fragment WebMCPRoleListToolsFragment on Role @relay(plural: true) {
        id
        name
        description
        source
        status
        autoAssign @since(version: "26.4.4")
        createdAt
        updatedAt
        scopes(first: 3) @deprecatedSince(version: "26.9.0") {
          count
          edges {
            node {
              scopeType
              scopeId
            }
          }
        }
        scopeType @since(version: "26.9.0")
        scopeId @since(version: "26.9.0")
      }
    `,
    rolesFrgmt,
  );

  const rows: Array<PageToolRow> = _.map(
    filterOutNullAndUndefined(roles),
    (role) => {
      // Managers before 26.9.0 answer a scopes connection; its first is shown.
      const firstScope = role.scopes?.edges?.[0]?.node;
      return {
        id: role.id,
        name: role.name ?? null,
        description: role.description ?? null,
        scopeType: role.scopeType ?? firstScope?.scopeType ?? null,
        scopeId: role.scopeId ?? firstScope?.scopeId ?? null,
        source: role.source ?? null,
        status: role.status ?? null,
        autoAssign: role.autoAssign ?? null,
        createdAt: role.createdAt ?? null,
        updatedAt: role.updatedAt ?? null,
      };
    },
  );
  const list = visibleRowsResult({
    rows,
    columns: roleToolColumns(baiClient.supports('role-auto-assign')),
    columnOverrides: overridesFromHiddenKeys(hiddenColumnKeys),
    page,
    pageSize,
    total,
  });
  const openedId = new URLSearchParams(search).get(ROLE_DETAIL_PARAM);

  usePageReadTools({
    noun: 'role',
    plural: 'roles',
    rowFields:
      'Row fields: id (role id), name, description, scopeType, scopeId, source, status, autoAssign, createdAt, updatedAt.',
    currentMeaning: 'the role whose detail drawer is open',
    readRows: () => list,
    readViewState: () =>
      viewStateResult(pathname, { ...viewParams, current: page, pageSize }),
    readCurrent: () =>
      openedItem(
        list.rows,
        openedId,
        pathWithSearchParam(
          pathname,
          search,
          ROLE_DETAIL_PARAM,
          openedId ?? '',
        ),
      ),
  });

  return null;
};

/**
 * `bai_list_visible_role`, `bai_get_role_filter` and `bai_get_current_role`
 * for the RBAC role list (ADR 0009).
 */
const WebMCPRoleListTools: React.FC<WebMCPRoleListToolsProps> = (props) => {
  'use memo';
  const isActive = useBAIWebMCPActive();
  return isActive ? <RoleListToolsRegistrar {...props} /> : null;
};

export default WebMCPRoleListTools;
