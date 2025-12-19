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
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Alert,
  App,
  Button,
  Popconfirm,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  useUpdatableState,
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAITable,
  BAIFlex,
  BAIConfirmModalWithInput,
  BAIFetchKeyButton,
} from 'backend.ai-ui';
import _ from 'lodash';
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
  const { message } = App.useApp();
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

  const [commitUpdateResourceGroup, isInflightCommitUpdateResourceGroup] =
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
      title: t('resourceGroup.WsproxyAddress'),
      dataIndex: 'wsproxy_addr',
      render: (value) => value || '-',
    },
    {
      key: 'controls',
      title: t('general.Control'),
      fixed: 'right',
      render: (_, record) => {
        return (
          <BAIFlex>
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              style={{ color: token.colorSuccess }}
              onClick={() => {
                setSelectedResourceGroup(record);
                toggleOpenInfoModal();
              }}
            />
            <Button
              type="text"
              icon={<SettingOutlined />}
              style={{
                color: token.colorInfo,
              }}
              onClick={() => {
                setSelectedResourceGroup(record);
                toggleOpenCreateModal();
              }}
            />
            <Tooltip
              title={
                record.is_active
                  ? t('resourceGroup.Deactivate')
                  : t('resourceGroup.Activate')
              }
            >
              <Popconfirm
                title={
                  record.is_active
                    ? t('resourceGroup.DeactivateResourceGroup')
                    : t('resourceGroup.ActivateResourceGroup')
                }
                placement="left"
                okType={record.is_active ? 'danger' : 'primary'}
                okText={
                  record.is_active
                    ? t('resourceGroup.Deactivate')
                    : t('resourceGroup.Activate')
                }
                description={record?.name}
                onConfirm={() => {
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
                        return;
                      }
                      message.success(t('resourceGroup.ResourceGroupModified'));
                      startRefetchTransition(() => {
                        updateFetchKey();
                      });
                    },
                    onError: (err) => {
                      message.error(err.message);
                    },
                  });
                }}
              >
                <Button
                  type="text"
                  danger={!!record.is_active}
                  icon={record.is_active ? <BanIcon /> : <UndoIcon />}
                  loading={isInflightCommitUpdateResourceGroup}
                />
              </Popconfirm>
            </Tooltip>
            <Tooltip title={t('button.Delete')}>
              <Button
                type="text"
                icon={
                  <DeleteOutlined
                    style={{
                      color: token.colorError,
                    }}
                  />
                }
                onClick={() => {
                  setSelectedResourceGroupName(record?.name || '');
                }}
              />
            </Tooltip>
          </BAIFlex>
        );
      },
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
              message={t('dialog.warning.DeleteForeverDesc')}
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
