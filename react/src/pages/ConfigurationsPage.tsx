/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ConfigurationsSettingList from '../components/ConfigurationsSettingList';
import { Card, Skeleton } from 'antd';
import { filterOutEmpty } from 'backend.ai-ui';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'configurations';

const tabParam = withDefault(StringParam, 'configurations');

const ConfigurationsPage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);

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
