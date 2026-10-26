/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { MyActivityPanelQuery } from '../../../__generated__/MyActivityPanelQuery.graphql';
import { useSuspendedBackendaiClient } from '../../../hooks';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import type { DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import MemberCard from './MemberCard';
import {
  AUDIT_FAILURE_STATUSES,
  FAILURES_ONLY_FILTER,
  isFailuresOnlyFilter,
  withinWindow,
} from './memberCardData';
import { Switch } from '@lablup/ui-common/Switch';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIAuditLogNodes,
  BAIFlex,
  BAILink,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const VISIBLE_COLUMNS = new Set([
  'createdAt',
  'operation',
  'entityType',
  'status',
  'description',
]);

const MyActivityTable: React.FC<{
  userId: string;
  timeRange: DateTimeWindow;
  failuresOnly: boolean;
  fetchKey: string;
  onShowFailures: () => void;
}> = ({ userId, timeRange, failuresOnly, fetchKey, onShowFailures }) => {
  'use memo';
  const { t } = useTranslation();
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 5 });
  const createdAt = withinWindow('createdAt', timeRange);
  const variables = {
    scope: { triggeredUser: [{ value: userId }] },
    filter: { ...createdAt, ...(failuresOnly ? FAILURES_ONLY_FILTER : {}) },
    failureFilter: {
      ...createdAt,
      status: { in: [...AUDIT_FAILURE_STATUSES] },
    },
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<MyActivityPanelQuery>(
    graphql`
      query MyActivityPanelQuery(
        $scope: AuditLogScope!
        $filter: AuditLogFilter!
        $failureFilter: AuditLogFilter!
        $limit: Int!
        $offset: Int!
      ) {
        logs: scopedAuditLogsV2(
          scope: $scope
          filter: $filter
          orderBy: [{ field: CREATED_AT, direction: DESC }]
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              ...BAIAuditLogNodesFragment
            }
          }
        }
        failures: scopedAuditLogsV2(
          scope: $scope
          filter: $failureFilter
          limit: 1
        ) {
          count
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const failureCount = data.failures?.count ?? 0;

  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      {!failuresOnly && failureCount > 0 ? (
        <Text type="supporting">
          <BAILink onClick={onShowFailures}>
            {t('dashboard.card.FailuresInRange', { count: failureCount })}
          </BAILink>
        </Text>
      ) : null}
      <BAIAuditLogNodes
        auditLogFrgmt={filterOutNullAndUndefined(
          data.logs?.edges.map((edge) => edge?.node),
        )}
        disableSorter
        loading={deferredVariables !== variables}
        customizeColumns={(columns) =>
          columns
            .filter((column) => VISIBLE_COLUMNS.has(String(column.key)))
            .map((column) => ({ ...column, defaultHidden: false }))
        }
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: data.logs?.count ?? 0,
          onChange: (current, pageSize) =>
            setTablePaginationOption({ current, pageSize }),
        }}
      />
    </BAIFlex>
  );
};

/** The audit log of the viewer's own actions in the range; "failures only" is saved on the board. */
const MyActivityPanel: React.FC<PanelComponentProps> = ({
  panel,
  vars,
  fetchKey,
  onChangeFilter,
}) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const failuresOnly = isFailuresOnlyFilter(panel.filter);
  const setFailuresOnly = (next: boolean) =>
    onChangeFilter?.(next ? FAILURES_ONLY_FILTER : null);

  return (
    <MemberCard
      title={t('dashboard.card.MyActivity')}
      tooltip={t('dashboard.card.MyActivityTooltip')}
      fetchKey={fetchKey}
      extra={
        <Switch
          size="sm"
          value={failuresOnly}
          onChange={(checked) => setFailuresOnly(checked)}
          disabled={!onChangeFilter}
        >
          {t('dashboard.card.FailuresOnly')}
        </Switch>
      }
    >
      {(key) => (
        <MyActivityTable
          // A new filter starts on the first page.
          key={String(failuresOnly)}
          userId={baiClient.user_uuid}
          timeRange={vars.timeRange}
          failuresOnly={failuresOnly}
          fetchKey={key}
          onShowFailures={() => setFailuresOnly(true)}
        />
      )}
    </MemberCard>
  );
};

export default MyActivityPanel;
