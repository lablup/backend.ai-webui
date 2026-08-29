/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Read-only WebMCP tools for the admin (all-projects) session list (FR-3767) —
 * `/admin/session`.
 *
 * Mounted by `AdminComputeSessionListPage`, which only renders under the
 * `/admin/session` route; that subtree declares `handle.access: 'admin'`, so
 * `RouteAccessGuard` keeps non-admins off the page and these tools with it.
 *
 * The page has no session detail route: the drawer is opened by the
 * `sessionDetail` search param (FR-3759), which is what
 * `bai_get_current_session` reads.
 */
import type {
  WebMCPAdminSessionToolsFragment$data,
  WebMCPAdminSessionToolsFragment$key,
} from '../__generated__/WebMCPAdminSessionToolsFragment.graphql';
import { resourcePath, SESSION_DETAIL_PARAM } from '../helper/resourcePath';
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
import { parseAsString, useQueryState } from 'nuqs';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

const LIST_DESCRIPTION =
  'The session rows the Backend.AI WebUI admin session list (all projects) is currently rendering, with the columns it shows (session id, name, status, type, resource group, project, owner and creation time), plus the total count, the page and the sort in effect.';

const CURRENT_DESCRIPTION =
  'The session whose detail drawer is open on the admin session list, or null. The drawer is URL state (the sessionDetail search param), so webui_path is the deep link that reopens it.';

const FILTER_DESCRIPTION =
  'The admin session list\'s current URL state: the property filter, the running/finished status category, the session-type tab and the page/pageSize. Feed the values back through bai_open_resource {"type":"list","resource":"session"}.';

export interface WebMCPAdminSessionToolsProps {
  sessionsFrgmt: WebMCPAdminSessionToolsFragment$key;
  count: number;
  page: number;
  pageSize: number;
  sort: string | null;
  filter: string | null;
  statusCategory: string | null;
  /** The session-type tab (`all` / `interactive` / `batch` / …). */
  type: string | null;
}

export const sessionRows = (
  sessions: WebMCPAdminSessionToolsFragment$data,
): Array<WebMCPRow> =>
  _.map(sessions, (session) =>
    webmcpRow({
      id: session.id,
      session_id: session.row_id ?? null,
      name: session.name ?? null,
      status: session.status ?? null,
      type: session.type ?? null,
      resource_group: session.scaling_group ?? null,
      project_id: session.project_id ?? null,
      user_id: session.user_id ?? null,
      created_at: session.created_at ?? null,
    }),
  );

export const createAdminSessionTools = (
  visible: WebMCPVisibleRows,
  current: WebMCPCurrentItem,
  filter: WebMCPPageFilter,
): Array<WebMCPTool> => [
  createListVisibleTool('session', LIST_DESCRIPTION, visible),
  createGetCurrentTool('session', CURRENT_DESCRIPTION, current),
  createGetFilterTool('session', FILTER_DESCRIPTION, filter),
];

/** The `{ current, webui_path }` pair for the drawer the URL currently opens. */
export const currentSessionItem = (
  rows: Array<WebMCPRow>,
  sessionDetailId: string | null,
): WebMCPCurrentItem => ({
  current: findRowById(rows, sessionDetailId, 'session_id'),
  webui_path: sessionDetailId
    ? resourcePath({ type: 'session', id: sessionDetailId })
    : null,
});

/** Registers the admin session tools while the admin session list is mounted. */
const WebMCPAdminSessionTools: React.FC<WebMCPAdminSessionToolsProps> = ({
  sessionsFrgmt,
  count,
  page,
  pageSize,
  sort,
  filter,
  statusCategory,
  type,
}) => {
  'use memo';
  const sessions = useFragment(
    graphql`
      fragment WebMCPAdminSessionToolsFragment on ComputeSessionNode
      @relay(plural: true) {
        id
        row_id
        name
        status
        type
        scaling_group
        project_id
        user_id
        created_at
      }
    `,
    sessionsFrgmt,
  );
  const [sessionDetailId] = useQueryState(SESSION_DETAIL_PARAM, parseAsString);

  const rows = sessionRows(sessions);
  const [listTool, currentTool, filterTool] = createAdminSessionTools(
    { rows, count, page, pageSize, sort },
    currentSessionItem(rows, sessionDetailId),
    { filter, status: statusCategory, tab: type, current: page, pageSize },
  );

  useWebMCPTool(listTool, [sessions, count, page, pageSize, sort]);
  useWebMCPTool(currentTool, [sessions, sessionDetailId]);
  useWebMCPTool(filterTool, [filter, statusCategory, type, page, pageSize]);

  return null;
};

export default WebMCPAdminSessionTools;
