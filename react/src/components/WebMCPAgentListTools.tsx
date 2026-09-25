/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebMCPAgentListToolsFragment$key } from '../__generated__/WebMCPAgentListToolsFragment.graphql';
import {
  openedItem,
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

/** `BAIAgentTable` columns that render a reported field, with their defaults. */
export const AGENT_TOOL_COLUMNS: ReadonlyArray<PageToolColumn> = [
  { key: 'row_id', fields: ['endpoint'] },
  { key: 'region', fields: ['region'] },
  { key: 'architecture', fields: ['architecture'] },
  { key: 'version', fields: ['version'], defaultHidden: true },
  { key: 'first_contact', fields: ['firstContact'] },
  { key: 'lost_at', fields: ['lostAt'], defaultHidden: true },
  {
    key: 'allocated_resources',
    fields: ['occupiedSlots', 'availableSlots'],
  },
  { key: 'scaling_group', fields: ['resourceGroup'] },
  { key: 'status', fields: ['status'] },
  { key: 'schedulable', fields: ['schedulable'] },
];

/** A JSON-string slot column (`occupied_slots`, …) as an object, else `null`. */
export const parseSlots = (value: string | null | undefined): unknown => {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return _.isPlainObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export interface WebMCPAgentListToolsProps {
  agentsFrgmt: WebMCPAgentListToolsFragment$key;
  columnOverrides?: BAITableColumnOverrideRecord | null;
  page: number;
  pageSize: number;
  total?: number | null;
  /** The list's URL params (`tab`, `status`, `filter`, `order`). */
  viewParams: Readonly<Record<string, ViewParamValue>>;
  /** Relay id of the agent whose detail drawer is open. */
  openedAgentId?: string | null;
}

const AgentListToolsRegistrar: React.FC<WebMCPAgentListToolsProps> = ({
  agentsFrgmt,
  columnOverrides,
  page,
  pageSize,
  total,
  viewParams,
  openedAgentId,
}) => {
  'use memo';
  const { pathname } = useLocation();

  const agents = useFragment(
    graphql`
      fragment WebMCPAgentListToolsFragment on AgentNode @relay(plural: true) {
        id
        row_id
        addr
        region
        architecture
        version
        first_contact
        lost_at
        occupied_slots
        available_slots
        scaling_group
        status
        schedulable
      }
    `,
    agentsFrgmt,
  );

  const nodes = filterOutNullAndUndefined(agents);
  const rows: Array<PageToolRow> = _.map(nodes, (agent) => ({
    id: agent.row_id ?? agent.id,
    endpoint: agent.addr ?? null,
    region: agent.region ?? null,
    architecture: agent.architecture ?? null,
    version: agent.version ?? null,
    firstContact: agent.first_contact ?? null,
    lostAt: agent.lost_at ?? null,
    occupiedSlots: parseSlots(agent.occupied_slots),
    availableSlots: parseSlots(agent.available_slots),
    resourceGroup: agent.scaling_group ?? null,
    status: agent.status ?? null,
    schedulable: agent.schedulable ?? null,
  }));
  const list = visibleRowsResult({
    rows,
    columns: AGENT_TOOL_COLUMNS,
    columnOverrides,
    page,
    pageSize,
    total,
  });
  const openedRowId = openedAgentId
    ? (_.find(nodes, (agent) => agent.id === openedAgentId)?.row_id ??
      openedAgentId)
    : null;

  usePageReadTools({
    noun: 'agent',
    plural: 'agents',
    rowFields:
      'Row fields: id (agent id), endpoint, region, architecture, version, firstContact, lostAt, occupiedSlots, availableSlots (resource slot maps), resourceGroup, status, schedulable.',
    currentMeaning:
      'the agent whose detail drawer is open; agents have no deep link, so path is null',
    readRows: () => list,
    readViewState: () =>
      viewStateResult(pathname, { ...viewParams, current: page, pageSize }),
    readCurrent: () => openedItem(list.rows, openedRowId, null),
  });

  return null;
};

/**
 * `bai_list_visible_agent`, `bai_get_agent_filter` and
 * `bai_get_current_agent` for the agent list (ADR 0009).
 */
const WebMCPAgentListTools: React.FC<WebMCPAgentListToolsProps> = (props) => {
  'use memo';
  const isActive = useBAIWebMCPActive();
  return isActive ? <AgentListToolsRegistrar {...props} /> : null;
};

export default WebMCPAgentListTools;
