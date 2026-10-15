/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ResourceGroupDetailDrawerFragment$data,
  ResourceGroupDetailDrawerFragment$key,
} from '../__generated__/ResourceGroupDetailDrawerFragment.graphql';
import { ResourceGroupDetailDrawerQuery } from '../__generated__/ResourceGroupDetailDrawerQuery.graphql';
import { ResourceGroupDetailDrawerSettingModalQuery } from '../__generated__/ResourceGroupDetailDrawerSettingModalQuery.graphql';
import { getSessionTypeLabel } from '../helper/sessionTypeLabel';
import BAIErrorBoundary from './BAIErrorBoundary';
import ResourceGroupDefaultDeploymentOptionsPanel from './ResourceGroupDefaultDeploymentOptionsPanel';
import ResourceGroupDefaultSessionOptionsPanel from './ResourceGroupDefaultSessionOptionsPanel';
import type { ScalingGroupOpts } from './ResourceGroupList';
import ResourceGroupSettingModal from './ResourceGroupSettingModal';
import { IconButton } from '@lablup/ui-common/IconButton';
import { MetadataListItem } from '@lablup/ui-common/MetadataList';
import { Tab, TabList } from '@lablup/ui-common/TabList';
import { Token } from '@lablup/ui-common/Token';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAICard,
  BAIDrawer,
  type BAIDrawerProps,
  type BAIEntityLabel,
  BAIEntityLabelCell,
  BAIFetchKeyButton,
  BAIFlex,
  BAIIconWithTooltip,
  BAIMetadataList,
  BAISkeleton,
  BAIText,
  BAIUnmountAfterClose,
  tokenColorForStatus,
  useBAIBreakpoint,
  useIsLabelableEntityType,
  useUpdatableState,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { Check, Info, SquarePenIcon, X } from 'lucide-react';
import React, {
  Suspense,
  useEffect,
  useEffectEvent,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  type PreloadedQuery,
  graphql,
  useFragment,
  useLazyLoadQuery,
  usePreloadedQuery,
  useQueryLoader,
} from 'react-relay';

type TabKey = 'defaultSessionOptions' | 'defaultDeploymentOptions';

// The basic-info form still edits the graphene `ScalingGroup` (it carries
// `wsproxy_api_token` and `scheduler_opts`, which `ResourceGroup` does not).
// The drawer starts this query on the edit click (render-as-you-fetch).
const SettingModalQuery = graphql`
  query ResourceGroupDetailDrawerSettingModalQuery($name: String!) {
    scaling_group(name: $name) {
      ...ResourceGroupSettingModalFragment
    }
  }
`;

interface ResourceGroupDetailDrawerSettingModalProps {
  queryRef:
    | PreloadedQuery<ResourceGroupDetailDrawerSettingModalQuery>
    | null
    | undefined;
  open?: boolean;
  onRequestClose: (success: boolean) => void;
  // Set by `BAIUnmountAfterClose`; the drawer releases the query in it.
  afterClose?: () => void;
}

const ResourceGroupDetailDrawerSettingModalContent: React.FC<
  Omit<ResourceGroupDetailDrawerSettingModalProps, 'queryRef'> & {
    queryRef: PreloadedQuery<ResourceGroupDetailDrawerSettingModalQuery>;
  }
> = ({ queryRef, onRequestClose, ...modalProps }) => {
  'use memo';
  const { scaling_group } =
    usePreloadedQuery<ResourceGroupDetailDrawerSettingModalQuery>(
      SettingModalQuery,
      queryRef,
    );

  // A null fragment puts the modal in create mode; close instead.
  const closeWhenMissing = useEffectEvent(() => {
    if (!scaling_group) {
      onRequestClose(false);
    }
  });
  useEffect(() => {
    closeWhenMissing();
  }, [scaling_group]);

  return scaling_group ? (
    <ResourceGroupSettingModal
      resourceGroupFrgmt={scaling_group}
      onRequestClose={onRequestClose}
      {...modalProps}
    />
  ) : null;
};

// Mounted by `BAIUnmountAfterClose` only while open, so with a loaded query,
// and kept through the close animation, during which the query is still live.
const ResourceGroupDetailDrawerSettingModal: React.FC<
  ResourceGroupDetailDrawerSettingModalProps
