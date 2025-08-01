import FlexActivityIndicator from '../components/FlexActivityIndicator';
import KeypairResourcePolicyList from '../components/KeypairResourcePolicyList';
import ProjectResourcePolicyList from '../components/ProjectResourcePolicyList';
import UserResourcePolicyList from '../components/UserResourcePolicyList';
import { filterOutEmpty } from '../helper';
import { useWebUINavigate } from '../hooks';
import { BAICard } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { withDefault, StringParam, useQueryParam } from 'use-query-params';

const tabParam = withDefault(StringParam, 'keypair');

interface ResourcePolicyPageProps {}
const ResourcePolicyPage: React.FC<ResourcePolicyPageProps> = () => {
  const { t } = useTranslation();
  const [curTabKey] = useQueryParam('tab', tabParam);
  const webUINavigate = useWebUINavigate();

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => {
        webUINavigate(
          {
            pathname: '/resource-policy',
            search: new URLSearchParams({
              tab: key,
            }).toString(),
          },
          {
            params: {
              tab: key,
            },
          },
        );
      }}
      tabList={filterOutEmpty([
        {
          key: 'keypair',
          label: t('resourcePolicy.Keypair'),
        },
        {
          key: 'user',
          label: t('resourcePolicy.User'),
        },
        {
          key: 'project',
          label: t('resourcePolicy.Project'),
        },
      ])}
    >
      <Suspense fallback={<FlexActivityIndicator />}>
        {curTabKey === 'keypair' && <KeypairResourcePolicyList />}
        {curTabKey === 'user' && <UserResourcePolicyList />}
        {curTabKey === 'project' && <ProjectResourcePolicyList />}
      </Suspense>
    </BAICard>
  );
};

export default ResourcePolicyPage;
