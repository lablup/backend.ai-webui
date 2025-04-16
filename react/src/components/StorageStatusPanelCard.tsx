import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import BAICard, { BAICardProps } from './BAICard';
import BAIPanelItem from './BAIPanelItem';
import { StorageStatusPanelCardQuery } from './__generated__/StorageStatusPanelCardQuery.graphql';
import { Col, Row, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface StorageStatusPanelProps extends BAICardProps {
  fetchKey?: string;
}

const StorageStatusPanelCard: React.FC<StorageStatusPanelProps> = ({
  fetchKey,
  ...cardProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();
  const deferredFetchKey = useDeferredValue(fetchKey);

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
            title={t('data.MyFolders')}
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
          <BAIPanelItem title={t('data.InvitedFolders')} value={invitedCount} />
        </Col>
      </Row>
    </BAICard>
  );
};

export default StorageStatusPanelCard;
