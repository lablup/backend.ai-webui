/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../../components/BAIErrorBoundary';
import { useTabQuerySnapshot } from '../../hooks';
import NotificationChannelList from './components/NotificationChannelList';
import NotificationRuleList from './components/NotificationRuleList';
import { BAICard, BAISkeleton } from 'backend.ai-ui';
import { parseAsStringLiteral } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const tabParser = parseAsStringLiteral(['rules', 'channels']).withDefault(
  'rules',
);

const AdminNotificationPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);

  return (
    <BAICard
      activeTabKey={currentTab}
      onTabChange={onTabChange}
      tabList={[
        { key: 'rules', label: t('externalNotification.NotificationRules') },
        {
          key: 'channels',
          label: t('externalNotification.NotificationChannels'),
          tooltip: t('externalNotification.ChannelsDescription'),
        },
      ]}
    >
      <Suspense fallback={<BAISkeleton />}>
        {currentTab === 'rules' && (
          <BAIErrorBoundary>
            <NotificationRuleList />
          </BAIErrorBoundary>
        )}
        {currentTab === 'channels' && (
          <BAIErrorBoundary>
            <NotificationChannelList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default AdminNotificationPage;
