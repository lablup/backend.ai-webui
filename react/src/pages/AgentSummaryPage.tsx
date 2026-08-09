/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AgentSummaryList from '../components/AgentSummaryList';
import BAISkeletonAstryx from '../components/astryx-bui/BAISkeletonAstryx';
import { BAICard } from 'backend.ai-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

interface ResourcesPageProps {}

// QA2-A: this page was a hand-inlined `Card` + `VStack` + `TabList` copy of
// `BAICard tabList` (the phase-3 "ticket 15 idiom"). `BAICard` now renders the
// strip as the card's HEADER CHROME — full-bleed rail, label on the body inset
// — so the hand-rolled copy drifted visually from every other tabbed card.
// Folded back onto the real prop, which is also what this page used on `main`.
const ResourcesPage: React.FC<ResourcesPageProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryState(
    'tab',
    parseAsStringLiteral(['agent-summary']).withDefault('agent-summary'),
  );

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => {
        if (key === 'agent-summary') {
          void setCurTabKey(key);
        }
      }}
      tabList={[{ key: 'agent-summary', label: t('webui.menu.AgentSummary') }]}
    >
      {curTabKey === 'agent-summary' ? (
        <Suspense fallback={<BAISkeletonAstryx rows={4} />}>
          <AgentSummaryList />
        </Suspense>
      ) : null}
    </BAICard>
  );
};

export default ResourcesPage;
