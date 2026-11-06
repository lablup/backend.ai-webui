/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  AuditLogFilter,
  AuditLogScope,
  FailuresByEntityTypePanelQuery,
} from '../../../__generated__/FailuresByEntityTypePanelQuery.graphql';
import { rbacTypeLabel } from '../../../helper/rbacElementTypes';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import {
  AuditLogRows,
  DomainAuditScope,
  ScopedAuditLogList,
} from '../cards/AuditLogPanel';
import ScopedCard from '../cards/ScopedCard';
import DonutChart from '../charts/DonutChart';
import PeriodCaption from '../charts/PeriodCaption';
import { readCounts } from '../countAliases';
import { toDonutRows } from '../memberCards/memberCardData';
import { projectAuditScope } from '../projectAdminCards/projectCardData';
import type { DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import {
  AUDIT_ENTITY_TYPES,
  ENTITY_TYPE_ALIASES,
  type AuditEntityType,
  entityTypeFailureFilters,
} from './superadminCardData';
import {
  BAIFlex,
  BAIModal,
  BAISkeleton,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

/** One entity type's failed audit entries in the card's window, a page at a time. */
const FailedEntries: React.FC<{
  scope: AuditLogScope;
  filter: AuditLogFilter;
  fetchKey: string;
}> = ({ scope, filter, fetchKey }) => {
  'use memo';
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 10 });
  const variables = {
    filter,
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferred = useDeferredValue(variables);
  return (
    <ScopedAuditLogList scope={scope} variables={deferred} fetchKey={fetchKey}>
      {(data) => (
        <AuditLogRows
          data={data}
          hideTriggeredBy={false}
          copyableDescription
          loading={deferred !== variables}
          current={tablePaginationOption.current}
          pageSize={tablePaginationOption.pageSize}
          onChangePage={(current, pageSize) =>
            setTablePaginationOption({ current, pageSize })
          }
        />
      )}
    </ScopedAuditLogList>
  );
};

// TODO(needs-backend): BA-8746 - a failure count grouped by entity type would replace
// the per-type aliases below.
const EntityTypeFailures: React.FC<{
  scope: AuditLogScope;
  timeRange: DateTimeWindow;
  fetchKey: string;
}> = ({ scope, timeRange, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const deferred = useDeferredValue({
    timeRange,
    variables: { scope, ...entityTypeFailureFilters(timeRange) },
  });
  const variables = deferred.variables;
  // The legend row whose failed entries are listed, with its label.
  const [listed, setListed] = useState<{ key: string; label: string } | null>(
    null,
  );
  const [isListOpen, setIsListOpen] = useState(false);
  const data = useLazyLoadQuery<FailuresByEntityTypePanelQuery>(
    graphql`
      query FailuresByEntityTypePanelQuery(
        $scope: AuditLogScope!
        $session: AuditLogFilter!
        $vfolder: AuditLogFilter!
        $deployment: AuditLogFilter!
        $user: AuditLogFilter!
        $project: AuditLogFilter!
        $resourceGroup: AuditLogFilter!
        $artifactRegistry: AuditLogFilter!
        $other: AuditLogFilter!
      ) {
        session: scopedAuditLogsV2(scope: $scope, filter: $session, limit: 1)
          @catch(to: RESULT) {
          count
        }
        vfolder: scopedAuditLogsV2(scope: $scope, filter: $vfolder, limit: 1)
          @catch(to: RESULT) {
          count
        }
        deployment: scopedAuditLogsV2(
          scope: $scope
          filter: $deployment
          limit: 1
        ) @catch(to: RESULT) {
          count
        }
        user: scopedAuditLogsV2(scope: $scope, filter: $user, limit: 1)
          @catch(to: RESULT) {
          count
        }
        project: scopedAuditLogsV2(scope: $scope, filter: $project, limit: 1)
          @catch(to: RESULT) {
          count
        }
        resourceGroup: scopedAuditLogsV2(
          scope: $scope
          filter: $resourceGroup
          limit: 1
        ) @catch(to: RESULT) {
          count
        }
        artifactRegistry: scopedAuditLogsV2(
          scope: $scope
          filter: $artifactRegistry
          limit: 1
        ) @catch(to: RESULT) {
          count
        }
        other: scopedAuditLogsV2(scope: $scope, filter: $other, limit: 1)
          @catch(to: RESULT) {
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
  const rows = toDonutRows([
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
  ]);
  return (
    <BAIFlex direction="column" align="stretch" gap="xs" style={{ flex: 1 }}>
      <PeriodCaption window={deferred.timeRange} />
      <DonutChart
        label={t('dashboard.card.FailuresByEntityType')}
        emptyText={t('dashboard.card.NoFailures')}
        columnLabels={{
          name: t('dashboard.card.EntityType'),
          value: t('dashboard.card.Failed'),
          percent: t('dashboard.card.Share'),
        }}
        rows={rows}
        onRowClick={(key) => {
          const row = rows.find((item) => item.key === key);
          if (!row) return;
          setListed({ key, label: row.label });
          setIsListOpen(true);
        }}
      />
      <BAIUnmountAfterClose>
        <BAIModal
          open={isListOpen}
          title={t('dashboard.card.FailuresOfType', {
            type: listed?.label ?? '',
          })}
          width={1400}
          footer={null}
          onCancel={() => setIsListOpen(false)}
        >
          {listed ? (
            <Suspense fallback={<BAISkeleton />}>
              <FailedEntries
                scope={scope}
                filter={
                  variables[
                    listed.key === 'other'
                      ? 'other'
                      : ENTITY_TYPE_ALIASES[listed.key as AuditEntityType]
                  ]
                }
                fetchKey={fetchKey}
              />
            </Suspense>
          ) : null}
        </BAIModal>
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

/** Audit log entries of the page's project or domain that ended in an error or were denied, per entity type. */
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
      {(cardScope, key) =>
        cardScope.kind === 'domain' ? (
          <Suspense fallback={<BAISkeleton />}>
            <DomainAuditScope scope={cardScope} fetchKey={key}>
              {(scope) => (
                <EntityTypeFailures
                  scope={scope}
                  timeRange={vars.timeRange}
                  fetchKey={key}
                />
              )}
            </DomainAuditScope>
          </Suspense>
        ) : cardScope.kind === 'project' ? (
          <EntityTypeFailures
            scope={projectAuditScope(cardScope.projectId)}
            timeRange={vars.timeRange}
            fetchKey={key}
          />
        ) : null
      }
    </ScopedCard>
  );
};

export default FailuresByEntityTypePanel;
