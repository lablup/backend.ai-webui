/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { FailuresByEntityTypePanelQuery } from '../../../__generated__/FailuresByEntityTypePanelQuery.graphql';
import ScopedCard from '../cards/ScopedCard';
import DonutChart from '../charts/DonutChart';
import { toDonutRows } from '../memberCards/memberCardData';
import type { DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import {
  AUDIT_ENTITY_TYPES,
  ENTITY_TYPE_ALIASES,
  entityTypeFailureFilters,
} from './superadminCardData';
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
  const variables = useDeferredValue(entityTypeFailureFilters(timeRange));
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
        session: adminAuditLogsV2(filter: $session, limit: 1) @catch(to: NULL) {
          count
        }
        vfolder: adminAuditLogsV2(filter: $vfolder, limit: 1) @catch(to: NULL) {
          count
        }
        deployment: adminAuditLogsV2(filter: $deployment, limit: 1)
          @catch(to: NULL) {
          count
        }
        user: adminAuditLogsV2(filter: $user, limit: 1) @catch(to: NULL) {
          count
        }
        project: adminAuditLogsV2(filter: $project, limit: 1) @catch(to: NULL) {
          count
        }
        resourceGroup: adminAuditLogsV2(filter: $resourceGroup, limit: 1)
          @catch(to: NULL) {
          count
        }
        artifactRegistry: adminAuditLogsV2(filter: $artifactRegistry, limit: 1)
          @catch(to: NULL) {
          count
        }
        other: adminAuditLogsV2(filter: $other, limit: 1) @catch(to: NULL) {
          count
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return (
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
          label: type,
          count: data[ENTITY_TYPE_ALIASES[type]]?.count,
        })),
        {
          key: 'other',
          label: t('dashboard.card.OtherTypes'),
          count: data.other?.count,
        },
      ])}
    />
  );
};

/** Audit log entries of the whole cluster (not the domain, ADR 0018) that ended in an error or were denied, per entity type. */
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
