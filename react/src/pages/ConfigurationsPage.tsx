/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import ConfigurationsSettingList from '../components/ConfigurationsSettingList';
import { Card, Skeleton } from 'antd';
import { filterOutEmpty } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

type TabKey = 'configurations';

const tabParam = parseAsString.withDefault('configurations');

const ConfigurationsPage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryState('tab', tabParam);

  return (
    <Card
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={filterOutEmpty([
        {
          key: 'configurations',
          tab: t('webui.menu.Configurations'),
        },
      ])}
    >
      <Suspense fallback={<Skeleton active />}>
        {curTabKey === 'configurations' && (
          <BAIErrorBoundary>
            <ConfigurationsSettingList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </Card>
  );
};

export default ConfigurationsPage;
