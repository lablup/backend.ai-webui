/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { UserResourcePolicyV2Query as UserResourcePolicyV2QueryType } from '../__generated__/UserResourcePolicyV2Query.graphql';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import KeypairResourcePolicyList from '../components/KeypairResourcePolicyList';
import ProjectResourcePolicyList from '../components/ProjectResourcePolicyList';
import UserResourcePolicyV2, {
  UserResourcePolicyV2Query,
} from '../components/UserResourcePolicyV2';
import { useWebUINavigate } from '../hooks';
import { Skeleton } from 'antd';
import { filterOutEmpty, BAICard } from 'backend.ai-ui';
import React, { Suspense, useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryLoader } from 'react-relay';
import { withDefault, StringParam, useQueryParam } from 'use-query-params';

const tabParam = withDefault(StringParam, 'keypair');

interface ResourcePolicyPageProps {}
const ResourcePolicyPage: React.FC<ResourcePolicyPageProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const [curTabKey] = useQueryParam('tab', tabParam);
  const webUINavigate = useWebUINavigate();

  const [userResourcePolicyQueryRef, loadUserResourcePolicyQuery] =
    useQueryLoader<UserResourcePolicyV2QueryType>(UserResourcePolicyV2Query);
  // Lazily fetch user resource policies only once the tab is active (covers both
  // a tab click and a direct `?tab=user` URL restore), so the query never runs
  // on the keypair / project tabs.
  const ensureUserResourcePolicyLoaded = useEffectEvent(() => {
    if (curTabKey === 'user' && !userResourcePolicyQueryRef) {
      loadUserResourcePolicyQuery(
        {
          orderBy: [{ field: 'CREATED_AT', direction: 'DESC' }],
          limit: 10,
          offset: 0,
        },
        { fetchPolicy: 'store-and-network' },
      );
    }
  });
  useEffect(
    function loadUserResourcePolicyOnTabActivation() {
      ensureUserResourcePolicyLoaded();
    },
    [curTabKey],
  );

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => {
        webUINavigate({
          pathname: '/resource-policy',
          search: new URLSearchParams({
            tab: key,
          }).toString(),
        });
      }}
      tabList={filterOutEmpty([
        {
          key: 'keypair',
          label: t('resourcePolicy.KeypairResourcePolicy'),
        },
        {
          key: 'user',
          label: t('resourcePolicy.UserResourcePolicy'),
        },
        {
          key: 'project',
          label: t('resourcePolicy.ProjectResourcePolicy'),
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
            {userResourcePolicyQueryRef ? (
              <UserResourcePolicyV2
                queryRef={userResourcePolicyQueryRef}
                onReload={loadUserResourcePolicyQuery}
              />
            ) : (
              <Skeleton active />
            )}
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
