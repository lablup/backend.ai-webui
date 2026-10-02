/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupDefaultSessionOptionsPanelFragment$key } from '../__generated__/ResourceGroupDefaultSessionOptionsPanelFragment.graphql';
import { ResourceGroupDefaultSessionOptionsPanelQuery } from '../__generated__/ResourceGroupDefaultSessionOptionsPanelQuery.graphql';
import { ResourceGroupDefaultSessionOptionsPanel_options$key } from '../__generated__/ResourceGroupDefaultSessionOptionsPanel_options.graphql';
import ResourceGroupDefaultSessionOptionsModal from './ResourceGroupDefaultSessionOptionsModal';
import { HandlerOptionsDescription } from './ResourceGroupHandlerOptionsFields';
import { EmptyState } from '@lablup/ui-common/EmptyState';
import { MetadataListItem } from '@lablup/ui-common/MetadataList';
import { Text } from '@lablup/ui-common/Text';
import { Token } from '@lablup/ui-common/Token';
import {
  BAIButton,
  BAICard,
  BAIFlex,
  BAIMetadataList,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { SquarePenIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface ResourceGroupDefaultSessionOptionsPanelContentProps {
  resourceGroupFrgmt: ResourceGroupDefaultSessionOptionsPanelFragment$key;
}

const ResourceGroupDefaultSessionOptionsPanelContent: React.FC<
  ResourceGroupDefaultSessionOptionsPanelContentProps
> = ({ resourceGroupFrgmt }) => {
  'use memo';
  const { t } = useTranslation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const resourceGroup = useFragment(
    graphql`
      fragment ResourceGroupDefaultSessionOptionsPanelFragment on ResourceGroup {
        defaultSessionOptions @since(version: "26.4.4rc1") {
          ...ResourceGroupDefaultSessionOptionsPanel_options
        }
        ...ResourceGroupDefaultSessionOptionsModalFragment
      }
    `,
    resourceGroupFrgmt,
  );
  const options =
    useFragment<ResourceGroupDefaultSessionOptionsPanel_options$key>(
      graphql`
        fragment ResourceGroupDefaultSessionOptionsPanel_options on DefaultSessionOptionsInfo {
          priority
          isPreemptible
          clusterMode
          defaultFailurePolicy
          agentSelectionPolicy
          handlerOptions {
            default {
              timeoutSec
              maxRetryCount
            }
            byHandler {
              handlerName
              timeoutSec
              maxRetryCount
            }
          }
          defaultKernelExecutionSpec {
            imageId
            resources {
              resourceType
              quantity
            }
            resourceOpts {
              shmem
            }
            startupCommand
            bootstrapScript
            startsAt
            batchTimeoutSec
          }
        }
      `,
      resourceGroup.defaultSessionOptions ?? null,
    );
  const spec = options?.defaultKernelExecutionSpec;

  const failurePolicyLabel = {
    STRICT: t('resourceGroup.FailurePolicyStrict'),
    BOOT_ALL: t('resourceGroup.FailurePolicyBootAll'),
    TOLERANT: t('resourceGroup.FailurePolicyTolerant'),
  } as Record<string, string>;
  const agentSelectionLabel = {
    STRICT: t('resourceGroup.AgentSelectionStrict'),
    PREFERRED: t('resourceGroup.AgentSelectionPreferred'),
  } as Record<string, string>;
  const clusterModeLabel = {
    'single-node': t('session.launcher.SingleNode'),
    'multi-node': t('session.launcher.MultiNode'),
  } as Record<string, string>;
  const normalizedClusterMode = _.replace(
    _.toLower(options?.clusterMode ?? ''),
    '_',
    '-',
  );

  return (
    <BAICard
      extra={
        <BAIButton
          icon={<SquarePenIcon />}
          onClick={() => setIsEditModalOpen(true)}
        >
          {t('button.Edit')}
        </BAIButton>
      }
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <BAIMetadataList label={{ position: 'start', width: '40%' }}>
          <MetadataListItem label={t('session.Priority')}>
            {options?.priority ?? '-'}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.Preemptible')}>
            {_.isNil(options?.isPreemptible)
              ? '-'
              : options.isPreemptible
                ? t('general.Enabled')
                : t('general.Disabled')}
          </MetadataListItem>
          <MetadataListItem label={t('session.ClusterMode')}>
            {clusterModeLabel[normalizedClusterMode] ??
              options?.clusterMode ??
              '-'}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.FailurePolicy')}>
            {options?.defaultFailurePolicy
              ? (failurePolicyLabel[options.defaultFailurePolicy] ??
                options.defaultFailurePolicy)
              : '-'}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.AgentSelectionPolicy')}>
            {options?.agentSelectionPolicy
              ? (agentSelectionLabel[options.agentSelectionPolicy] ??
                options.agentSelectionPolicy)
              : '-'}
          </MetadataListItem>
        </BAIMetadataList>
        <HandlerOptionsDescription handlerOptions={options?.handlerOptions} />
        <BAIMetadataList
          title={t('resourceGroup.KernelExecutionSpec')}
          label={{ position: 'start', width: '40%' }}
        >
          <MetadataListItem label={t('general.Image')}>
            {spec?.imageId || '-'}
          </MetadataListItem>
          <MetadataListItem label={t('resourcePreset.Resources')}>
            {_.isEmpty(spec?.resources) ? (
              '-'
            ) : (
              <BAIFlex gap="xxs" wrap="wrap">
                {_.map(spec?.resources, (entry) => (
                  <Token
                    key={entry.resourceType}
                    label={`${entry.resourceType}: ${entry.quantity}`}
                  />
                ))}
              </BAIFlex>
            )}
          </MetadataListItem>
          <MetadataListItem label={t('adminDeploymentPreset.Shmem')}>
            {spec?.resourceOpts?.shmem || '-'}
          </MetadataListItem>
          <MetadataListItem label={t('adminDeploymentPreset.StartupCommand')}>
            {spec?.startupCommand ? (
              <Text type="code" maxLines={3}>
                {spec.startupCommand}
              </Text>
            ) : (
              '-'
            )}
          </MetadataListItem>
          <MetadataListItem label={t('adminDeploymentPreset.BootstrapScript')}>
            {spec?.bootstrapScript ? (
              <Text type="code" maxLines={3}>
                {spec.bootstrapScript}
              </Text>
            ) : (
              '-'
            )}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.BatchTimeout')}>
            {_.isNil(spec?.batchTimeoutSec)
              ? '-'
              : `${spec.batchTimeoutSec} ${t('resourceGroup.TimeoutSeconds')}`}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.StartsAt')}>
            {spec?.startsAt ? dayjs(spec.startsAt).format('lll') : '-'}
          </MetadataListItem>
        </BAIMetadataList>
      </BAIFlex>
      <BAIUnmountAfterClose>
        <ResourceGroupDefaultSessionOptionsModal
          open={isEditModalOpen}
          resourceGroupFrgmt={resourceGroup}
          onRequestClose={() => setIsEditModalOpen(false)}
        />
      </BAIUnmountAfterClose>
    </BAICard>
  );
};

const ResourceGroupDefaultSessionOptionsPanel: React.FC<{
  resourceGroupName: string;
  fetchKey: string;
}> = ({ resourceGroupName, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  // Its own query and its own pagination args (so its own store record): a
  // manager error inside the options nulls this node, not the drawer's.
  const { adminResourceGroups } =
    useLazyLoadQuery<ResourceGroupDefaultSessionOptionsPanelQuery>(
      graphql`
        query ResourceGroupDefaultSessionOptionsPanelQuery(
          $filter: ResourceGroupFilter
        ) {
          adminResourceGroups(filter: $filter, first: 1) {
            edges {
              node {
                ...ResourceGroupDefaultSessionOptionsPanelFragment
              }
            }
          }
        }
      `,
      { filter: { name: { equals: resourceGroupName } } },
      { fetchPolicy: 'store-and-network', fetchKey },
    );
  const node = adminResourceGroups?.edges[0]?.node;

  return node ? (
    <ResourceGroupDefaultSessionOptionsPanelContent resourceGroupFrgmt={node} />
  ) : (
    <EmptyState
      title={t('resourceGroup.FailedToLoadDefaultOptions')}
      isCompact
    />
  );
};

export default ResourceGroupDefaultSessionOptionsPanel;
