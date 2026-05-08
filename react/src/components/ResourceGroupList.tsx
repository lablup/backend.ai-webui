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
import BAIRadioGroup from './BAIRadioGroup';
import ResourceGroupInfoModal from './ResourceGroupInfoModal';
import ResourceGroupSettingModal from './ResourceGroupSettingModal';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteFilled,
  InfoCircleOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Alert, App, Button, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  useUpdatableState,
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAITable,
  BAIFlex,
  BAIConfirmModalWithInput,
  BAIFetchKeyButton,
  BAINameActionCell,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { BanIcon, UndoIcon } from 'lucide-react';
import { useState, useTransition } from 'react';
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
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const [activeType, setActiveType] = useState<'active' | 'inactive'>('active');
  const [openCreateModal, { toggle: toggleOpenCreateModal }] = useToggle(false);
  const [openInfoModal, { toggle: toggleOpenInfoModal }] = useToggle(false);
  const [selectedResourceGroup, setSelectedResourceGroup] =
    useState<ResourceGroup>();
  const [selectedResourceGroupName, setSelectedResourceGroupName] =
    useState<string>();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
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
              key: 'settings',
              title: t('button.Settings'),
              icon: <SettingOutlined />,
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
              onClick: () => {
                modal.confirm({
                  title: record.is_active
                    ? t('resourceGroup.DeactivateResourceGroup')
                    : t('resourceGroup.ActivateResourceGroup'),
                  content: record?.name,
                  okType: record.is_active ? 'danger' : 'primary',
                  okText: record.is_active
                    ? t('resourceGroup.Deactivate')
                    : t('resourceGroup.Activate'),
                  onOk: () => {
                    return new Promise<void>((resolve) => {
                      commitUpdateResourceGroup({
                        variables: {
                          name: record.name ?? '',
                          input: {
                            is_active: !record.is_active,
                          },
                        },
                        onCompleted: (
                          { modify_scaling_group: res },
                          errors,
                        ) => {
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
                });
              },
            },
            {
              key: 'delete',
              title: t('button.Delete'),
              icon: <DeleteFilled />,
              type: 'danger',
              onClick: () => {
                setSelectedResourceGroupName(record?.name || '');
              },
            },
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
        <BAIFlex gap="sm">
          <BAIFetchKeyButton
            loading={isPendingRefetch}
            value={fetchKey}
            onChange={() => {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => toggleOpenCreateModal()}
          >
            {t('button.Create')}
          </Button>
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
      />

      <BAIConfirmModalWithInput
        open={!!selectedResourceGroupName}
        title={t('resourceGroup.DeleteResourceGroup')}
        content={
          <BAIFlex
            direction="column"
            gap="md"
            align="stretch"
            style={{ marginBottom: token.marginXS, width: '100%' }}
          >
            <Alert
              type="warning"
              title={t('dialog.warning.DeleteForeverDesc')}
              style={{ width: '100%' }}
            />
            <BAIFlex>
              <Typography.Text style={{ marginRight: token.marginXXS }}>
                {t('resourceGroup.TypeResourceGroupNameToDelete')}
              </Typography.Text>
              (
              <Typography.Text code>
                {selectedResourceGroupName}
              </Typography.Text>
              )
            </BAIFlex>
          </BAIFlex>
        }
        confirmText={selectedResourceGroupName ?? ''}
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
    </BAIFlex>
  );
};

export default ResourceGroupList;
