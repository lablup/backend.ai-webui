/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { StorageStatusPanelCardQuery } from '../__generated__/StorageStatusPanelCardQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import BAIPanelItem from './BAIPanelItem';
import { useUpdateEffect } from 'ahooks';
import { Badge, theme, Tooltip, Typography } from 'antd';
import { createStyles } from 'antd-style';
import {
  BAIBoardItemTitle,
  BAIFlex,
  BAIFlexProps,
  BAIRowWrapWithDividers,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useVFolderInvitations } from 'src/hooks/useVFolderInvitations';

const useStyles = createStyles(({ css, token }) => ({
  invitationTooltip: css`
    .ant-tooltip-arrow {
      right: 0;
      bottom: ${token.size}px;
    }
    .ant-tooltip-content {
      left: ${token.sizeXS}px;
      bottom: ${token.size}px;
    }
  `,
}));

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
  const { token } = theme.useToken();
  const { styles } = useStyles();
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

  const isExcludedCount = (status: string) => {
    return _.includes(
      ['delete-ongoing', 'delete-complete', 'delete-error'],
      status,
    );
  };

  // TODO(FR-2691 v2-migration): the counts below are derived from the legacy
  // REST call `baiClient.vfolder.list()` and then filtered in JS. Migrate to
  // the Strawberry V2 GraphQL `myVfolders` / `projectVfolders` connections
  // (with `filter` + `count`) so the server returns the counts directly.
  //
  // Scoping notes for the V2 rewrite:
  //   - ProjectFolders (`projectCount`): must be scoped to the project
  //     currently selected in the global header project selector (i.e.
  //     `currentProject.id`). `projectVfolders(projectId: …, filter: { ... })`
  //     already takes a required `projectId`, so the count must use that —
  //     not an aggregate across every project the user can see.
  //   - InvitedFolders (`invitedCount`): defer migration. The V2 vfolder
  //     filter input does not yet expose an "invited only / received-share"
  //     predicate, so we cannot reproduce the current `!is_owner &&
  //     ownership_type === 'user'` filter with a single server-side count.
  //     Keep this one on the legacy REST list until the backend adds the
  //     filter field; revisit in a follow-up issue.
  const { data: vfolders } = useSuspenseTanQuery({
    queryKey: ['vfolders', { deferredFetchKey, id: currentProject.id }],
    queryFn: () => {
      if (!currentProject?.id) {
        throw new Error('Project ID is required for StorageStatusPanelCard');
      }
      return baiClient.vfolder.list(currentProject.id);
    },
  });
  // FIXME: vfolder_node query does not provide a information about the vfolder's owner.
  // So, even if we use fragment, we still need to filter the vfolders by each conditions in client side.
  const createdCount = vfolders?.filter(
    (item: any) =>
      item.is_owner &&
      item.ownership_type === 'user' &&
      !isExcludedCount(item.status),
  ).length;
  const projectCount = vfolders?.filter(
    (item: any) =>
      item.ownership_type === 'group' && !isExcludedCount(item.status),
  ).length;
  const invitedCount = vfolders?.filter(
    (item: any) =>
      !item.is_owner &&
      item.ownership_type === 'user' &&
      !isExcludedCount(item.status),
  ).length;

  // TODO(FR-2691 v2-migration): `user_resource_policy` and
  // `project_resource_policy` are legacy (V1) root fields. Port this to the V2
  // schema once it exposes per-user / per-project vfolder count limits.
  const { user_resource_policy, project_resource_policy } =
    useLazyLoadQuery<StorageStatusPanelCardQuery>(
      graphql`
        query StorageStatusPanelCardQuery($name: String!) {
          user_resource_policy {
            max_vfolder_count
          }
          project_resource_policy(name: $name) {
            max_vfolder_count
          }
        }
      `,
      {
        name: currentProject.name,
      },
    );

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        paddingInline: token.paddingXL,
        paddingBottom: token.padding,
        ...style,
      }}
      {...flexProps}
    >
      <BAIBoardItemTitle title={t('data.FolderStatus')} />
      <BAIRowWrapWithDividers
        rowGap={token.marginXL}
        columnGap={token.marginXL}
        dividerColor={token.colorBorder}
        dividerInset={token.marginXS}
        dividerWidth={token.lineWidth}
      >
        <BAIPanelItem
          title={t('data.MyFolders')}
          value={createdCount}
          unit={
            user_resource_policy?.max_vfolder_count
              ? `/ ${user_resource_policy?.max_vfolder_count}`
              : undefined
          }
          style={{
            maxWidth: PANEL_ITEM_MAX_WIDTH,
          }}
          color={token.colorText}
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
          color={token.colorText}
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
                <Tooltip
                  title={t('data.InvitedFoldersTooltip', {
                    count: invitationCount,
                  })}
                  rootClassName={styles.invitationTooltip}
                  placement="topRight"
                >
                  <Badge
                    count={`+${invitationCount}`}
                    offset={[-`${token.sizeXS}`, -`${token.sizeXS}`]}
                  >
                    <Typography.Text
                      style={{ fontSize: token.fontSizeHeading5 }}
                    >
                      {t('data.InvitedFolders')}
                    </Typography.Text>
                  </Badge>
                </Tooltip>
              </a>
            ) : (
              <Typography.Text style={{ fontSize: token.fontSizeHeading5 }}>
                {t('data.InvitedFolders')}
              </Typography.Text>
            )
          }
          value={
            <Typography.Text
              style={{
                fontSize: token.fontSizeHeading1,
              }}
            >
              {invitedCount}
            </Typography.Text>
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
