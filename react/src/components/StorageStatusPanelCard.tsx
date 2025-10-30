import { StorageStatusPanelCardQuery } from '../__generated__/StorageStatusPanelCardQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import BAIPanelItem from './BAIPanelItem';
import { useUpdateEffect } from 'ahooks';
import { Badge, theme, Tooltip, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { BAICard, BAICardProps, BAIRowWrapWithDividers } from 'backend.ai-ui';
import _ from 'lodash';
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

interface StorageStatusPanelProps extends BAICardProps {
  fetchKey?: string;
  onRequestBadgeClick?: () => void;
}

const PANEL_ITEM_MAX_WIDTH = 90; // Adjusted max width for panel items

const StorageStatusPanelCard: React.FC<StorageStatusPanelProps> = ({
  fetchKey,
  onRequestBadgeClick,
  ...cardProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();
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

  const { data: vfolders } = useSuspenseTanQuery({
    queryKey: ['vfolders', { deferredFetchKey, id: currentProject?.id }],
    queryFn: () => {
      return baiClient.vfolder.list(currentProject?.id);
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
        name: currentProject?.name,
      },
    );

  return (
    <>
      <BAICard {...cardProps} title={t('data.FolderStatus')}>
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
                // eslint-disable-next-line
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
      </BAICard>
    </>
  );
};

export default StorageStatusPanelCard;
