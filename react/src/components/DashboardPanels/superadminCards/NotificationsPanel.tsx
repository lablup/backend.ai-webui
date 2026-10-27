/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  NotificationsPanelQuery,
  NotificationsPanelQuery$data,
} from '../../../__generated__/NotificationsPanelQuery.graphql';
import ScopedCard from '../cards/ScopedCard';
import StatRow from '../charts/StatRow';
import type { PanelComponentProps } from '../types';
import { Token } from '@lablup/ui-common/Token';
import {
  BAIBooleanToken,
  BAIFlex,
  BAITable,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type RuleRow = NonNullable<
  NonNullable<
    NonNullable<NotificationsPanelQuery$data['rules']>['edges'][number]
  >['node']
>;

const NotificationSummary: React.FC<{ fetchKey: string }> = ({ fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const data = useLazyLoadQuery<NotificationsPanelQuery>(
    graphql`
      query NotificationsPanelQuery {
        enabledRules: adminNotificationRules(
          filter: { enabled: true }
          limit: 1
        ) {
          count
        }
        channels: adminNotificationChannels(limit: 1) {
          count
        }
        enabledChannels: adminNotificationChannels(
          filter: { enabled: true }
          limit: 1
        ) {
          count
        }
        rules: adminNotificationRules(
          orderBy: [{ field: NAME, direction: ASC }]
          limit: 20
        ) {
          count
          edges {
            node {
              id
              name
              ruleType
              enabled
              channel {
                name
              }
            }
          }
        }
      }
    `,
    {},
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <StatRow
        items={[
          {
            key: 'rules',
            label: t('dashboard.card.NotificationRules'),
            value: String(data.rules?.count ?? 0),
            description: t('dashboard.card.EnabledCount', {
              count: data.enabledRules?.count ?? 0,
            }),
          },
          {
            key: 'channels',
            label: t('dashboard.card.NotificationChannels'),
            value: String(data.channels?.count ?? 0),
            description: t('dashboard.card.EnabledCount', {
              count: data.enabledChannels?.count ?? 0,
            }),
          },
        ]}
      />
      <BAITable<RuleRow>
        size="small"
        rowKey="id"
        dataSource={filterOutNullAndUndefined(
          data.rules?.edges.map((edge) => edge?.node),
        )}
        scroll={{ x: 'max-content' }}
        columns={[
          {
            key: 'name',
            title: t('dashboard.card.NotificationRules'),
            render: (_value, row) => row.name,
          },
          {
            key: 'ruleType',
            title: t('registry.Type'),
            render: (_value, row) => <Token label={row.ruleType} />,
          },
          {
            key: 'channel',
            title: t('dashboard.card.NotificationChannels'),
            render: (_value, row) => row.channel.name,
          },
          {
            key: 'enabled',
            title: t('general.Enabled'),
            render: (_value, row) => <BAIBooleanToken value={row.enabled} />,
          },
        ]}
        pagination={{ pageSize: 5, showSizeChanger: false }}
      />
    </BAIFlex>
  );
};

/** The cluster's notification rules and channels, and which are enabled. */
const NotificationsPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const heading = { title: t('dashboard.card.Notifications') };
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{ project: heading, domain: heading }}
    >
      {(_cardScope, key) => <NotificationSummary fetchKey={key} />}
    </ScopedCard>
  );
};

export default NotificationsPanel;
