/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Read-only WebMCP tools for the two tabs of `/admin/users` (FR-3767): `user`
 * on the Users tab and `keypair` on the Credentials tab.
 *
 * Mounted by `AdminUserManagement` / `AdminUserCredentialList`, whose only call
 * site is `AdminUsersPage` under the `/admin/users` route; that subtree
 * declares `handle.access: 'admin'`, so `RouteAccessGuard` keeps non-admins off
 * the page and these tools with it. Only the mounted tab's tools are
 * registered, because the other tab's component is not rendered.
 *
 * Neither users nor keypairs have a detail deep link yet (`resourcePath`'s
 * `ResourceRef` has no member for them), so `bai_get_current_*` reports the row
 * with `webui_path: null`.
 */
import type {
  WebMCPAdminUserToolsFragment$data,
  WebMCPAdminUserToolsFragment$key,
} from '../__generated__/WebMCPAdminUserToolsFragment.graphql';
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

const USER_LIST_DESCRIPTION =
  'The user rows the Backend.AI WebUI /admin/users Users tab is currently rendering, with the columns it shows (email, full name, username, domain, role, resource policy, main access key and status), plus the total count, the page and the sort in effect.';

const USER_CURRENT_DESCRIPTION =
  'The user whose detail or edit modal is open on the /admin/users Users tab, or null. Users have no detail deep link yet, so webui_path is always null; open the list with bai_open_resource {"type":"list","resource":"user"} instead.';

const USER_FILTER_DESCRIPTION =
  'The /admin/users Users tab\'s current URL state: the property filter (JSON), the ACTIVE/INACTIVE status segment, the tab and the page/pageSize. Feed the values back through bai_open_resource {"type":"list","resource":"user"}.';

const KEYPAIR_LIST_DESCRIPTION =
  'The keypair rows the Backend.AI WebUI /admin/users Credentials tab is currently rendering, with the columns it shows (access key, user id, admin flag, resource policy, rate limit, queries, concurrency used and creation time), plus the total count, the page and the sort in effect.';

const KEYPAIR_CURRENT_DESCRIPTION =
  'The keypair whose info modal is open on the /admin/users Credentials tab, or null. Keypairs have no detail deep link yet, so webui_path is always null; open the list with bai_open_resource {"type":"list","resource":"keypair"} instead.';

const KEYPAIR_FILTER_DESCRIPTION =
  'The /admin/users Credentials tab\'s current URL state: the free-text filter, the active/inactive segment (URL param "activeType"), the tab and the page/pageSize. Feed the values back through bai_open_resource {"type":"list","resource":"keypair"}.';

export const userRows = (
  users: WebMCPAdminUserToolsFragment$data,
): Array<WebMCPRow> =>
  _.map(users, (user) =>
    webmcpRow({
      id: user.id,
      email: user.basicInfo?.email ?? null,
      full_name: user.basicInfo?.fullName ?? null,
      username: user.basicInfo?.username ?? null,
      domain: user.organization?.domainName ?? null,
      role: user.organization?.role ?? null,
      resource_policy: user.organization?.resourcePolicy ?? null,
      main_access_key: user.organization?.mainAccessKey ?? null,
      status: user.status?.status ?? null,
    }),
  );

export const createAdminUserTools = (
  visible: WebMCPVisibleRows,
  current: WebMCPCurrentItem,
  filter: WebMCPPageFilter,
): Array<WebMCPTool> => [
  createListVisibleTool('user', USER_LIST_DESCRIPTION, visible),
  createGetCurrentTool('user', USER_CURRENT_DESCRIPTION, current),
  createGetFilterTool('user', USER_FILTER_DESCRIPTION, filter),
];

export interface WebMCPAdminUserToolsProps {
  usersFrgmt: WebMCPAdminUserToolsFragment$key;
  count: number;
  page: number;
  pageSize: number;
  sort: string | null;
  filter: string | null;
  status: string | null;
  /** Relay global id of the user whose detail / edit modal is open. */
  currentUserId: string | null;
}

