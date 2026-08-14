/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import CustomizedImageList from '../components/CustomizedImageList';
import { BAISkeleton, BAICard } from 'backend.ai-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

// QA2-A: folded the hand-inlined `Card` + `VStack` + `TabList` copy back onto
// `BAICard tabList`, which now renders the strip as the card's header chrome.
// See `AgentSummaryPage` for the same note.
// PILOT-DECISION (kept): the FlexActivityIndicator (antd Spin) suspense
// fallback is replaced with BAISkeleton, matching the loading idiom used
// by the other converted tab hosts (ticket 15).
const MyEnvironmentPage = () => {
  'use memo';
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryState(
    'tab',
    parseAsStringLiteral(['image']).withDefault('image'),
  );

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => {
        if (key === 'image') {
          void setCurTabKey(key);
        }
      }}
      tabList={[{ key: 'image', label: t('environment.Images') }]}
    >
      <Suspense fallback={<BAISkeleton rows={4} />}>
        {curTabKey === 'image' && <CustomizedImageList />}
      </Suspense>
    </BAICard>
  );
};

export default MyEnvironmentPage;
