/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupDetailDrawerQuery } from '../__generated__/ResourceGroupDetailDrawerQuery.graphql';
import { ResourceGroupDetailDrawerSettingModalQuery } from '../__generated__/ResourceGroupDetailDrawerSettingModalQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import BAIErrorBoundary from './BAIErrorBoundary';
import ResourceGroupDefaultDeploymentOptionsPanel from './ResourceGroupDefaultDeploymentOptionsPanel';
import ResourceGroupDefaultSessionOptionsPanel from './ResourceGroupDefaultSessionOptionsPanel';
import type { ScalingGroupOpts } from './ResourceGroupList';
import ResourceGroupSettingModal from './ResourceGroupSettingModal';
import { EmptyState } from '@lablup/ui-common/EmptyState';
import { IconButton } from '@lablup/ui-common/IconButton';
import { MetadataListItem } from '@lablup/ui-common/MetadataList';
import { Tab, TabList } from '@lablup/ui-common/TabList';
import { Token } from '@lablup/ui-common/Token';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAICard,
  BAIDrawer,
  type BAIDrawerProps,
  BAIFetchKeyButton,
  BAIFlex,
  BAIMetadataList,
  BAISkeleton,
  BAIText,
  useBAIBreakpoint,
  useUpdatableState,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { Check, SquarePenIcon, X } from 'lucide-react';
