/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { FailuresByEntityTypePanelQuery } from '../../../__generated__/FailuresByEntityTypePanelQuery.graphql';
import { rbacTypeLabel } from '../../../helper/rbacElementTypes';
import ScopedCard from '../cards/ScopedCard';
import DonutChart from '../charts/DonutChart';
import PeriodCaption from '../charts/PeriodCaption';
import { readCounts } from '../countAliases';
import { toDonutRows } from '../memberCards/memberCardData';
import type { DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import {
  AUDIT_ENTITY_TYPES,
  ENTITY_TYPE_ALIASES,
  entityTypeFailureFilters,
} from './superadminCardData';
import { BAIFlex } from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

// TODO(needs-backend): BA-8746 - a failure count grouped by entity type would replace
// the per-type aliases below.
const EntityTypeFailures: React.FC<{
  timeRange: DateTimeWindow;
  fetchKey: string;
}> = ({ timeRange, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const deferred = useDeferredValue({
    timeRange,
    variables: entityTypeFailureFilters(timeRange),
  });
  const variables = deferred.variables;
  const data = useLazyLoadQuery<FailuresByEntityTypePanelQuery>(
    graphql`
      query FailuresByEntityTypePanelQuery(
        $session: AuditLogFilter!
        $vfolder: AuditLogFilter!
        $deployment: AuditLogFilter!
        $user: AuditLogFilter!
        $project: AuditLogFilter!
        $resourceGroup: AuditLogFilter!
        $artifactRegistry: AuditLogFilter!
        $other: AuditLogFilter!
      ) {
        session: adminAuditLogsV2(filter: $session, limit: 1)
          @catch(to: RESULT) {
          count
        }
        vfolder: adminAuditLogsV2(filter: $vfolder, limit: 1)
          @catch(to: RESULT) {
          count
        }
        deployment: adminAuditLogsV2(filter: $deployment, limit: 1)
          @catch(to: RESULT) {
          count
        }
        user: adminAuditLogsV2(filter: $user, limit: 1) @catch(to: RESULT) {
          count
        }
        project: adminAuditLogsV2(filter: $project, limit: 1)
          @catch(to: RESULT) {
          count
        }
        resourceGroup: adminAuditLogsV2(filter: $resourceGroup, limit: 1)
          @catch(to: RESULT) {
          count
        }
        artifactRegistry: adminAuditLogsV2(filter: $artifactRegistry, limit: 1)
          @catch(to: RESULT) {
          count
        }
        other: adminAuditLogsV2(filter: $other, limit: 1) @catch(to: RESULT) {
          count
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const counts = readCounts(data, [
    ...AUDIT_ENTITY_TYPES.map((type) => ENTITY_TYPE_ALIASES[type]),
    'other',
  ]);
  return (
    <BAIFlex direction="column" align="stretch" gap="xs" style={{ flex: 1 }}>
      <DonutChart
        label={t('dashboard.card.FailuresByEntityType')}
        emptyText={t('dashboard.card.NoFailures')}
        columnLabels={{
          name: t('dashboard.card.EntityType'),
          value: t('dashboard.card.Failed'),
          percent: t('dashboard.card.Share'),
        }}
        rows={toDonutRows([
          ...AUDIT_ENTITY_TYPES.map((type) => ({
            key: type,
            label: rbacTypeLabel(t, type),
            count: counts[ENTITY_TYPE_ALIASES[type]],
          })),
          {
            key: 'other',
            label: t('dashboard.card.OtherTypes'),
            count: counts.other,
          },
        ])}
      />
      <PeriodCaption window={deferred.timeRange} />
    </BAIFlex>
  );
};

/** Audit log entries of the whole cluster (not the domain, ADR 0019) that ended in an error or were denied, per entity type. */
const FailuresByEntityTypePanel: React.FC<PanelComponentProps> = ({
  scope,
  vars,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const heading = {
    title: t('dashboard.card.FailuresByEntityType'),
    tooltip: t('dashboard.card.FailuresByEntityTypeTooltip'),
  };
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{ project: heading, domain: heading }}
    >
      {(_cardScope, key) => (
        <EntityTypeFailures timeRange={vars.timeRange} fetchKey={key} />
      )}
    </ScopedCard>
  );
};

export default FailuresByEntityTypePanel;
