/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { UserResourcePolicyV2Query as UserResourcePolicyV2QueryType } from '../__generated__/UserResourcePolicyV2Query.graphql';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import KeypairResourcePolicyList from '../components/KeypairResourcePolicyList';
import ProjectResourcePolicyList from '../components/ProjectResourcePolicyList';
import UserResourcePolicyList from '../components/UserResourcePolicyList';
import UserResourcePolicyV2, {
  UserResourcePolicyV2Query,
} from '../components/UserResourcePolicyV2';
import { useSuspendedBackendaiClient, useTabQuerySnapshot } from '../hooks';
import { Skeleton } from 'antd';
import { filterOutEmpty, BAICard } from 'backend.ai-ui';
import { parseAsStringLiteral } from 'nuqs';
import React, { Suspense, useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryLoader } from 'react-relay';

interface ResourcePolicyPageProps {}
const tabParser = parseAsStringLiteral([
  'keypair',
  'user',
  'project',
]).withDefault('keypair');

const ResourcePolicyPage: React.FC<ResourcePolicyPageProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);
  const baiClient = useSuspendedBackendaiClient();
  const supportsSubFilter = baiClient.supports('sub-filter');
  const supportsBinarySizeExpr = baiClient.supports('binary-size-expr');

  const [userResourcePolicyQueryRef, loadUserResourcePolicyQuery] =
    useQueryLoader<UserResourcePolicyV2QueryType>(UserResourcePolicyV2Query);

  const ensureUserResourcePolicyLoaded = useEffectEvent(() => {
    if (
      supportsSubFilter &&
      supportsBinarySizeExpr &&
      currentTab === 'user' &&
      !userResourcePolicyQueryRef
    ) {
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
    [currentTab],
  );

  return (
    <BAICard
      activeTabKey={currentTab}
      onTabChange={onTabChange}
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
        {currentTab === 'keypair' && (
          <BAIErrorBoundary>
            <KeypairResourcePolicyList />
          </BAIErrorBoundary>
        )}
        {currentTab === 'user' && (
          <BAIErrorBoundary>
            {supportsSubFilter && supportsBinarySizeExpr ? (
              userResourcePolicyQueryRef ? (
                <UserResourcePolicyV2
                  queryRef={userResourcePolicyQueryRef}
                  onReload={loadUserResourcePolicyQuery}
                />
              ) : (
                <Skeleton active />
              )
            ) : (
              <UserResourcePolicyList />
            )}
          </BAIErrorBoundary>
        )}
        {currentTab === 'project' && (
          <BAIErrorBoundary>
            <ProjectResourcePolicyList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default ResourcePolicyPage;
