/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  KeypairsLoginsPanelQuery,
  KeypairsLoginsPanelQuery$data,
  LoginHistoryFilter,
} from '../../../__generated__/KeypairsLoginsPanelQuery.graphql';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import ScopedCard from '../cards/ScopedCard';
import StatRow from '../charts/StatRow';
import { countDelta, failureSentiment, previousWindow } from '../countAliases';
import { withinWindow, type DateTimeWindow } from '../timeRange';
import type { PanelComponentProps } from '../types';
import { LOGIN_FAILURE_RESULTS } from './superadminCardData';
import { Token } from '@lablup/ui-common/Token';
import {
  BAIFlex,
  BAITable,
  filterOutNullAndUndefined,
  tokenColorForStatus,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type LoginRow = NonNullable<
  NonNullable<
    NonNullable<KeypairsLoginsPanelQuery$data['failedLogins']>['edges'][number]
  >['node']
>;

const failedLogins = (
  domainName: string,
  window: DateTimeWindow,
): LoginHistoryFilter => ({
  ...withinWindow('createdAt', window),
  domainName: { equals: domainName },
  result: { in: [...LOGIN_FAILURE_RESULTS] },
});

const KeypairsAndLogins: React.FC<{
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
  const variables: KeypairsLoginsPanelQuery['variables'] = {
    failed: failedLogins(domainName, timeRange),
    previousFailed: failedLogins(domainName, previousWindow(timeRange)),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<KeypairsLoginsPanelQuery>(
    graphql`
      query KeypairsLoginsPanelQuery(
        $failed: LoginHistoryFilter!
        $previousFailed: LoginHistoryFilter!
        $limit: Int!
        $offset: Int!
      ) {
        keypairs: adminKeypairsV2(limit: 1) {
          count
        }
        inactiveKeypairs: adminKeypairsV2(
          filter: { isActive: false }
          limit: 1
        ) {
          count
        }
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
              result
              clientIp
              createdAt
              user {
                basicInfo {
                  email
                }
              }
            }
          }
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const failed = data.failedLogins?.count ?? 0;
  const delta = countDelta(failed, data.previousFailed?.count ?? 0);

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <StatRow
        items={[
          {
            key: 'keypairs',
            label: t('dashboard.card.Keypairs'),
            value: String(data.keypairs?.count ?? 0),
          },
          {
            key: 'inactive',
            label: t('dashboard.card.InactiveKeypairs'),
            value: String(data.inactiveKeypairs?.count ?? 0),
          },
          {
            key: 'failedLogins',
            label: t('dashboard.card.FailedLogins'),
            value: String(failed),
            description: t('dashboard.card.VsPreviousRange'),
            delta: { ...delta, sentiment: failureSentiment(delta) },
          },
        ]}
      />
      <BAITable<LoginRow>
        size="small"
        rowKey="id"
        dataSource={filterOutNullAndUndefined(
          data.failedLogins?.edges.map((edge) => edge?.node),
        )}
        loading={deferredVariables !== variables}
        scroll={{ x: 'max-content' }}
        columns={[
          {
            key: 'createdAt',
            title: t('dashboard.card.Time'),
            render: (_value, row) => dayjs(row.createdAt).format('lll'),
          },
          {
            key: 'user',
            title: t('credential.UserID'),
            render: (_value, row) => row.user?.basicInfo.email ?? '-',
          },
          {
            key: 'result',
            title: t('dashboard.card.LoginResult'),
            render: (_value, row) => (
              <Token
                color={tokenColorForStatus('loginHistory', row.result)}
                label={row.result}
              />
            ),
          },
          {
            key: 'clientIp',
            title: t('dashboard.card.ClientIP'),
            render: (_value, row) => row.clientIp ?? '-',
          },
        ]}
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

/** Keypairs of the cluster, the inactive ones, and the domain's failed sign-ins in the card's range. */
const KeypairsLoginsPanel: React.FC<PanelComponentProps> = ({
  scope,
  vars,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const heading = {
    title: t('dashboard.card.KeypairsAndLogins'),
    tooltip: t('dashboard.card.KeypairsAndLoginsTooltip'),
  };
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{ project: heading, domain: heading }}
    >
      {(cardScope, key) =>
        cardScope.kind === 'domain' ? (
          <KeypairsAndLogins
            domainName={cardScope.domainName}
            timeRange={vars.timeRange}
            fetchKey={key}
          />
        ) : null
      }
    </ScopedCard>
  );
};

export default KeypairsLoginsPanel;
