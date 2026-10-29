/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  FailedLoginsPanelQuery,
  LoginHistoryFilter,
} from '../../../__generated__/FailedLoginsPanelQuery.graphql';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import ScopedCard from '../cards/ScopedCard';
import StatRow from '../charts/StatRow';
import { countDelta, failureSentiment, previousWindow } from '../countAliases';
import { withinWindow, type DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import { LOGIN_FAILURE_RESULTS } from './superadminCardData';
import {
  BAIFlex,
  BAILoginHistoryTable,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const failedLoginFilter = (
  domainName: string,
  window: DateTimeWindow,
): LoginHistoryFilter => ({
  ...withinWindow('createdAt', window),
  domainName: { equals: domainName },
  result: { in: [...LOGIN_FAILURE_RESULTS] },
});

const FailedLogins: React.FC<{
  domainName: string;
  timeRange: DateTimeWindow;
  fetchKey: string;
}> = ({ domainName, timeRange, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 5 });
  const variables: FailedLoginsPanelQuery['variables'] = {
    failed: failedLoginFilter(domainName, timeRange),
    previousFailed: failedLoginFilter(domainName, previousWindow(timeRange)),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<FailedLoginsPanelQuery>(
    graphql`
      query FailedLoginsPanelQuery(
        $failed: LoginHistoryFilter!
        $previousFailed: LoginHistoryFilter!
        $limit: Int!
        $offset: Int!
      ) {
        previousFailed: adminLoginHistoryV2(filter: $previousFailed, limit: 1) {
          count
        }
        failedLogins: adminLoginHistoryV2(
          filter: $failed
          orderBy: [{ field: CREATED_AT, direction: DESC }]
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              user {
                basicInfo {
                  email
                }
              }
              ...BAILoginHistoryTableFragment
            }
          }
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const failed = data.failedLogins?.count ?? 0;
  const logins = filterOutNullAndUndefined(
    data.failedLogins?.edges.map((edge) => edge?.node),
  );
  const emails = new Map(
    logins.map((login) => [login.id, login.user?.basicInfo.email]),
  );
  const delta = countDelta(failed, data.previousFailed?.count ?? 0, timeRange);

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <StatRow
        items={[
          {
            key: 'failedLogins',
            label: t('dashboard.card.FailedLogins'),
            value: String(failed),
            description: t('dashboard.card.VsPreviousRange'),
            delta: { ...delta, sentiment: failureSentiment(delta) },
          },
        ]}
      />
      <BAILoginHistoryTable
        loginHistoryFrgmt={logins}
        disableSorter
        resizable={false}
        loading={deferredVariables !== variables}
        customizeColumns={(columns) => {
          // `result` is pinned left on the login history page; here it sits mid-row.
          const pick = (key: string) => {
            const column = columns.find((c) => c.key === key);
            return column && { ...column, fixed: undefined };
          };
          return filterOutNullAndUndefined([
            pick('createdAt'),
            {
              key: 'user',
              title: t('credential.UserID'),
              render: (_value: unknown, login: { id: string }) =>
                emails.get(login.id) ?? '-',
            },
            pick('result'),
            pick('clientIp'),
          ]);
        }}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: failed,
          onChange: (current, pageSize) =>
            setTablePaginationOption({ current, pageSize }),
        }}
      />
    </BAIFlex>
  );
};

/** The domain's failed sign-ins in the card's range, against the previous range. */
const FailedLoginsPanel: React.FC<PanelComponentProps> = ({
  scope,
  vars,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const heading = {
    title: t('dashboard.card.FailedLogins'),
    tooltip: t('dashboard.card.FailedLoginsTooltip'),
  };
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{ project: heading, domain: heading }}
    >
      {(cardScope, key) =>
        cardScope.kind === 'domain' ? (
          <FailedLogins
            domainName={cardScope.domainName}
            timeRange={vars.timeRange}
            fetchKey={key}
          />
        ) : null
      }
    </ScopedCard>
  );
};

export default FailedLoginsPanel;
