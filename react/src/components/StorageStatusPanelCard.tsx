/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { StorageStatusPanelCardQuery } from '../__generated__/StorageStatusPanelCardQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useVFolderInvitations } from '../hooks/useVFolderInvitations';
import BAIPanelItem from './BAIPanelItem';
import { Text } from '@lablup/ui-common/Text';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIBadgeCount,
  BAIBoardItemTitle,
  BAIFlex,
  BAIFlexProps,
  BAIRowWrapWithDividers,
  useUpdateEffect,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface StorageStatusPanelProps extends BAIFlexProps {
  fetchKey?: string;
  onRequestBadgeClick?: () => void;
}

const PANEL_ITEM_MAX_WIDTH = 90; // Adjusted max width for panel items

// Dashboard board-item body for folder-status counts. Uses the shared
// `BAIBoardItemTitle` so the title reserves space for the board drag handle
// and sits consistently with peer items (`MyResource`, etc.) — wrapping in a
// `BAICard` here caused the title to overlap the handle on the left edge.
const StorageStatusPanelCard: React.FC<StorageStatusPanelProps> = ({
  fetchKey,
  onRequestBadgeClick,
  style,
  ...flexProps
}) => {
  const { t } = useTranslation();
  const { token } = useTheme();
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();
  if (!currentProject.name) {
    throw new Error('Project name is required for StorageStatusPanelCard');
  }
  if (!currentProject.id) {
    throw new Error('Project ID is required for StorageStatusPanelCard');
  }
  const deferredFetchKey = useDeferredValue(fetchKey);
  const [invitations, { updateInvitations }] = useVFolderInvitations();
  const invitationCount = invitations.length;

  useUpdateEffect(() => {
    // TODO: Consider use suspense without useEffect
    updateInvitations();
  }, [fetchKey]);

  const supportsResourcePolicyV2 = baiClient.supports('resource-policy-v2');
  const supportsVfolderV2 = baiClient.supports('vfolder-v2');

  const isExcludedCount = (status: string) => {
    return _.includes(
      ['delete-ongoing', 'delete-complete', 'delete-error'],
      status,
    );
  };

  // The REST list stays for the invited count on every manager (`VFolderFilter`
  // has no invited / received-share predicate) and for the other two counts
  // below `vfolder-v2`.
  const { data: vfolders } = useSuspenseTanQuery({
    queryKey: ['vfolders', { deferredFetchKey, id: currentProject.id }],
    queryFn: () => {
      if (!currentProject?.id) {
        throw new Error('Project ID is required for StorageStatusPanelCard');
      }
      return baiClient.vfolder.list(currentProject.id);
    },
  });
  const legacyCreatedCount = vfolders?.filter(
    (item: any) =>
      item.is_owner &&
      item.ownership_type === 'user' &&
      !isExcludedCount(item.status),
  ).length;
  const legacyProjectCount = vfolders?.filter(
    (item: any) =>
      item.ownership_type === 'group' && !isExcludedCount(item.status),
  ).length;
  const invitedCount = vfolders?.filter(
    (item: any) =>
      !item.is_owner &&
      item.ownership_type === 'user' &&
      !isExcludedCount(item.status),
  ).length;

  // TODO(FR-2691 v2-migration): only the project half remains legacy —
  // `project_resource_policy(name)` has no non-admin V2 counterpart.
  const {
    myUserResourcePolicyV2,
    user_resource_policy,
    project_resource_policy,
    myVfolders,
    projectVfolders,
  } = useLazyLoadQuery<StorageStatusPanelCardQuery>(
    graphql`
      query StorageStatusPanelCardQuery(
        $name: String!
        $projectId: UUID!
        $activeFilter: VFolderFilter
        $supportsResourcePolicyV2: Boolean!
        $supportsVfolderV2: Boolean!
      ) {
        myUserResourcePolicyV2
          @since(version: "26.4.2")
          @include(if: $supportsResourcePolicyV2) {
          maxVfolderCount
        }
        user_resource_policy
          @deprecatedSince(version: "26.4.2")
          @skip(if: $supportsResourcePolicyV2) {
          max_vfolder_count
        }
        project_resource_policy(name: $name) {
          max_vfolder_count
        }
        myVfolders(filter: $activeFilter)
          @since(version: "26.4.2")
          @include(if: $supportsVfolderV2) {
          count
        }
        projectVfolders(projectId: $projectId, filter: $activeFilter)
          @since(version: "26.4.2")
          @include(if: $supportsVfolderV2) {
          count
        }
      }
    `,
    {
      name: currentProject.name,
      projectId: currentProject.id,
      // Same exclusion as `isExcludedCount`: a trash-bin (DELETE_PENDING)
      // folder still counts toward the quota.
      activeFilter: {
        status: {
          notIn: ['DELETE_ONGOING', 'DELETE_COMPLETE', 'DELETE_ERROR'],
        },
      },
      supportsResourcePolicyV2,
      supportsVfolderV2,
    },
    {
      fetchPolicy: 'store-and-network',
      fetchKey: deferredFetchKey,
    },
  );

  const maxVfolderCount = supportsResourcePolicyV2
    ? myUserResourcePolicyV2?.maxVfolderCount
    : user_resource_policy?.max_vfolder_count;
  const createdCount = supportsVfolderV2
    ? myVfolders?.count
    : legacyCreatedCount;
  const projectCount = supportsVfolderV2
    ? projectVfolders?.count
    : legacyProjectCount;

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        paddingInline: token('--spacing-8'),
        paddingBottom: token('--spacing-4'),
        ...style,
      }}
      {...flexProps}
    >
      <BAIBoardItemTitle title={t('data.FolderStatus')} />
      <BAIRowWrapWithDividers
        rowGap={token('--spacing-8')}
        columnGap={token('--spacing-8')}
        dividerColor={token('--color-border-emphasized')}
        dividerInset={parseFloat(token('--spacing-2'))}
        dividerWidth={parseFloat(token('--border-width'))}
      >
        <BAIPanelItem
          title={t('data.MyFolders')}
          value={createdCount}
          unit={maxVfolderCount ? `/ ${maxVfolderCount}` : undefined}
          style={{
            maxWidth: PANEL_ITEM_MAX_WIDTH,
          }}
          color={token('--color-text-primary')}
        />
        <BAIPanelItem
          title={t('data.ProjectFolders')}
          value={projectCount}
          unit={
            project_resource_policy?.max_vfolder_count
              ? `/ ${project_resource_policy?.max_vfolder_count}`
              : undefined
          }
          style={{
            maxWidth: PANEL_ITEM_MAX_WIDTH,
          }}
          color={token('--color-text-primary')}
        />
        <BAIPanelItem
          title={
            invitationCount > 0 ? (
              // Add <a></a> to make tooltip clickable
              <a
                onClick={() => {
                  onRequestBadgeClick?.();
                }}
              >
                {/* PILOT-DECISION: the antd-arrow-nudging createStyles block
                    (.ant-tooltip-*) is dead CSS after the Astryx Tooltip swap
                    (P6) and was deleted rather than translated; Astryx tooltip
                    placement/alignment covers the intent. antd
                    placement="topRight" -> placement="above" alignment="end". */}
                <Tooltip
                  content={t('data.InvitedFoldersTooltip', {
                    count: invitationCount,
                  })}
                  placement="above"
                  alignment="end"
                >
                  <BAIBadgeCount
                    count={`+${invitationCount}`}
                    // PILOT-DECISION: antd's count Badge was implicitly red;
                    // Astryx Badge defaults to neutral, so the pending-
                    // invitation semantics are restated explicitly (the
                    // per-site colour decision BAIBadgeCount documents).
                    variant="error"
                    offset={[
                      -parseFloat(token('--spacing-2')),
                      -parseFloat(token('--spacing-2')),
                    ]}
                    // As in the antd version: lift the overlay above the
                    // sticky BAIBoardItemTitle band so the pill is not
                    // painted over (the original passed zIndex 50 to Badge).
                    style={{ zIndex: 50 }}
                    title={t('data.InvitedFoldersTooltip', {
                      count: invitationCount,
                    })}
                  >
                    <Text size="lg">{t('data.InvitedFolders')}</Text>
                  </BAIBadgeCount>
                </Tooltip>
              </a>
            ) : (
              <Text size="lg">{t('data.InvitedFolders')}</Text>
            )
          }
          value={
            // PILOT-DECISION: antd fontSizeHeading1 (38px) has no Astryx text
            // step; size="4xl" is the closest on the Astryx ramp.
            <Text size="4xl">{invitedCount}</Text>
          }
          style={{
            maxWidth: PANEL_ITEM_MAX_WIDTH,
          }}
        />
      </BAIRowWrapWithDividers>
    </BAIFlex>
  );
};

export default StorageStatusPanelCard;
