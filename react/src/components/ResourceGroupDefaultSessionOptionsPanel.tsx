/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupDefaultSessionOptionsPanelFragment$key } from '../__generated__/ResourceGroupDefaultSessionOptionsPanelFragment.graphql';
import { ResourceGroupDefaultSessionOptionsPanelImageQuery } from '../__generated__/ResourceGroupDefaultSessionOptionsPanelImageQuery.graphql';
import { ResourceGroupDefaultSessionOptionsPanelQuery } from '../__generated__/ResourceGroupDefaultSessionOptionsPanelQuery.graphql';
import { ResourceGroupDefaultSessionOptionsPanel_options$key } from '../__generated__/ResourceGroupDefaultSessionOptionsPanel_options.graphql';
import { formatDuration } from '../helper';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import ResourceGroupDefaultSessionOptionsModal, {
  ResourceGroupDefaultSessionOptionsSection,
} from './ResourceGroupDefaultSessionOptionsModal';
import { HandlerOptionsDescription } from './ResourceGroupHandlerOptionsFields';
import ResourceGroupOptionsSection from './ResourceGroupOptionsSection';
import { normalizeShmemExpr } from './ResourceGroupSessionExecutionSpecFields';
import { ResourceAllocationFormValue } from './SessionFormItems/ResourceAllocationFormItems';
import { EmptyState } from '@lablup/ui-common/EmptyState';
import { MetadataListItem } from '@lablup/ui-common/MetadataList';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  BAIImageNodeSimpleTagV2,
  BAIMetadataList,
  BAISkeleton,
  BAIText,
  BAIUnmountAfterClose,
  useBAIBreakpoint,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

// TODO(needs-backend): BA-8374 — the spec carries only the image's raw UUID;
// resolve it here until the manager returns the `ImageV2` node itself.
const SpecImageMetaRow: React.FC<{ imageId: string }> = ({ imageId }) => {
  'use memo';
  const { adminImagesV2 } =
    useLazyLoadQuery<ResourceGroupDefaultSessionOptionsPanelImageQuery>(
      graphql`
        query ResourceGroupDefaultSessionOptionsPanelImageQuery(
          $imageId: UUID!
        ) {
          adminImagesV2(filter: { id: { equals: $imageId } }, limit: 1) {
            edges {
              node {
                ...BAIImageNodeSimpleTagV2Fragment
              }
            }
          }
        }
      `,
      { imageId },
      { fetchPolicy: 'store-or-network' },
    );
  const image = adminImagesV2?.edges[0]?.node;
  return image ? (
    <BAIImageNodeSimpleTagV2 imageFrgmt={image} />
  ) : (
    <BAIText monospace copyable>
      {imageId}
    </BAIText>
  );
};

interface ResourceGroupDefaultSessionOptionsPanelContentProps {
  resourceGroupFrgmt: ResourceGroupDefaultSessionOptionsPanelFragment$key;
}

const ResourceGroupDefaultSessionOptionsPanelContent: React.FC<
  ResourceGroupDefaultSessionOptionsPanelContentProps
> = ({ resourceGroupFrgmt }) => {
  'use memo';
  const { t } = useTranslation();
  const { md } = useBAIBreakpoint();
  const [editingSection, setEditingSection] =
    useState<ResourceGroupDefaultSessionOptionsSection | null>(null);

  const resourceGroup = useFragment(
    graphql`
      fragment ResourceGroupDefaultSessionOptionsPanelFragment on ResourceGroup {
        defaultSessionOptions {
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
  const shmemExpr = normalizeShmemExpr(spec?.resourceOpts?.shmem);
  // Same shape the session drawer feeds `ResourceNumbersOfSession`: slot name
  // → amount, `mem` in bytes.
  const specResource = {
    ..._.fromPairs(
      _.map(spec?.resources, (entry) => [
        entry.resourceType,
        entry.resourceType === 'cpu'
          ? parseFloat(String(entry.quantity))
          : String(entry.quantity),
      ]),
    ),
    ...(shmemExpr ? { shmem: shmemExpr } : {}),
  } as ResourceAllocationFormValue['resource'];

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <ResourceGroupOptionsSection
        title={t('resourceGroup.SessionExecutionOptions')}
        onEdit={() => setEditingSection('sessionExecutionSpec')}
      >
        <BAIMetadataList columns={md ? 2 : 1}>
          <MetadataListItem label={t('session.launcher.Environments')}>
            {spec?.imageId ? (
              <Suspense fallback={<BAISkeleton variant="input" size="small" />}>
                <SpecImageMetaRow imageId={spec.imageId} />
              </Suspense>
            ) : (
              '-'
            )}
          </MetadataListItem>
          <MetadataListItem label={t('session.ClusterMode')}>
            {clusterModeLabel[normalizedClusterMode] ??
              options?.clusterMode ??
              '-'}
          </MetadataListItem>
          <MetadataListItem label={t('session.launcher.ResourceAllocation')}>
            {_.isEmpty(spec?.resources) ? (
              '-'
            ) : (
              <BAIFlex gap="sm" wrap="wrap" align="center">
                <ResourceNumbersOfSession
                  resource={specResource}
                  showDividers
                />
              </BAIFlex>
            )}
          </MetadataListItem>
          <MetadataListItem
            label={t('session.launcher.BatchJobTimeoutDuration')}
          >
            {_.isNil(spec?.batchTimeoutSec)
              ? '-'
              : formatDuration(dayjs.duration(spec.batchTimeoutSec, 's'), t)}
          </MetadataListItem>
          <MetadataListItem label={t('session.launcher.SessionStartTime')}>
            {spec?.startsAt ? dayjs(spec.startsAt).format('lll') : '-'}
          </MetadataListItem>
          <MetadataListItem label={t('session.launcher.StartUpCommand')}>
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
        </BAIMetadataList>
      </ResourceGroupOptionsSection>
      <ResourceGroupOptionsSection
        title={t('resourceGroup.SchedulerOptions')}
        onEdit={() => setEditingSection('schedulerOptions')}
      >
        <BAIMetadataList columns={md ? 2 : 1}>
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
      </ResourceGroupOptionsSection>
      <ResourceGroupOptionsSection
        title={t('resourceGroup.HandlerOptions')}
        onEdit={() => setEditingSection('handlerOptions')}
      >
        <HandlerOptionsDescription handlerOptions={options?.handlerOptions} />
      </ResourceGroupOptionsSection>
      <BAIUnmountAfterClose>
        <ResourceGroupDefaultSessionOptionsModal
          open={!!editingSection}
          initialOpenSection={editingSection ?? undefined}
          resourceGroupFrgmt={resourceGroup}
          onRequestClose={() => setEditingSection(null)}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
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
