import { StorageStatusPanelKeypairQuery } from '../__generated__/StorageStatusPanelKeypairQuery.graphql';
import { StorageStatusPanelQuery } from '../__generated__/StorageStatusPanelQuery.graphql';
import { addQuotaScopeTypePrefix, usageIndicatorColor } from '../helper';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import FlexActivityIndicator from './FlexActivityIndicator';
import StorageSelect, { VolumeInfo } from './StorageSelect';
import UsageProgress from './UsageProgress';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  Progress,
  Card,
  Descriptions,
  DescriptionsProps,
  Typography,
  Empty,
  Divider,
  Skeleton,
  theme,
  Tooltip,
  Button,
} from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const StorageStatusPanel: React.FC<{
  fetchKey: string;
}> = ({ fetchKey }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();
  const currentUserRole = useCurrentUserRole();

  const [selectedVolumeInfo, setSelectedVolumeInfo] = useState<VolumeInfo>();
  const deferredSelectedVolumeInfo = useDeferredValue(selectedVolumeInfo);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const columnSetting: DescriptionsProps['column'] = {
    xxl: 2,
    xl: 2,
    lg: 2,
    md: 1,
    sm: 1,
    xs: 1,
  };

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
  const projectFolderCount = vfolders?.filter(
    (item: any) =>
      item.ownership_type === 'group' && !isExcludedCount(item.status),
  ).length;
  const invitedCount = vfolders?.filter(
    (item: any) =>
      !item.is_owner &&
      item.ownership_type === 'user' &&
      !isExcludedCount(item.status),
  ).length;

  // TODO: Add resolver to enable subquery and modify to call useLazyLoadQuery only once.
  const {
    user,
    // currentProjectDetail
  } = useLazyLoadQuery<StorageStatusPanelKeypairQuery>(
    graphql`
      query StorageStatusPanelKeypairQuery(
        $domain_name: String
        # $project_id: UUID!
        $email: String
        $access_key: String
      ) {
        keypair(domain_name: $domain_name, access_key: $access_key) {
          resource_policy
        }
        # currentProjectDetail: group(domain_name: $domain_name, id: $project_id){
        #   id
        #   resource_policy @since(version: "23.09.0")
        # }
        user(domain_name: $domain_name, email: $email) {
          id
          # https://github.com/lablup/backend.ai/pull/1354
          resource_policy @since(version: "23.09.0")
        }
      }
    `,
    {
      domain_name: useCurrentDomainValue(),
      email: baiClient?.email,
      access_key: baiClient?._config.accessKey,
      // project_id: currentProject.id,
    },
  );

  const {
    user_resource_policy,
    project_resource_policy,
    project_quota_scope,
    user_quota_scope,
  } = useLazyLoadQuery<StorageStatusPanelQuery>(
    graphql`
      query StorageStatusPanelQuery(
        $user_RP_name: String
        $project_RP_name: String!
        $project_quota_scope_id: String!
        $user_quota_scope_id: String!
        $storage_host_name: String!
        $skipQuotaScope: Boolean!
      ) {
        user_resource_policy(name: $user_RP_name) @since(version: "23.09.6") {
          max_vfolder_count
        }
        project_resource_policy(name: $project_RP_name)
          @since(version: "23.09.1") {
          max_vfolder_count
        }
        project_quota_scope: quota_scope(
          quota_scope_id: $project_quota_scope_id
          storage_host_name: $storage_host_name
        ) @skip(if: $skipQuotaScope) {
          ...UsageProgressFragment_usageFrgmt
        }
        user_quota_scope: quota_scope(
          quota_scope_id: $user_quota_scope_id
          storage_host_name: $storage_host_name
        ) @skip(if: $skipQuotaScope) {
          ...UsageProgressFragment_usageFrgmt
        }
      }
    `,
    {
      user_RP_name: user?.resource_policy,
      project_RP_name: currentProject?.name ?? '',
      project_quota_scope_id: addQuotaScopeTypePrefix(
        'project',
        currentProject?.id,
      ),
      user_quota_scope_id: addQuotaScopeTypePrefix('user', user?.id || ''),
      storage_host_name: deferredSelectedVolumeInfo?.id || '',
      skipQuotaScope:
        currentProject?.id === undefined ||
        user?.id === undefined ||
        !deferredSelectedVolumeInfo?.id,
    },
  );
  // Support version:
  // user resource policy, project resource policy >= 23.09.6
  const maxVfolderCount = user_resource_policy?.max_vfolder_count || 0;

  const numberOfFolderPercent =
    maxVfolderCount || maxVfolderCount === 0
      ? ((maxVfolderCount > 0
          ? ((createdCount / maxVfolderCount) * 100)?.toFixed(2)
          : 0) as number)
      : null;
  const descriptionItems: DescriptionsProps['items'] = [
    {
      key: 'totalFolders',
      label: t('data.NumberOfFolders'),
      children: (
        <>
          {numberOfFolderPercent || numberOfFolderPercent === 0 ? (
            <Progress
              size={[200, 15]}
              percent={numberOfFolderPercent}
              strokeColor={usageIndicatorColor(numberOfFolderPercent)}
              style={{ width: '95%' }}
              status={numberOfFolderPercent >= 100 ? 'exception' : 'normal'}
            />
          ) : null}
          <BAIFlex direction="row" gap={token.marginXXS} wrap="wrap">
            <Typography.Text type="secondary">
              {t('data.Created')}:
            </Typography.Text>
            {createdCount}
            {maxVfolderCount || maxVfolderCount === 0 ? (
              <>
                <Typography.Text type="secondary">{' / '}</Typography.Text>
                <Typography.Text type="secondary">
                  {t('data.Limit')}:
                </Typography.Text>
                {maxVfolderCount === 0 ? '∞' : maxVfolderCount}
              </>
            ) : null}
          </BAIFlex>
          <Divider style={{ margin: '12px auto' }} />
          <BAIFlex direction="row" wrap="wrap" justify="between">
            <BAIFlex gap={token.marginXXS}>
              <Typography.Text type="secondary">
                {t('data.ProjectFolder')}:
              </Typography.Text>
              {projectFolderCount}
              {(currentUserRole === 'admin' ||
                currentUserRole === 'superadmin') &&
              (project_resource_policy?.max_vfolder_count ?? -1) >= 0 ? (
                <>
                  <Typography.Text type="secondary">{' / '}</Typography.Text>
                  <Typography.Text type="secondary">
                    {t('data.Limit')}:
                  </Typography.Text>
                  {project_resource_policy?.max_vfolder_count === 0
                    ? '∞'
                    : project_resource_policy?.max_vfolder_count}
                </>
              ) : null}
            </BAIFlex>
            <BAIFlex gap={token.marginXXS} style={{ marginRight: 30 }}>
              <Typography.Text type="secondary">
                {t('data.Invited')}:
              </Typography.Text>
              {invitedCount}
            </BAIFlex>
          </BAIFlex>
        </>
      ),
    },
    {
      key: 'quotaPerStorageVolume',
      label: (
        <div>
          {t('data.QuotaPerStorageVolume')}
          <Tooltip title={t('data.HostDetails')}>
            <Button type="link" icon={<InfoCircleOutlined />} />
          </Tooltip>
        </div>
      ),
      children: (
        <>
          <BAIFlex
            wrap="wrap"
            justify="between"
            direction="row"
            style={{ minWidth: '25vw' }}
          >
            <Typography.Text type="secondary">{t('data.Host')}</Typography.Text>
            <StorageSelect
              value={selectedVolumeInfo?.id}
              onChange={(__, vInfo) => {
                setSelectedVolumeInfo(vInfo);
              }}
              autoSelectType="usage"
              showUsageStatus
              showSearch
              allowClear
            />
          </BAIFlex>
          {selectedVolumeInfo !== deferredSelectedVolumeInfo ? (
            <FlexActivityIndicator style={{ minHeight: 120 }} />
          ) : selectedVolumeInfo?.capabilities?.includes('quota') ? (
            <>
              <BAIFlex
                style={{ margin: '15px auto' }}
                justify="between"
                wrap="wrap"
              >
                <Typography.Text
                  type="secondary"
                  style={{
                    wordBreak: 'keep-all',
                    wordWrap: 'break-word',
                  }}
                >
                  {t('data.Project')}
                  <br />({currentProject?.name})
                </Typography.Text>
                <UsageProgress
                  usageProgressFrgmt={project_quota_scope || null}
                />
              </BAIFlex>
              <BAIFlex justify="between" wrap="wrap">
                <Typography.Text
                  type="secondary"
                  style={{
                    wordBreak: 'keep-all',
                    wordWrap: 'break-word',
                  }}
                >
                  {t('data.User')}
                  <br />({baiClient?.email})
                </Typography.Text>
                <UsageProgress usageProgressFrgmt={user_quota_scope || null} />
              </BAIFlex>
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('storageHost.QuotaDoesNotSupported')}
              style={{ margin: '25px auto' }}
            />
          )}
        </>
      ),
    },
    {
      key: 'userQuotaScopeId',
      label: t('data.UserQuotaScopeId'),
      children: (
        <Typography.Text copyable>
          {addQuotaScopeTypePrefix('user', user?.id || '')}
        </Typography.Text>
      ),
    },
  ];

  return (
    <Card size="small" title={t('data.StorageStatus')}>
      <Descriptions
        bordered
        column={columnSetting}
        size="small"
        items={descriptionItems}
      />
    </Card>
  );
};

export const StorageStatusPanelFallback = () => {
  const { t } = useTranslation();
  return (
    <Card size="small" title={t('data.StorageStatus')}>
      <Skeleton active />
    </Card>
  );
};

export default StorageStatusPanel;
