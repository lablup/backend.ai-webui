/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import CustomizedImageList from '../components/CustomizedImageList';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import { BAICard } from 'backend.ai-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const MyEnvironmentPage = () => {
  'use memo';
  const { t } = useTranslation();
  const [curTabKey] = useQueryState(
    'tab',
    parseAsStringLiteral(['image']).withDefault('image'),
  );

  return (
    <BAICard
      activeTabKey={curTabKey}
      tabList={[
        {
          key: 'image',
          label: t('environment.Images'),
        },
      ]}
    >
      <Suspense
        fallback={
          <FlexActivityIndicator
            style={{ height: 'calc(100vh - 145px)' }}
            spinSize="large"
          />
        }
      >
        {curTabKey === 'image' && <CustomizedImageList />}
      </Suspense>
    </BAICard>
  );
};

export default MyEnvironmentPage;
