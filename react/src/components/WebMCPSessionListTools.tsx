/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebMCPSessionListToolsFragment$key } from '../__generated__/WebMCPSessionListToolsFragment.graphql';
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
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import {
  filterOutNullAndUndefined,
  useBAIWebMCPActive,
  type BAITableColumnOverrideRecord,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useLocation } from 'react-router-dom';

export const SESSION_DETAIL_PARAM = 'sessionDetail';

/** `SessionNodes` columns that render a reported field, with their defaults. */
export const sessionToolColumns = (
  showAgents: boolean,
): Array<PageToolColumn> => [
  { key: 'name', fields: ['name'], required: true },
  { key: 'status', fields: ['status'] },
  { key: 'status_info', fields: ['statusInfo'], defaultHidden: true },
  { key: 'result', fields: ['result'], defaultHidden: true },
  { key: 'resourceGroup', fields: ['resourceGroup'], defaultHidden: true },
  { key: 'type', fields: ['type'], defaultHidden: true },
  { key: 'created_at', fields: ['createdAt'], defaultHidden: true },
  { key: 'terminated_at', fields: ['terminatedAt'], defaultHidden: true },
  { key: 'domain_name', fields: ['domainName'], defaultHidden: true },
  { key: 'project_id', fields: ['projectId'], defaultHidden: true },
  { key: 'agent', fields: ['agentIds'], absent: !showAgents },
];

export interface WebMCPSessionListToolsProps {
  sessionsFrgmt: WebMCPSessionListToolsFragment$key;
  columnOverrides?: BAITableColumnOverrideRecord | null;
  page: number;
  pageSize: number;
  total?: number | null;
  /** The list's URL params (`type`, `statusCategory`, `filter`, `order`, …). */
  viewParams: Readonly<Record<string, ViewParamValue>>;
}

const SessionListToolsRegistrar: React.FC<WebMCPSessionListToolsProps> = ({
  sessionsFrgmt,
  columnOverrides,
  page,
  pageSize,
  total,
  viewParams,
}) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const userRole = useCurrentUserRole();
  const { pathname, search } = useLocation();

  const sessions = useFragment(
    graphql`
      fragment WebMCPSessionListToolsFragment on ComputeSessionNode
      @relay(plural: true) {
        row_id
        name
        status
        status_info
        result
        type
        scaling_group
        created_at
        terminated_at
        domain_name
        project_id
        agent_ids
      }
    `,
    sessionsFrgmt,
  );

  const rows: Array<PageToolRow> = _.map(
    filterOutNullAndUndefined(sessions),
    (session) => ({
      id: session.row_id ?? '',
      name: session.name ?? null,
      status: session.status ?? null,
      statusInfo: session.status_info ?? null,
      result: session.result ?? null,
      resourceGroup: session.scaling_group ?? null,
      type: session.type ?? null,
      createdAt: session.created_at ?? null,
      terminatedAt: session.terminated_at ?? null,
      domainName: session.domain_name ?? null,
      projectId: session.project_id ?? null,
      agentIds: session.agent_ids ?? null,
    }),
  );
  const list = visibleRowsResult({
    rows,
    columns: sessionToolColumns(
      userRole === 'superadmin' || !baiClient._config?.hideAgents,
    ),
    columnOverrides,
    page,
    pageSize,
    total,
  });
  const openedId = new URLSearchParams(search).get(SESSION_DETAIL_PARAM);

  usePageReadTools({
    noun: 'session',
    plural: 'sessions',
    rowFields:
      'Row fields: id (session UUID), name, status, statusInfo, result, resourceGroup, type, createdAt, terminatedAt, domainName, projectId, agentIds.',
    currentMeaning: 'the session whose detail drawer is open',
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
          SESSION_DETAIL_PARAM,
          openedId ?? '',
        ),
      ),
  });

  return null;
};

/**
 * `bai_list_visible_session`, `bai_get_session_filter` and
 * `bai_get_current_session` for the session list (ADR 0009).
 */
const WebMCPSessionListTools: React.FC<WebMCPSessionListToolsProps> = (
  props,
) => {
  'use memo';
  const isActive = useBAIWebMCPActive();
  return isActive ? <SessionListToolsRegistrar {...props} /> : null;
};

export default WebMCPSessionListTools;
