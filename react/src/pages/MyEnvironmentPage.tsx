/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import CustomizedImageList from '../components/CustomizedImageList';
import BAISkeletonAstryx from '../components/astryx-bui/BAISkeletonAstryx';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Stack';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

// antd `BAICard tabList` -> Astryx `Card` + `TabList hasDivider` composition
// (MAPPING.md: Card is COMPOSITION; ticket 15 idiom). Single-tab card.
// PILOT-DECISION: the FlexActivityIndicator (antd Spin) suspense fallback is
// replaced with BAISkeletonAstryx, matching the loading idiom used by the
// other converted tab hosts (ticket 15).
const MyEnvironmentPage = () => {
  'use memo';
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryState(
    'tab',
    parseAsStringLiteral(['image']).withDefault('image'),
  );

  return (
    <Card padding={6}>
      <VStack gap={4} align="stretch">
        <TabList
          value={curTabKey}
          onChange={(key) => {
            if (key === 'image') {
              setCurTabKey(key);
            }
          }}
          hasDivider
        >
          <Tab value="image" label={t('environment.Images')} />
        </TabList>
        <Suspense fallback={<BAISkeletonAstryx rows={4} />}>
          {curTabKey === 'image' && <CustomizedImageList />}
        </Suspense>
      </VStack>
    </Card>
  );
};

export default MyEnvironmentPage;
