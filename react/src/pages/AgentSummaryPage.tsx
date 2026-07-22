/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AgentSummaryList from '../components/AgentSummaryList';
import { Skeleton, theme } from 'antd';
import { BAICard } from 'backend.ai-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

interface ResourcesPageProps {}

const ResourcesPage: React.FC<ResourcesPageProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const [curTabKey] = useQueryState(
    'tab',
    parseAsStringLiteral(['agent-summary']).withDefault('agent-summary'),
  );

  const { token } = theme.useToken();

  return (
    <BAICard
      activeTabKey={curTabKey}
      tabList={[
        {
          key: 'agent-summary',
          label: t('webui.menu.AgentSummary'),
        },
      ]}
    >
      {curTabKey === 'agent-summary' ? (
        // To remove duplicated border in the bordered table, we need to remove margin of the container.
        <Suspense
          fallback={
            <Skeleton
              active
              style={{ padding: token.paddingContentVerticalLG }}
            />
          }
        >
          <AgentSummaryList />
        </Suspense>
      ) : null}
    </BAICard>
  );
};

export default ResourcesPage;
