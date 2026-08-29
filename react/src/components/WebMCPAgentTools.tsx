/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Read-only WebMCP tools for the agent list (FR-3767) — `/admin/agent?tab=agents`.
 *
 * Mounted by `AgentList`, whose every call site is superadmin-only (the
 * `/admin/agent` route declares `access: 'superadmin'`; the dashboard's
 * `ActiveAgents` board item is rendered only for superadmins), so a non-admin
 * tab never advertises these tools.
 */
import type {
  WebMCPAgentToolsFragment$data,
  WebMCPAgentToolsFragment$key,
} from '../__generated__/WebMCPAgentToolsFragment.graphql';
import {
  createGetCurrentTool,
  createGetFilterTool,
  createListVisibleTool,
  findRowById,
  parseJsonColumn,
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
  'The agent rows the Backend.AI WebUI agent list is currently rendering, with the columns it shows (id/endpoint, region, architecture, status, resource group, schedulable, first contact and the occupied/available resource slots), plus the total count, the page and the sort in effect.';

const CURRENT_DESCRIPTION =
  'The agent whose detail drawer is open in the agent list, or null. Agents have no detail deep link yet, so webui_path is always null; open the list with bai_open_resource {"type":"list","resource":"agent"} instead.';

const FILTER_DESCRIPTION =
  'The agent list\'s current URL state: the property filter, the ALIVE/TERMINATED status segment and the page/pageSize. Feed the values back through bai_open_resource {"type":"list","resource":"agent"}.';

export interface WebMCPAgentToolsProps {
  agentsFrgmt: WebMCPAgentToolsFragment$key;
  /** Total matching the filter (the table's pagination total). */
  count: number;
  page: number;
  pageSize: number;
  sort: string | null;
  filter: string | null;
  status: string | null;
  /** Relay global id of the agent whose detail drawer is open. */
  currentAgentId: string | null;
}

export const agentRows = (
  agents: WebMCPAgentToolsFragment$data,
): Array<WebMCPRow> =>
  _.map(agents, (agent) =>
    webmcpRow({
      id: agent.id,
      agent_id: agent.row_id ?? null,
      endpoint: agent.addr ?? null,
      region: agent.region ?? null,
      architecture: agent.architecture ?? null,
      status: agent.status ?? null,
      resource_group: agent.scaling_group ?? null,
      schedulable: agent.schedulable ?? null,
      first_contact: agent.first_contact ?? null,
      occupied_slots: parseJsonColumn(agent.occupied_slots),
      available_slots: parseJsonColumn(agent.available_slots),
    }),
  );

export const createAgentTools = (
  visible: WebMCPVisibleRows,
  current: WebMCPCurrentItem,
  filter: WebMCPPageFilter,
): Array<WebMCPTool> => [
  createListVisibleTool('agent', LIST_DESCRIPTION, visible),
  createGetCurrentTool('agent', CURRENT_DESCRIPTION, current),
  createGetFilterTool('agent', FILTER_DESCRIPTION, filter),
];

/** Registers the agent tools for as long as the agent list is mounted. */
const WebMCPAgentTools: React.FC<WebMCPAgentToolsProps> = ({
  agentsFrgmt,
  count,
  page,
  pageSize,
  sort,
  filter,
  status,
  currentAgentId,
}) => {
  'use memo';
  const agents = useFragment(
    graphql`
      fragment WebMCPAgentToolsFragment on AgentNode @relay(plural: true) {
        id
        row_id
        addr
        region
        architecture
        status
        scaling_group
        schedulable
        first_contact
        occupied_slots
        available_slots
      }
    `,
    agentsFrgmt,
  );

  const rows = agentRows(agents);
  const [listTool, currentTool, filterTool] = createAgentTools(
    { rows, count, page, pageSize, sort },
    { current: findRowById(rows, currentAgentId), webui_path: null },
    { filter, status, tab: 'agents', current: page, pageSize },
  );

  useWebMCPTool(listTool, [agents, count, page, pageSize, sort]);
  useWebMCPTool(currentTool, [agents, currentAgentId]);
  useWebMCPTool(filterTool, [filter, status, page, pageSize]);

  return null;
};

export default WebMCPAgentTools;