import React, { Suspense, useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type TabKey = 'defaultSessionOptions' | 'defaultDeploymentOptions';

// The basic-info form still edits the graphene `ScalingGroup` (it carries
// `wsproxy_api_token` and `scheduler_opts`, which `ResourceGroup` does not).
const ResourceGroupSettingModalWithQuery: React.FC<{
  resourceGroupName: string;
  open: boolean;
  onRequestClose: (success: boolean) => void;
}> = ({ resourceGroupName, onRequestClose, ...modalProps }) => {
  'use memo';
  const { scaling_group } =
    useLazyLoadQuery<ResourceGroupDetailDrawerSettingModalQuery>(
      graphql`
        query ResourceGroupDetailDrawerSettingModalQuery($name: String!) {
          scaling_group(name: $name) {
            ...ResourceGroupSettingModalFragment
          }
        }
      `,
      { name: resourceGroupName },
      // `modify_scaling_group` returns only `ok`/`msg`, and the form reads
      // `initialValues` once at mount, so a cached first render would stick.
      { fetchPolicy: 'network-only' },
    );

  // A null fragment puts the modal in create mode; close instead.
  useEffect(() => {
    if (!scaling_group) {
      onRequestClose(false);
    }
  }, [scaling_group, onRequestClose]);

  return scaling_group ? (
    <ResourceGroupSettingModal
      resourceGroupFrgmt={scaling_group}
      onRequestClose={onRequestClose}
      {...modalProps}
    />
  ) : null;
};

const ResourceGroupDetailDrawerContent: React.FC<{
  resourceGroupName: string;
  fetchKey: string;
}> = ({ resourceGroupName, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const { md } = useBAIBreakpoint();
  const baiClient = useSuspendedBackendaiClient();
  const supportsDefaultOptions = baiClient.supports(
    'resource-group-default-options',
  );
  const [activeTab, setActiveTab] = useState<TabKey>('defaultSessionOptions');

  const { adminResourceGroups, scaling_group } =
    useLazyLoadQuery<ResourceGroupDetailDrawerQuery>(
      graphql`
        query ResourceGroupDetailDrawerQuery(
          $name: String!
          $filter: ResourceGroupFilter
        ) {
          adminResourceGroups(filter: $filter, limit: 1) {
            edges {
              node {
                id
                name
                status {
                  isActive
                  isPublic
                  isDefault
                }
                metadata {
                  description
                  createdAt
                }
                network {
                  wsproxyAddr
                }
                scheduler {
                  type
                }
              }
            }
          }
          scaling_group(name: $name) {
            scheduler_opts
          }
        }
      `,
      {
        name: resourceGroupName,
        filter: { name: { equals: resourceGroupName } },
      },
      { fetchPolicy: 'store-and-network', fetchKey },
    );
  const resourceGroup = adminResourceGroups?.edges[0]?.node;
  const schedulerOpts: Partial<ScalingGroupOpts> = JSON.parse(
    scaling_group?.scheduler_opts || '{}',
  );

  if (!resourceGroup) {
    return (
      <EmptyState title={t('resourceGroup.ResourceGroupNotFound')} isCompact />
    );
  }

  const renderBoolean = (value: boolean | null | undefined) =>
    value ? (
      <Check style={{ color: token('--color-success') }} size="1em" />
    ) : (
      <X style={{ color: token('--color-text-secondary') }} size="1em" />
    );

  return (
    <BAIFlex direction="column" gap="lg" align="stretch">
      <BAIFlex direction="column" align="start" gap="xxs">
        <BAIText strong copyable size="2xl">
          {resourceGroup.name}
        </BAIText>
        {resourceGroup.metadata.description ? (
          <BAIText type="secondary">
            {resourceGroup.metadata.description}
          </BAIText>
        ) : null}
      </BAIFlex>
      <BAICard>
        <BAIMetadataList columns={md ? 2 : 1}>
          <MetadataListItem label={t('resourceGroup.Active')}>
            {renderBoolean(resourceGroup.status.isActive)}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.Public')}>
            {renderBoolean(resourceGroup.status.isPublic)}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.Default')}>
            {renderBoolean(resourceGroup.status.isDefault)}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.Scheduler')}>
            {_.toUpper(resourceGroup.scheduler.type)}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.AllowedSessionTypes')}>
            {_.isEmpty(schedulerOpts.allowed_session_types) ? (
              '-'
            ) : (
              <BAIFlex wrap="wrap" gap="xs">
                {_.map(schedulerOpts.allowed_session_types, (value) => (
                  <Token key={value} label={_.startCase(value)} />
                ))}
              </BAIFlex>
            )}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.PendingTimeout')}>
            {schedulerOpts.pending_timeout
              ? `${schedulerOpts.pending_timeout} ${t('resourceGroup.TimeoutSeconds')}`
              : t('general.Disabled')}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.RetriesToSkipDesc')}>
            {schedulerOpts.config?.num_retries_to_skip
              ? `${schedulerOpts.config.num_retries_to_skip} ${t('resourceGroup.RetriesToSkip')}`
              : '-'}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.AppProxyAddress')}>
            {resourceGroup.network.wsproxyAddr || '-'}
          </MetadataListItem>
          <MetadataListItem label={t('general.CreatedAt')}>
            {resourceGroup.metadata.createdAt
              ? dayjs(resourceGroup.metadata.createdAt).format('lll')
              : '-'}
          </MetadataListItem>
        </BAIMetadataList>
      </BAICard>
      {supportsDefaultOptions ? (
        <BAIFlex direction="column" gap="sm" align="stretch">
          <TabList
            hasDivider
            value={activeTab}
            onChange={(key) => setActiveTab(key as TabKey)}
          >
            <Tab
              value="defaultSessionOptions"
              label={t('resourceGroup.DefaultSessionOptions')}
            />
            <Tab
              value="defaultDeploymentOptions"
              label={t('resourceGroup.DefaultDeploymentOptions')}
            />
          </TabList>
          <BAIErrorBoundary>
            <Suspense fallback={<BAISkeleton />}>
              {activeTab === 'defaultSessionOptions' ? (
                <ResourceGroupDefaultSessionOptionsPanel
                  resourceGroupName={resourceGroupName}
                  fetchKey={fetchKey}
                />
              ) : (
                <ResourceGroupDefaultDeploymentOptionsPanel
                  resourceGroupName={resourceGroupName}
                  fetchKey={fetchKey}
                />
              )}
            </Suspense>
          </BAIErrorBoundary>
        </BAIFlex>
      ) : null}
    </BAIFlex>
  );
};

interface ResourceGroupDetailDrawerProps extends Omit<
  BAIDrawerProps,
  'onClose' | 'title' | 'extra' | 'children'
> {
  resourceGroupName?: string | null;
  onRequestClose?: () => void;
  /** Called after the basic information is saved, to refresh the list. */
  onResourceGroupUpdated?: () => void;
}

const ResourceGroupDetailDrawer: React.FC<ResourceGroupDetailDrawerProps> = ({
  resourceGroupName,
  onRequestClose,
  onResourceGroupUpdated,
  ...drawerProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);

  return (
    <BAIDrawer
      {...drawerProps}
      onClose={onRequestClose}
      side="end"
      size={800}
      title={t('resourceGroup.ResourceGroupInfo')}
      extra={
        <>
          <IconButton
            className="bai-action-accent"
            variant="ghost"
            icon={<SquarePenIcon aria-hidden />}
            label={t('resourceGroup.ModifyResourceGroup')}
            tooltip={t('resourceGroup.ModifyResourceGroup')}
            onClick={() => setIsSettingModalOpen(true)}
          />
          <BAIFetchKeyButton
            loading={isPendingRefetch}
            value={fetchKey}
            onChange={(newFetchKey) => {
              startRefetchTransition(() => updateFetchKey(newFetchKey));
            }}
          />
        </>
      }
    >
      <Suspense fallback={<BAISkeleton />}>
        {resourceGroupName ? (
          <ResourceGroupDetailDrawerContent
            resourceGroupName={resourceGroupName}
            fetchKey={fetchKey}
          />
        ) : null}
      </Suspense>
      {resourceGroupName && isSettingModalOpen ? (
        <Suspense fallback={null}>
          <ResourceGroupSettingModalWithQuery
            resourceGroupName={resourceGroupName}
            open={isSettingModalOpen}
            onRequestClose={(success) => {
              setIsSettingModalOpen(false);
              if (success) {
                startRefetchTransition(() => updateFetchKey());
                onResourceGroupUpdated?.();
              }
            }}
          />
        </Suspense>
      ) : null}
    </BAIDrawer>
  );
};

export default ResourceGroupDetailDrawer;
