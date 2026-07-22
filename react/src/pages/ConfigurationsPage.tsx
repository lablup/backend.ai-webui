/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import ConfigurationsSettingList from '../components/ConfigurationsSettingList';
import { Skeleton } from 'antd';
import { BAICard } from 'backend.ai-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const ConfigurationsPage = () => {
  'use memo';
  const { t } = useTranslation();
  const [curTabKey] = useQueryState(
    'tab',
    parseAsStringLiteral(['configurations']).withDefault('configurations'),
  );

  return (
    <BAICard
      activeTabKey={curTabKey}
      tabList={[
        {
          key: 'configurations',
          label: t('webui.menu.Configurations'),
        },
      ]}
    >
      <Suspense fallback={<Skeleton active />}>
        {curTabKey === 'configurations' && (
          <BAIErrorBoundary>
            <ConfigurationsSettingList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default ConfigurationsPage;
