/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Read-only WebMCP tools for the RBAC role list (FR-3767) — `/admin/rbac`.
 *
 * Mounted by `RBACManagementPage`, whose only route declares
 * `handle.access: 'superadmin'`, so `RouteAccessGuard` keeps everyone else off
 * the page and these tools with it.
 *
 * The role detail drawer is URL state (`roleDetail`), which is exactly the ref
 * `resourcePath({ type: 'role', id })` builds.
 */
import type {
  WebMCPRoleToolsFragment$data,
  WebMCPRoleToolsFragment$key,
} from '../__generated__/WebMCPRoleToolsFragment.graphql';
import { resourcePath } from '../helper/resourcePath';
import {
  createGetCurrentTool,
  createGetFilterTool,
  createListVisibleTool,
  findRowById,
  webmcpRow,
  type WebMCPCurrentItem,
  type WebMCPPageFilter,
  type WebMCPRow,
  type WebMCPVisibleRows,
} from '../helper/webmcpAdminPageTools';
import { useWebMCPTool, type WebMCPTool } from '../hooks/useWebMCPTool';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

const LIST_DESCRIPTION =
  'The role rows the Backend.AI WebUI RBAC management page (/admin/rbac) is currently rendering, with the columns it shows (name, description, source, status and timestamps) and the first scopes each role is mapped to, plus the total count, the page and the sort in effect.';

const CURRENT_DESCRIPTION =
  'The role whose detail drawer is open on /admin/rbac, or null. The drawer is URL state (the roleDetail search param), so webui_path is the deep link that reopens it.';

const FILTER_DESCRIPTION =
  'The RBAC role list\'s current URL state: the property filter (JSON), the ACTIVE/DELETED status segment and the page/pageSize. Feed the values back through bai_open_resource {"type":"list","resource":"role"}.';

export interface WebMCPRoleToolsProps {
  rolesFrgmt: WebMCPRoleToolsFragment$key;
  count: number;
  page: number;
  pageSize: number;
  sort: string | null;
  /** The page's filter param; an object here is reported as its JSON text. */
  filter: unknown;
  status: string | null;
  /** Relay global id from the `roleDetail` search param. */
  currentRoleId: string | null;
}

export const roleRows = (
  roles: WebMCPRoleToolsFragment$data,
): Array<WebMCPRow> =>
  _.map(roles, (role) =>
    webmcpRow({
      id: role.id,
      name: role.name ?? null,
      description: role.description ?? null,
      source: role.source ?? null,
      status: role.status ?? null,
      created_at: role.createdAt ?? null,
      updated_at: role.updatedAt ?? null,
      scope_count: role.scopes?.count ?? null,
      scopes: _.map(
        _.compact(_.map(role.scopes?.edges, (edge) => edge?.node)),
        (scope) => ({
          scope_type: scope.scopeType ?? null,
          scope_id: scope.scopeId ?? null,
        }),
      ),
    }),
  );

export const createRoleTools = (
  visible: WebMCPVisibleRows,
  current: WebMCPCurrentItem,
  filter: WebMCPPageFilter,
): Array<WebMCPTool> => [
  createListVisibleTool('role', LIST_DESCRIPTION, visible),
  createGetCurrentTool('role', CURRENT_DESCRIPTION, current),
  createGetFilterTool('role', FILTER_DESCRIPTION, filter),
];

/** The `{ current, webui_path }` pair for the drawer the URL currently opens. */
export const currentRoleItem = (
  rows: Array<WebMCPRow>,
  roleId: string | null,
): WebMCPCurrentItem => ({
  current: findRowById(rows, roleId),
  webui_path: roleId ? resourcePath({ type: 'role', id: roleId }) : null,
});

/** The filter param as text: the page stores it as a JSON object. */
export const roleFilterText = (filter: unknown): string | null =>
  _.isNil(filter) ? null : _.isString(filter) ? filter : JSON.stringify(filter);

/** Registers the role tools while the RBAC management page is mounted. */
const WebMCPRoleTools: React.FC<WebMCPRoleToolsProps> = ({
  rolesFrgmt,
  count,
  page,
  pageSize,
  sort,
  filter,
  status,
  currentRoleId,
}) => {
  'use memo';
  const roles = useFragment(
    graphql`
      fragment WebMCPRoleToolsFragment on Role @relay(plural: true) {
        id
        name
        description
        source
        status
        createdAt
        updatedAt
        scopes(first: 3) {
          count
          edges {
            node {
              scopeType
              scopeId
            }
          }
        }
      }
    `,
    rolesFrgmt,
  );

  const rows = roleRows(roles);
  const filterText = roleFilterText(filter);
  const [listTool, currentTool, filterTool] = createRoleTools(
    { rows, count, page, pageSize, sort },
    currentRoleItem(rows, currentRoleId),
    { filter: filterText, status, tab: 'roles', current: page, pageSize },
  );

  useWebMCPTool(listTool, [roles, count, page, pageSize, sort]);
  useWebMCPTool(currentTool, [roles, currentRoleId]);
  useWebMCPTool(filterTool, [filterText, status, page, pageSize]);

  return null;
};

export default WebMCPRoleTools;
