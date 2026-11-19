/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  AuditLogScope,
  TopFailureCausesPanelQuery,
} from '../../../__generated__/TopFailureCausesPanelQuery.graphql';
import { DomainAuditScope, isClusterAuditScope } from '../cards/AuditLogPanel';
import ScopedCard from '../cards/ScopedCard';
import { readPrimary } from '../panelPermission';
import { projectAuditScope } from '../projectAdminCards/projectCardData';
import type { DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import { FailedEntries } from './FailuresByEntityTypePanel';
import {
  FAILURE_CAUSE_SAMPLE_SIZE,
  type FailureCause,
  failuresWithin,
  groupFailureCauses,
} from './superadminCardData';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  BAILink,
  BAIModal,
  BAISkeleton,
  BAITable,
  BAIText,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
  useAuditLogActionLabel,
} from 'backend.ai-ui';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

/** The causes the card lists; the rest are in the sampled total. */
const MAX_CAUSES = 10;

// TODO(needs-backend): #11284 - a failure count grouped by cause would replace the client-side grouping.
const FailureCauses: React.FC<{
  scope: AuditLogScope;
  timeRange: DateTimeWindow;
  fetchKey: string;
}> = ({ scope, timeRange, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const actionLabel = useAuditLogActionLabel();
  const filter = failuresWithin(timeRange);
  const variables = { scope, filter, limit: FAILURE_CAUSE_SAMPLE_SIZE };
  const deferredVariables = useDeferredValue(variables);
  const [listed, setListed] = useState<FailureCause | null>(null);
  const [isListOpen, setIsListOpen] = useState(false);
  const data = useLazyLoadQuery<TopFailureCausesPanelQuery>(
    isClusterAuditScope(scope)
      ? graphql`
          query TopFailureCausesPanelClusterQuery(
            $filter: AuditLogFilter!
            $limit: Int!
          ) {
            failures: adminAuditLogsV2(
              filter: $filter
              orderBy: [{ field: CREATED_AT, direction: DESC }]
              limit: $limit
            ) @catch(to: RESULT) {
              count
              edges {
                node {
                  actionName
                  description
                }
              }
            }
          }
        `
      : graphql`
          query TopFailureCausesPanelQuery(
            $scope: AuditLogScope!
            $filter: AuditLogFilter!
            $limit: Int!
          ) {
            failures: scopedAuditLogsV2(
              scope: $scope
              filter: $filter
              orderBy: [{ field: CREATED_AT, direction: DESC }]
              limit: $limit
            ) @catch(to: RESULT) {
              count
              edges {
                node {
                  actionName
                  description
                }
              }
            }
          }
        `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const failures = readPrimary(data.failures);
  // A failed read must not look like a range with no failures.
  if (!failures) throw new Error('Could not read the failed audit log entries');
  const entries = filterOutNullAndUndefined(
    failures?.edges.map((edge) => edge?.node),
  );
  const causes = groupFailureCauses(entries).slice(0, MAX_CAUSES);
  const total = failures?.count ?? 0;

  return (
    <BAIFlex direction="column" align="stretch" gap="xs" style={{ flex: 1 }}>
      {total > entries.length ? (
        <Text type="supporting">
          {t('dashboard.card.FailureCausesSampled', {
            sampled: entries.length,
            total,
          })}
        </Text>
      ) : null}
      <BAITable<FailureCause>
        size="small"
        rowKey="key"
        dataSource={causes}
        loading={deferredVariables !== variables}
        pagination={false}
        locale={{ emptyText: t('dashboard.card.NoFailures') }}
        columns={[
          {
            key: 'actionName',
            title: t('dashboard.card.Action'),
            render: (_value, cause) => (
              <BAILink
                type="hover"
                onClick={() => {
                  setListed(cause);
                  setIsListOpen(true);
                }}
              >
                {actionLabel(cause.actionName)}
              </BAILink>
            ),
          },
          {
            key: 'message',
            title: t('dashboard.card.Reason'),
            // Takes the width left over, so the message ellipsizes only when the card is narrow.
            onCell: () => ({ style: { maxWidth: 0, width: '100%' } }),
            render: (_value, cause) => (
              <BAIText ellipsis={{ tooltip: cause.message }}>
                {cause.message || '-'}
              </BAIText>
            ),
          },
          {
            key: 'count',
            title: t('dashboard.card.Count'),
            align: 'right',
            render: (_value, cause) => cause.count,
          },
          {
            key: 'percent',
            title: t('dashboard.card.Share'),
            align: 'right',
            render: (_value, cause) => `${cause.percent}%`,
          },
        ]}
      />
      <BAIUnmountAfterClose>
        <BAIModal
          open={isListOpen}
          title={t('dashboard.card.FailuresOfAction', {
            action: actionLabel(listed?.actionName),
          })}
          width={1400}
          footer={null}
          onCancel={() => setIsListOpen(false)}
        >
          {listed ? (
            <Suspense fallback={<BAISkeleton />}>
              <FailedEntries
                scope={scope}
                filter={{
                  ...filter,
                  actionName: { equals: listed.actionName },
                }}
                fetchKey={fetchKey}
              />
            </Suspense>
          ) : null}
        </BAIModal>
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

/** The page's failed audit log entries in the card's range, grouped by action and message. */
const TopFailureCausesPanel: React.FC<PanelComponentProps> = ({
  scope,
  vars,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const heading = {
    title: t('dashboard.card.TopFailureCauses'),
    tooltip: t('dashboard.card.TopFailureCausesTooltip'),
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
                <FailureCauses
                  scope={scope}
                  timeRange={vars.timeRange}
                  fetchKey={key}
                />
              )}
            </DomainAuditScope>
          </Suspense>
        ) : cardScope.kind === 'project' ? (
          <FailureCauses
            scope={projectAuditScope(cardScope.projectId)}
            timeRange={vars.timeRange}
            fetchKey={key}
          />
        ) : null
      }
    </ScopedCard>
  );
};

export default TopFailureCausesPanel;
