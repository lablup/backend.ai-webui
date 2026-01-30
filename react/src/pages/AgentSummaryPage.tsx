import AgentSummaryList from '../components/AgentSummaryList';
import { Skeleton, theme } from 'antd';
import { BAICard } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

type TabKey = 'agent-summary';

interface ResourcesPageProps {}

const ResourcesPage: React.FC<ResourcesPageProps> = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryState(
    'tab',
    parseAsString
      .withDefault('agent-summary')
      .withOptions({ history: 'replace' }),
  );

  const { token } = theme.useToken();

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={[
        {
          key: 'agent-summary',
          tab: t('webui.menu.AgentSummary'),
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