> = ({ queryRef, ...modalProps }) => {
  'use memo';
  return queryRef ? (
    <ResourceGroupDetailDrawerSettingModalContent
      queryRef={queryRef}
      {...modalProps}
    />
  ) : null;
};

const ResourceGroupDetailDrawerContent: React.FC<{
  resourceGroup: ResourceGroupDetailDrawerFragment$data;
  fetchKey: string;
  onClickEdit: () => void;
  // The edit modal's data is in flight; the button shows it.
  isEditPending?: boolean;
  onEditLabels?: () => void;
  onLabelClick?: (label: BAIEntityLabel) => void;
}> = ({
  resourceGroup,
  fetchKey,
  onClickEdit,
  isEditPending,
  onEditLabels,
  onLabelClick,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const { md } = useBAIBreakpoint();
  const isLabelable = useIsLabelableEntityType('resource_group');
  const [activeTab, setActiveTab] = useState<TabKey>('defaultSessionOptions');

  const resourceGroupName = resourceGroup.name;
  // `ResourceGroup` has no counterpart for `scheduler_opts`.
  const { scaling_group } = useLazyLoadQuery<ResourceGroupDetailDrawerQuery>(
    graphql`
      query ResourceGroupDetailDrawerQuery($name: String!) {
        scaling_group(name: $name) {
          scheduler_opts
        }
      }
    `,
    { name: resourceGroupName },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const schedulerOpts: Partial<ScalingGroupOpts> = JSON.parse(
    scaling_group?.scheduler_opts || '{}',
  );

  const renderBoolean = (value: boolean | null | undefined) =>
    value ? (
      <Check style={{ color: token('--color-success') }} size="1em" />
    ) : (
      <X style={{ color: token('--color-text-secondary') }} size="1em" />
    );

  return (
    <BAIFlex direction="column" gap="lg" align="stretch">
      <BAIFlex direction="column" gap="sm" align="stretch">
        <BAIFlex justify="between" align="start" gap="sm">
          <BAIFlex direction="column" align="start">
            <BAIText strong copyable size="2xl">
              {resourceGroup.name}
            </BAIText>
            {resourceGroup.metadata.description ? (
              <BAIText type="secondary">
                {resourceGroup.metadata.description}
              </BAIText>
            ) : null}
          </BAIFlex>
          <IconButton
            className="bai-action-accent"
            variant="secondary"
            icon={<SquarePenIcon aria-hidden />}
            label={t('resourceGroup.ModifyResourceGroup')}
            tooltip={t('resourceGroup.ModifyResourceGroup')}
            isLoading={isEditPending}
            onClick={onClickEdit}
          />
        </BAIFlex>
        <BAICard>
          <BAIMetadataList columns={md ? 2 : 1}>
            <MetadataListItem label={t('resourceGroup.Active')}>
              <Token
                color={tokenColorForStatus(
                  'resourceGroup',
                  resourceGroup.status.isActive ? 'ACTIVE' : 'INACTIVE',
                )}
                label={
                  resourceGroup.status.isActive
                    ? t('general.Active')
                    : t('general.Inactive')
                }
              />
            </MetadataListItem>
            <MetadataListItem label={t('resourceGroup.Public')}>
              {renderBoolean(resourceGroup.status.isPublic)}
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
                    <Token key={value} label={getSessionTypeLabel(t, value)} />
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
            {isLabelable && (
              <MetadataListItem label={t('entityLabel.Labels')}>
                <BAIEntityLabelCell
                  entityLabelsFrgmt={resourceGroup.entityLabels}
                  onEdit={onEditLabels}
                  onLabelClick={onLabelClick}
                />
              </MetadataListItem>
            )}
          </BAIMetadataList>
        </BAICard>
      </BAIFlex>
      <BAIFlex direction="column" gap="sm" align="stretch">
        <TabList
          hasDivider
          value={activeTab}
          onChange={(key) => setActiveTab(key as TabKey)}
        >
          <Tab
            value="defaultSessionOptions"
            label={t('resourceGroup.DefaultSessionOptions')}
            endContent={
              <BAIIconWithTooltip
                icon={<Info size="1em" aria-hidden />}
                content={t('resourceGroup.DefaultSessionOptionsDesc')}
              />
            }
          />
          <Tab
            value="defaultDeploymentOptions"
            label={t('resourceGroup.DefaultDeploymentOptions')}
            endContent={
              <BAIIconWithTooltip
                icon={<Info size="1em" aria-hidden />}
                content={t('resourceGroup.DefaultDeploymentOptionsDesc')}
              />
            }
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
    </BAIFlex>
  );
};

interface ResourceGroupDetailDrawerProps extends Omit<
  BAIDrawerProps,
  'onClose' | 'title' | 'extra' | 'children'
> {
  resourceGroupFrgmt?: ResourceGroupDetailDrawerFragment$key | null;
  onRequestClose?: () => void;
  /** Refetches the list query that owns `resourceGroupFrgmt`. */
  onRequestRefetch?: () => void;
  /** Opens the owner's label editor for this resource group. */
  onEditLabels?: () => void;
  onLabelClick?: (label: BAIEntityLabel) => void;
}

const ResourceGroupDetailDrawer: React.FC<ResourceGroupDetailDrawerProps> = ({
  resourceGroupFrgmt,
  onRequestClose,
  onRequestRefetch,
  onEditLabels,
  onLabelClick,
  ...drawerProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const resourceGroup = useFragment(
    graphql`
      fragment ResourceGroupDetailDrawerFragment on ResourceGroup {
        name
        status {
          isActive
          isPublic
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
        entityLabels(limit: 100) {
          ...BAIEntityLabelTokensFragment
        }
      }
    `,
    resourceGroupFrgmt,
  );
  const resourceGroupName = resourceGroup?.name;
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [
    settingModalQueryRef,
    loadSettingModalQuery,
    disposeSettingModalQuery,
  ] =
    useQueryLoader<ResourceGroupDetailDrawerSettingModalQuery>(
      SettingModalQuery,
    );
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  // The modal mounts inside this transition, so React holds the drawer as is
  // (and `isPendingEdit` true) until the query answers; no Suspense needed.
  const [isPendingEdit, startEditTransition] = useTransition();

  return (
    <BAIDrawer
      {...drawerProps}
      onClose={onRequestClose}
      side="end"
      size={800}
      title={t('resourceGroup.ResourceGroupInfo')}
      extra={
        <BAIFetchKeyButton
          loading={isPendingRefetch}
          value={fetchKey}
          onChange={(newFetchKey) => {
            startRefetchTransition(() => updateFetchKey(newFetchKey));
            onRequestRefetch?.();
          }}
        />
      }
    >
      <Suspense fallback={<BAISkeleton />}>
        {resourceGroup ? (
          <ResourceGroupDetailDrawerContent
            resourceGroup={resourceGroup}
            fetchKey={fetchKey}
            isEditPending={isPendingEdit}
            onEditLabels={onEditLabels}
            onLabelClick={onLabelClick}
            onClickEdit={() => {
              if (!resourceGroupName) return;
              startEditTransition(() => {
                // `modify_scaling_group` returns only `ok`/`msg`, and the
                // form reads `initialValues` once at mount, so a cached
                // first render would stick.
                loadSettingModalQuery(
                  { name: resourceGroupName },
                  { fetchPolicy: 'network-only' },
                );
                setIsSettingModalOpen(true);
              });
            }}
          />
        ) : null}
      </Suspense>
      <BAIUnmountAfterClose>
        <ResourceGroupDetailDrawerSettingModal
          open={isSettingModalOpen && !!settingModalQueryRef}
          queryRef={settingModalQueryRef}
          onRequestClose={(success) => {
            setIsSettingModalOpen(false);
            if (success) {
              startRefetchTransition(() => updateFetchKey());
              onRequestRefetch?.();
            }
          }}
          // The modal still reads the query while it fades out.
          afterClose={disposeSettingModalQuery}
        />
      </BAIUnmountAfterClose>
    </BAIDrawer>
  );
};

export default ResourceGroupDetailDrawer;
