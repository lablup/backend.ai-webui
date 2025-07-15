import AgentSummaryList from '../components/AgentSummaryList';
import BAICard from '../components/BAICard';
import { Skeleton, theme } from 'antd';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'agent-summary';

interface ResourcesPageProps {}

const tabParam = withDefault(StringParam, 'agent-summary');

const ResourcesPage: React.FC<ResourcesPageProps> = (props) => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam, {
    updateType: 'replace',
  });

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
      styles={{
        body: {
          padding: `${token.paddingSM}px ${token.paddingLG}px ${token.paddingLG}px ${token.paddingLG}px`,
        },
      }}
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
