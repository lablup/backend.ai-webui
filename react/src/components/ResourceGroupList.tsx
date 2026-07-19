/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupListDeleteMutation } from '../__generated__/ResourceGroupListDeleteMutation.graphql';
import {
  ResourceGroupListQuery,
  ResourceGroupListQuery$data,
} from '../__generated__/ResourceGroupListQuery.graphql';
import { ResourceGroupListUpdateMutation } from '../__generated__/ResourceGroupListUpdateMutation.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useSFTPProxyResourceGroupsQuery } from '../hooks/useSFTPResourceGroups';
import BAIRadioGroup from './BAIRadioGroup';
import ResourceGroupInfoModal from './ResourceGroupInfoModal';
import ResourceGroupSettingModal from './ResourceGroupSettingModal';
import UpdateResourceGroupsModal from './UpdateResourceGroupsModal';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteFilled,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { App, Tag, Tooltip, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  useUpdatableState,
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAIButton,
  BAITable,
  BAIFlex,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAINameActionCell,
  BAIQuestionIconWithTooltip,
  BAISelectionLabel,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { BanIcon, PlusIcon, SquarePenIcon, UndoIcon } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { PayloadError } from 'relay-runtime';

export interface ScalingGroupOpts {
  allowed_session_types: ('interactive' | 'batch' | 'inference')[];
  pending_timeout: number;
  config: Record<string, any>;
  agent_selection_strategy: ('dispersed' | 'concentrated')[];
  agent_selector_config: Record<string, any>;
  enforce_spreading_endpoint_replica: boolean;
}

type ResourceGroup = NonNullable<
  NonNullable<
    NonNullable<ResourceGroupListQuery$data>['scaling_groups']
  >[number]
>;

const ResourceGroupList: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const baiClient = useSuspendedBackendaiClient();
  const [activeType, setActiveType] = useState<'active' | 'inactive'>('active');
  const [openCreateModal, { toggle: toggleOpenCreateModal }] = useToggle(false);
  const [openInfoModal, { toggle: toggleOpenInfoModal }] = useToggle(false);
  const [openSFTPModal, setOpenSFTPModal] = useState(false);
  const [selectedResourceGroup, setSelectedResourceGroup] =
    useState<ResourceGroup>();
  const [selectedResourceGroupName, setSelectedResourceGroupName] =
    useState<string>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.ResourceGroupList',
  );
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  // Read the `proxy -> resource group names` map from etcd (superadmin-only),
  // non-blocking (the table renders without waiting on it) and invalidated on
  // every SFTP write so it stays fresh. Inverted to `group name -> proxies`
  // to show, per row, which storage proxies handle that group's SFTP.
  const { data: proxyResourceGroups } = useSFTPProxyResourceGroupsQuery({
    enabled: baiClient.is_superadmin,
  });
  const proxiesByGroupName = _.mapValues(
    _.groupBy(
      _.flatMap(_.entries(proxyResourceGroups ?? {}), ([proxy, groupNames]) =>
        _.map(groupNames, (groupName) => ({ proxy, groupName })),
      ),
      'groupName',
    ),
    (pairs) => _.map(pairs, 'proxy'),
  );
  const [isActiveTypePending, startActiveTypeTransition] = useTransition();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const { scaling_groups } = useLazyLoadQuery<ResourceGroupListQuery>(
    graphql`
      query ResourceGroupListQuery($is_active: Boolean) {
        scaling_groups(is_active: $is_active) {
          name
          description
          is_active
          is_public
          driver
          scheduler
          wsproxy_addr

          ...ResourceGroupInfoModalFragment
          ...ResourceGroupSettingModalFragment
        }
      }
    `,
    {
      is_active: activeType === 'active',
    },
    {
      fetchPolicy: 'store-and-network',
      fetchKey,
    },
  );

  const [commitUpdateResourceGroup] =
    useMutation<ResourceGroupListUpdateMutation>(graphql`
      mutation ResourceGroupListUpdateMutation(
        $name: String!
        $input: ModifyScalingGroupInput!
      ) {
        modify_scaling_group(name: $name, props: $input) {
          ok
          msg
        }
      }
    `);

  const [commitDeleteResourceGroup, isInflightCommitDeleteResourceGroup] =
    useMutation<ResourceGroupListDeleteMutation>(graphql`
      mutation ResourceGroupListDeleteMutation($name: String!) {
        delete_scaling_group(name: $name) {
          ok
          msg
        }
      }
    `);

  const columns: ColumnsType<ResourceGroup> = filterOutEmpty([
    {
      key: 'name',
      title: t('resourceGroup.Name'),
      dataIndex: 'name',
      render: (name: string, record: ResourceGroup) => (
        <BAINameActionCell
          title={name}
          showActions="always"
          actions={[
            {
              key: 'info',
              title: t('button.Info'),
              icon: <InfoCircleOutlined />,
              onClick: () => {
                setSelectedResourceGroup(record);
                toggleOpenInfoModal();
              },
            },
            {
              key: 'edit',
              title: t('button.Edit'),
              icon: <SquarePenIcon />,
              onClick: () => {
                setSelectedResourceGroup(record);
                toggleOpenCreateModal();
              },
            },
            {
              key: 'activate-deactivate',
              title: record.is_active
                ? t('resourceGroup.Deactivate')
                : t('resourceGroup.Activate'),
              icon: record.is_active ? <BanIcon /> : <UndoIcon />,
              type: record.is_active ? 'danger' : 'default',
              popConfirm: {
                title: record.is_active
                  ? t('resourceGroup.DeactivateResourceGroup')
                  : t('resourceGroup.ActivateResourceGroup'),
                description: record?.name,
                okButtonProps: {
                  danger: !!record.is_active,
                },
                okText: record.is_active
                  ? t('resourceGroup.Deactivate')
                  : t('resourceGroup.Activate'),
                cancelText: t('button.Cancel'),
                onConfirm: () => {
                  return new Promise<void>((resolve) => {
                    commitUpdateResourceGroup({
                      variables: {
                        name: record.name ?? '',
                        input: {
                          is_active: !record.is_active,
                        },
                      },
                      onCompleted: ({ modify_scaling_group: res }, errors) => {
                        if (!res?.ok) {
                          message.error(res?.msg);
                          resolve();
                          return;
                        }
                        if (errors && errors.length > 0) {
                          const errorMsgList = _.map(
                            errors,
                            (error: PayloadError) => error.message,
                          );
                          for (const error of errorMsgList) {
                            message.error(error);
                          }
                          resolve();
                          return;
                        }
                        message.success(
                          t('resourceGroup.ResourceGroupModified'),
                        );
                        startRefetchTransition(() => {
                          updateFetchKey();
                        });
                        resolve();
                      },
                      onError: (err) => {
                        message.error(err.message);
                        resolve();
                      },
                    });
                  });
                },
              },
            },
            // Deletion is only offered for deactivated groups (Inactive tab);
            // active groups are deactivated first.
            ...(activeType === 'inactive'
              ? [
                  {
                    key: 'delete',
                    title: t('button.Delete'),
                    icon: <DeleteFilled />,
                    type: 'danger' as const,
                    onClick: () => {
                      setSelectedResourceGroupName(record?.name || '');
                    },
                  },
                ]
              : []),
          ]}
        />
      ),
    },
    {
      key: 'description',
      title: t('resourceGroup.Description'),
      dataIndex: 'description',
      render: (value) => value || '-',
    },
    {
      key: 'is_public',
      title: t('resourceGroup.Public'),
      dataIndex: 'is_public',
      render: (value) => {
        return value ? (
          <CheckOutlined style={{ color: token.colorSuccess }} />
        ) : (
          <CloseOutlined style={{ color: token.colorTextSecondary }} />
        );
      },
    },
    {
      key: 'sftp',
      title: (
        <BAIFlex gap="xxs">
          {t('storageProxy.SFTPStorageProxies')}
          <BAIQuestionIconWithTooltip
            title={t('storageProxy.SFTPStorageProxiesDescription')}
          />
        </BAIFlex>
      ),
      // Reading the assignment needs superadmin (raw etcd), so only they see it.
      hidden: !baiClient.is_superadmin,
      render: (_value, record) => {
        const proxies = record.name
          ? (proxiesByGroupName[record.name] ?? [])
          : [];
        return proxies.length > 0 ? (
          <BAIFlex gap="xxs" wrap="wrap">
            {_.map(proxies, (proxy) => (
              <Tag key={proxy} color="blue">
                {proxy}
              </Tag>
            ))}
          </BAIFlex>
        ) : (
          '-'
        );
      },
    },
    {
      key: 'driver',
      title: t('resourceGroup.Driver'),
      dataIndex: 'driver',
    },
    {
      key: 'scheduler',
      title: t('resourceGroup.Scheduler'),
      dataIndex: 'scheduler',
      render: (value) => _.toUpper(value),
    },
    {
      key: 'wsproxy_addr',
      title: t('resourceGroup.AppProxyAddress'),
      dataIndex: 'wsproxy_addr',
      render: (value) => value || '-',
    },
  ]);

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify="between">
        <BAIRadioGroup
          value={activeType}
          onChange={(value) => {
            startActiveTypeTransition(() => {
              setActiveType(value.target.value);
              setSelectedRowKeys([]);
            });
          }}
          optionType="button"
          options={[
            {
              label: t('general.Active'),
              value: 'active',
            },
            {
              label: t('general.Inactive'),
              value: 'inactive',
            },
          ]}
        />
        <BAIFlex gap="xs">
          {baiClient.is_superadmin && selectedRowKeys.length > 0 && (
            <BAIFlex align="center" gap="xs">
              <BAISelectionLabel
                count={selectedRowKeys.length}
                onClearSelection={() => setSelectedRowKeys([])}
              />
              <Tooltip title={t('general.BulkEdit')}>
                <BAIButton
                  icon={<SquarePenIcon style={{ color: token.colorInfo }} />}
                  style={{ backgroundColor: token.colorInfoBg }}
                  onClick={() => setOpenSFTPModal(true)}
                />
              </Tooltip>
            </BAIFlex>
          )}
          <BAIFetchKeyButton
            loading={isPendingRefetch}
            value={fetchKey}
            onChange={() => {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }}
          />
          <BAIButton
            type="primary"
            icon={<PlusIcon />}
            onClick={() => toggleOpenCreateModal()}
          >
            {t('resourceGroup.CreateResourceGroup')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>

      <BAITable
        rowKey={'name'}
        resizable
        size="small"
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={filterOutNullAndUndefined(scaling_groups)}
        loading={isActiveTypePending}
        rowSelection={
          baiClient.is_superadmin
            ? {
                type: 'checkbox',
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
              }
            : undefined
        }
        tableSettings={{
          columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
      />

      <BAIDeleteConfirmModal
        open={!!selectedResourceGroupName}
        title={t('resourceGroup.DeleteResourceGroup')}
        target={t('general.ResourceGroup')}
        items={
          selectedResourceGroupName
            ? [
                {
                  key: selectedResourceGroupName,
                  label: selectedResourceGroupName,
                },
              ]
            : []
        }
        requireConfirmInput
        onOk={() => {
          commitDeleteResourceGroup({
            variables: {
              name: selectedResourceGroupName ?? '',
            },
            onCompleted: ({ delete_scaling_group: res }, errors) => {
              if (!res?.ok) {
                message.error(res?.msg);
                return;
              }
              if (errors && errors.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error);
                }
                return;
              }
              message.success(t('resourceGroup.ResourceGroupDeleted'));
              setSelectedResourceGroupName(undefined);
              startRefetchTransition(() => {
                updateFetchKey();
              });
            },
            onError: (err) => {
              message.error(err.message);
            },
          });
        }}
        okButtonProps={{ loading: isInflightCommitDeleteResourceGroup }}
        onCancel={() => {
          setSelectedResourceGroupName(undefined);
        }}
      />
      <ResourceGroupInfoModal
        open={openInfoModal && !!selectedResourceGroup}
        resourceGroupFrgmt={selectedResourceGroup}
        onRequestClose={() => {
          toggleOpenInfoModal();
          setSelectedResourceGroup(undefined);
        }}
      />
      <ResourceGroupSettingModal
        open={openCreateModal}
        resourceGroupFrgmt={selectedResourceGroup}
        onRequestClose={(success) => {
          toggleOpenCreateModal();
          setSelectedResourceGroup(undefined);

          if (success) {
            startRefetchTransition(() => {
              updateFetchKey();
            });
          }
        }}
      />
      <BAIUnmountAfterClose>
        <UpdateResourceGroupsModal
          open={openSFTPModal}
          resourceGroupNames={selectedRowKeys as string[]}
          onRequestClose={(success) => {
            setOpenSFTPModal(false);
            if (success) {
              setSelectedRowKeys([]);
            }
          }}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default ResourceGroupList;