/** Registers the `user` tools while the Users tab is mounted. */
export const WebMCPAdminUserTools: React.FC<WebMCPAdminUserToolsProps> = ({
  usersFrgmt,
  count,
  page,
  pageSize,
  sort,
  filter,
  status,
  currentUserId,
}) => {
  'use memo';
  const users = useFragment(
    graphql`
      fragment WebMCPAdminUserToolsFragment on UserV2 @relay(plural: true) {
        id
        basicInfo {
          email
          fullName
          username
        }
        organization {
          domainName
          role
          resourcePolicy
          mainAccessKey
        }
        status {
          status
        }
      }
    `,
    usersFrgmt,
  );

  const rows = userRows(users);
  const [listTool, currentTool, filterTool] = createAdminUserTools(
    { rows, count, page, pageSize, sort },
    { current: findRowById(rows, currentUserId), webui_path: null },
    { filter, status, tab: 'users', current: page, pageSize },
  );

  useWebMCPTool(listTool, [users, count, page, pageSize, sort]);
  useWebMCPTool(currentTool, [users, currentUserId]);
  useWebMCPTool(filterTool, [filter, status, page, pageSize]);

  return null;
};

/** One row of `keypair_list.items`, as the Credentials tab already has it. */
export interface WebMCPKeypairInput {
  readonly id: string | null | undefined;
  readonly access_key: string | null | undefined;
  readonly user_id: string | null | undefined;
  readonly is_admin: boolean | null | undefined;
  readonly resource_policy: string | null | undefined;
  readonly rate_limit: number | null | undefined;
  readonly num_queries: number | null | undefined;
  readonly concurrency_used?: number | null | undefined;
  readonly created_at: string | null | undefined;
}

export const keypairRows = (
  keypairs: ReadonlyArray<WebMCPKeypairInput | null | undefined>,
): Array<WebMCPRow> =>
  _.map(_.compact(keypairs), (keypair) =>
    webmcpRow({
      id: keypair.id ?? null,
      access_key: keypair.access_key ?? null,
      user_id: keypair.user_id ?? null,
      is_admin: keypair.is_admin ?? null,
      resource_policy: keypair.resource_policy ?? null,
      rate_limit: keypair.rate_limit ?? null,
      num_queries: keypair.num_queries ?? null,
      concurrency_used: keypair.concurrency_used ?? null,
      created_at: keypair.created_at ?? null,
    }),
  );

export const createAdminKeypairTools = (
  visible: WebMCPVisibleRows,
  current: WebMCPCurrentItem,
  filter: WebMCPPageFilter,
): Array<WebMCPTool> => [
  createListVisibleTool('keypair', KEYPAIR_LIST_DESCRIPTION, visible),
  createGetCurrentTool('keypair', KEYPAIR_CURRENT_DESCRIPTION, current),
  createGetFilterTool('keypair', KEYPAIR_FILTER_DESCRIPTION, filter),
];

export interface WebMCPAdminKeypairToolsProps {
  keypairs: ReadonlyArray<WebMCPKeypairInput | null | undefined>;
  count: number;
  page: number;
  pageSize: number;
  sort: string | null;
  filter: string | null;
  /** `active` / `inactive` — the URL spells this segment `activeType`. */
  activeType: string | null;
  /** `id` of the keypair whose info modal is open. */
  currentKeypairId: string | null;
}

/** Registers the `keypair` tools while the Credentials tab is mounted. */
export const WebMCPAdminKeypairTools: React.FC<
  WebMCPAdminKeypairToolsProps
> = ({
  keypairs,
  count,
  page,
  pageSize,
  sort,
  filter,
  activeType,
  currentKeypairId,
}) => {
  'use memo';
  const rows = keypairRows(keypairs);
  const [listTool, currentTool, filterTool] = createAdminKeypairTools(
    { rows, count, page, pageSize, sort },
    { current: findRowById(rows, currentKeypairId), webui_path: null },
    { filter, status: activeType, tab: 'credentials', current: page, pageSize },
  );

  useWebMCPTool(listTool, [keypairs, count, page, pageSize, sort]);
  useWebMCPTool(currentTool, [keypairs, currentKeypairId]);
  useWebMCPTool(filterTool, [filter, activeType, page, pageSize]);

  return null;
};
