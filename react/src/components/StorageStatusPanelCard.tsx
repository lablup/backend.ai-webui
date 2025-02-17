import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import BAICard, { BAICardProps } from './BAICard';
import BAIPanelItem from './BAIPanelItem';
import Flex from './Flex';
import { Divider } from 'antd';
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
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();
  const currentUserRole = useCurrentUserRole();
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

  return (
    <BAICard title={t('data.StorageStatus')} {...cardProps}>
      <Flex gap={'md'} wrap="wrap">
        <BAIPanelItem title={t('data.CreatedFolders')} value={createdCount} />
        <BAIPanelItem title={t('data.ProjectFolders')} value={projectCount} />
        <BAIPanelItem title={t('data.InvitedFolders')} value={invitedCount} />
      </Flex>
    </BAICard>
  );
};

export default StorageStatusPanelCard;
