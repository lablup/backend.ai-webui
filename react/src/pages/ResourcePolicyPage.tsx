import FlexActivityIndicator from '../components/FlexActivityIndicator';
import KeypairResourcePolicyList from '../components/KeypairResourcePolicyList';
import ProjectResourcePolicyList from '../components/ProjectResourcePolicyList';
import UserResourcePolicyList from '../components/UserResourcePolicyList';
import { useWebUINavigate } from '../hooks';
import { Card } from 'antd';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { withDefault, StringParam, useQueryParam } from 'use-query-params';

const tabParam = withDefault(StringParam, 'keypair');

interface ResourcePolicyPageProps {}
const ResourcePolicyPage: React.FC<ResourcePolicyPageProps> = () => {
  const { t } = useTranslation();
  const webUINavigate = useWebUINavigate();
  const [curTabKey] = useQueryParam('tab', tabParam);

  return (
    <Card
      activeTabKey={curTabKey}
      onTabChange={(key) => {
        webUINavigate(
          {
            pathname: '/resource-policy',
            search: `?tab=${key}`,
          },
          {
            params: {
              tab: key,
            },
          },
        );
      }}
      tabList={[
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
      ]}
      styles={{
        body: {
          padding: 0,
          paddingTop: 1,
          overflow: 'hidden',
        },
      }}
    >
      <Suspense fallback={<FlexActivityIndicator />}>
        {curTabKey === 'keypair' && <KeypairResourcePolicyList />}
        {curTabKey === 'user' && <UserResourcePolicyList />}
        {curTabKey === 'project' && <ProjectResourcePolicyList />}
      </Suspense>
    </Card>
  );
};

export default ResourcePolicyPage;
