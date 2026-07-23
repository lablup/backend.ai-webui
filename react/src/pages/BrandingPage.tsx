/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import BrandingSettingList from '../components/BrandingSettingList';
import { Skeleton } from 'antd';
import { BAICard } from 'backend.ai-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const BrandingPage: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const [curTabKey] = useQueryState(
    'tab',
    parseAsStringLiteral(['branding']).withDefault('branding'),
  );

  return (
    <BAICard
      activeTabKey={curTabKey}
      tabList={[
        {
          key: 'branding',
          label: t('webui.menu.Branding'),
        },
      ]}
    >
      <Suspense fallback={<Skeleton active />}>
        {curTabKey === 'branding' && (
          <BAIErrorBoundary>
            <BrandingSettingList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default BrandingPage;
