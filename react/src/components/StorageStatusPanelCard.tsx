import { useSuspendedBackendaiClient } from '../hooks';
import { useVFolderInvitations } from '../hooks/backendai';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import BAICard, { BAICardProps } from './BAICard';
import BAIPanelItem from './BAIPanelItem';
import FolderInvitationResponseModal from './FolderInvitationResponseModal';
import { StorageStatusPanelCardQuery } from './__generated__/StorageStatusPanelCardQuery.graphql';
import { useToggle } from 'ahooks';
import { Badge, Col, Row, theme, Tooltip, Typography } from 'antd';
import { createStyles } from 'antd-style';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

const useStyles = createStyles(({ css, token }) => ({
  invitationTooltip: css`
    .ant-tooltip-arrow {
      right: -${token.sizeXS}px;
      bottom: ${token.size}px;
    }
    .ant-tooltip-content {
      left: ${token.size}px;
      bottom: ${token.size}px;
    }
  `,
}));

interface StorageStatusPanelProps extends BAICardProps {
  fetchKey?: string;
}

const StorageStatusPanelCard: React.FC<StorageStatusPanelProps> = ({
  fetchKey,
  ...cardProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();
  const deferredFetchKey = useDeferredValue(fetchKey);
  const [{ count }] = useVFolderInvitations();
  const [
    isInvitationResponseModalOpen,
    { toggle: toggleInvitationResponseModal },
  ] = useToggle(false);

  const isExcludedCount = (status: string) => {
    return _.includes(
      ['delete-ongoing', 'delete-complete', 'delete-error'],
      status,
    );
  };

  const { data: vfolders } = useSuspenseTanQuery({
    queryKey: ['vfolders', { deferredFetchKey }],
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
      <BAICard {...cardProps} title={t('data.StorageStatus')}>
        <Row gutter={[24, 16]}>
          <Col
            span={8}
            style={{
              borderRight: `1px solid ${token.colorBorderSecondary}`,
              justifyItems: 'center',
            }}
          >
            <BAIPanelItem
              title={t('data.CreatedFolders')}
              value={createdCount}
              unit={
                user_resource_policy?.max_vfolder_count
                  ? `/ ${user_resource_policy?.max_vfolder_count}`
                  : undefined
              }
            />
          </Col>
          <Col
            span={8}
            style={{
              borderRight: `1px solid ${token.colorBorderSecondary}`,
              justifyItems: 'center',
            }}
          >
            <BAIPanelItem
              title={t('data.ProjectFolders')}
              value={projectCount}
              unit={
                project_resource_policy?.max_vfolder_count
                  ? `/ ${project_resource_policy?.max_vfolder_count}`
                  : undefined
              }
            />
          </Col>
          <Col
            span={8}
            style={{
              justifyItems: 'center',
            }}
          >
            <BAIPanelItem
              title={
                <a
                  onClick={() => {
                    toggleInvitationResponseModal();
                  }}
                >
                  <Tooltip
                    title={
                      count > 0
                        ? t('data.InvitedFoldersTooltip', {
                            count: count,
                          })
                        : null
                    }
                    rootClassName={styles.invitationTooltip}
                    placement="topRight"
                  >
                    <Badge
                      count={count > 0 ? `+${count}` : null}
                      offset={[0, -`${token.sizeXS}`]}
                    >
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        {t('data.InvitedFolders')}
                      </Typography.Title>
                    </Badge>
                  </Tooltip>
                </a>
              }
              value={
                <Typography.Text
                  strong
                  style={{
                    fontSize: token.fontSizeHeading1,
                    color: token.Layout?.headerBg,
                  }}
                >
                  {invitedCount}
                </Typography.Text>
              }
            />
          </Col>
        </Row>
      </BAICard>
      <FolderInvitationResponseModal
        open={isInvitationResponseModalOpen}
        onRequestClose={toggleInvitationResponseModal}
      />
    </>
  );
};

export default StorageStatusPanelCard;
