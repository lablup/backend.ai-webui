/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { KeypairResourcePolicyV2Query as KeypairResourcePolicyV2QueryType } from '../__generated__/KeypairResourcePolicyV2Query.graphql';
import type { ProjectResourcePolicyV2Query as ProjectResourcePolicyV2QueryType } from '../__generated__/ProjectResourcePolicyV2Query.graphql';
import type { UserResourcePolicyV2Query as UserResourcePolicyV2QueryType } from '../__generated__/UserResourcePolicyV2Query.graphql';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import KeypairResourcePolicyList from '../components/KeypairResourcePolicyList';
import KeypairResourcePolicyV2, {
  KeypairResourcePolicyV2Query,
} from '../components/KeypairResourcePolicyV2';
import ProjectResourcePolicyList from '../components/ProjectResourcePolicyList';
import ProjectResourcePolicyV2, {
  ProjectResourcePolicyV2Query,
} from '../components/ProjectResourcePolicyV2';
import UserResourcePolicyList from '../components/UserResourcePolicyList';
import UserResourcePolicyV2, {
  UserResourcePolicyV2Query,
} from '../components/UserResourcePolicyV2';
import { useSuspendedBackendaiClient, useTabQuerySnapshot } from '../hooks';
import { BAISkeleton, filterOutEmpty, BAICard } from 'backend.ai-ui';
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

  const [keypairResourcePolicyQueryRef, loadKeypairResourcePolicyQuery] =
    useQueryLoader<KeypairResourcePolicyV2QueryType>(
      KeypairResourcePolicyV2Query,
    );

  const ensureKeypairResourcePolicyLoaded = useEffectEvent(() => {
    if (
      supportsSubFilter &&
      currentTab === 'keypair' &&
      !keypairResourcePolicyQueryRef
    ) {
      loadKeypairResourcePolicyQuery(
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
    function loadKeypairResourcePolicyOnTabActivation() {
      ensureKeypairResourcePolicyLoaded();
    },
    [currentTab],
  );

  const [projectResourcePolicyQueryRef, loadProjectResourcePolicyQuery] =
    useQueryLoader<ProjectResourcePolicyV2QueryType>(
      ProjectResourcePolicyV2Query,
    );

  const ensureProjectResourcePolicyLoaded = useEffectEvent(() => {
    if (
      supportsSubFilter &&
      supportsBinarySizeExpr &&
      currentTab === 'project' &&
      !projectResourcePolicyQueryRef
    ) {
      loadProjectResourcePolicyQuery(
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
    function loadProjectResourcePolicyOnTabActivation() {
      ensureProjectResourcePolicyLoaded();
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
      <Suspense fallback={<BAISkeleton />}>
        {currentTab === 'keypair' && (
          <BAIErrorBoundary>
            {supportsSubFilter ? (
              keypairResourcePolicyQueryRef ? (
                <KeypairResourcePolicyV2
                  queryRef={keypairResourcePolicyQueryRef}
                  onReload={loadKeypairResourcePolicyQuery}
                />
              ) : (
                <BAISkeleton />
              )
            ) : (
              <KeypairResourcePolicyList />
            )}
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
                <BAISkeleton />
              )
            ) : (
              <UserResourcePolicyList />
            )}
          </BAIErrorBoundary>
        )}
        {currentTab === 'project' && (
          <BAIErrorBoundary>
            {supportsSubFilter && supportsBinarySizeExpr ? (
              projectResourcePolicyQueryRef ? (
                <ProjectResourcePolicyV2
                  queryRef={projectResourcePolicyQueryRef}
                  onReload={loadProjectResourcePolicyQuery}
                />
              ) : (
                <BAISkeleton />
              )
            ) : (
              <ProjectResourcePolicyList />
            )}
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default ResourcePolicyPage;
