/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { MemberAgentStatsPanelQuery } from '../../../__generated__/MemberAgentStatsPanelQuery.graphql';
import { AgentStatsView, type AgentSlotTotals } from '../../AgentStats';
import { useDashboardResourceGroups } from '../DashboardResourceGroups';
import { countText } from '../countAliases';
import { PanelPermissionBoundary } from '../panelPermission';
import type { PanelComponentProps } from '../types';
import { BAIBoardItemErrorBoundary, BAISkeleton } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

// One page holds every agent a user can see; the list has no aggregate field for them.
const AGENT_LIMIT = 1000;

/** The same exclusion the Agent Summary page applies, so SFTP-only nodes stay out. */
export const sftpExclusionFilter = (sftpGroups: ReadonlyArray<string>) =>
  sftpGroups.length > 0
    ? `!(scaling_group in [${sftpGroups.map((group) => JSON.stringify(group)).join(', ')}])`
    : null;

const sumSlots = (
  slots: ReadonlyArray<string | null | undefined>,
): Record<string, number> => {
  const totals: Record<string, number> = {};
  for (const raw of slots) {
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    for (const [key, value] of Object.entries(parsed)) {
      totals[key] = (totals[key] ?? 0) + (Number(value) || 0);
    }
  }
  return totals;
};

/** Sums the alive agents' slots, as the Agent Summary page lists them. */
export const agentSlotTotals = (
  items: ReadonlyArray<{
    available_slots?: string | null;
    occupied_slots?: string | null;
  }>,
): AgentSlotTotals => {
  const capacity = sumSlots(items.map((item) => item.available_slots));
  const used = sumSlots(items.map((item) => item.occupied_slots));
  const free = _.mapValues(capacity, (total, key) =>
    Math.max(total - (used[key] ?? 0), 0),
  );
  return { capacity, used, free };
};

const MemberAgentStats: React.FC<{ fetchKey: string }> = ({ fetchKey }) => {
  'use memo';
  const allowed = useDashboardResourceGroups();
  const sftpGroups = allowed?.filter?.name?.notIn ?? [];
  // TODO(needs-backend): #11077 agentsV2 is superadmin-only, and this card serves every role.
  const data = useLazyLoadQuery<MemberAgentStatsPanelQuery>(
    graphql`
      query MemberAgentStatsPanelQuery($limit: Int!, $filter: String) {
        agent_summary_list(
          limit: $limit
          offset: 0
          status: "ALIVE"
          filter: $filter
        ) {
          items {
            schedulable
            available_slots
            occupied_slots
          }
          total_count
        }
      }
    `,
    { limit: AGENT_LIMIT, filter: sftpExclusionFilter(sftpGroups) },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const items = _.compact(data.agent_summary_list?.items);
  return (
    <AgentStatsView
      totalResource={data.agent_summary_list ? agentSlotTotals(items) : null}
      schedulableText={countText(
        items.filter((item) => item.schedulable).length,
      )}
      aliveText={countText(data.agent_summary_list?.total_count ?? null)}
    />
  );
};

/** Agent totals over the nodes a user may see, without the SFTP-only ones. */
const MemberAgentStatsPanel: React.FC<PanelComponentProps> = ({ fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAIBoardItemErrorBoundary
      title={t('agentStats.AgentStats')}
      status="error"
      resetKeys={[fetchKey]}
    >
      <PanelPermissionBoundary resetKeys={[fetchKey]}>
        <Suspense fallback={<BAISkeleton />}>
          <MemberAgentStats fetchKey={fetchKey} />
        </Suspense>
      </PanelPermissionBoundary>
    </BAIBoardItemErrorBoundary>
  );
};

export default MemberAgentStatsPanel;
