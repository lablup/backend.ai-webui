import KeypairResourcePolicyList from '../components/KeypairResourcePolicyList';
import ProjectResourcePolicyList from '../components/ProjectResourcePolicyList';
import UserResourcePolicyList from '../components/UserResourcePolicyList';
import { useWebUINavigate } from '../hooks';
import { Skeleton } from 'antd';
import { filterOutEmpty, BAICard } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';

interface ResourcePolicyPageProps {}
const ResourcePolicyPage: React.FC<ResourcePolicyPageProps> = () => {
  const { t } = useTranslation();
  const [curTabKey] = useQueryState(
    'tab',
    parseAsString.withDefault('keypair'),
  );
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
      <Suspense fallback={<Skeleton active />}>
        {curTabKey === 'keypair' && (
          <BAIErrorBoundary>
            <KeypairResourcePolicyList />
          </BAIErrorBoundary>
        )}
        {curTabKey === 'user' && (
          <BAIErrorBoundary>
            <UserResourcePolicyList />
          </BAIErrorBoundary>
        )}
        {curTabKey === 'project' && (
          <BAIErrorBoundary>
            <ProjectResourcePolicyList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default ResourcePolicyPage;
