import { ResourcePresetListDeleteMutation } from '../__generated__/ResourcePresetListDeleteMutation.graphql';
import {
  ResourcePresetListQuery,
  ResourcePresetListQuery$data,
} from '../__generated__/ResourcePresetListQuery.graphql';
import { ResourcePresetSettingModalFragment$key } from '../__generated__/ResourcePresetSettingModalFragment.graphql';
import { filterNonNullItems, localeCompare, filterEmptyItem } from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import Flex from './Flex';
import NumberWithUnit from './NumberWithUnit';
import ResourceNumber from './ResourceNumber';
import ResourcePresetSettingModal from './ResourcePresetSettingModal';
import {
  ReloadOutlined,
  PlusOutlined,
  SettingOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Tooltip, Button, theme, Table, App, Typography } from 'antd';
import { ColumnType } from 'antd/es/table';
import _ from 'lodash';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type ResourcePreset = NonNullable<
  ResourcePresetListQuery$data['resource_presets']
>[number];

interface ResourcePresetListProps {}

const ResourcePresetList: React.FC<ResourcePresetListProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { modal, message } = App.useApp();
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [resourcePresetsFetchKey, updateResourcePresetsFetchKey] =
    useUpdatableState('initial-fetch');
  const [inFlightResourcePresetName, setInFlightResourcePresetName] =
    useState<string>();
  const [editingResourcePreset, setEditingResourcePreset] =
    useState<ResourcePresetSettingModalFragment$key | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const baiClient = useSuspendedBackendaiClient();

  const { resource_presets } = useLazyLoadQuery<ResourcePresetListQuery>(
    graphql`
      query ResourcePresetListQuery {
        resource_presets {
          name
          resource_slots
          shared_memory
          scaling_group_name @since(version: "25.4.0")
          ...ResourcePresetSettingModalFragment
        }
      }
    `,
    {},
    {
      fetchPolicy:
        resourcePresetsFetchKey === 'initial-fetch'
          ? 'store-and-network'
          : 'network-only',
      fetchKey: resourcePresetsFetchKey,
    },
  );

  const [commitDelete, isInflightDelete] =
    useMutation<ResourcePresetListDeleteMutation>(graphql`
      mutation ResourcePresetListDeleteMutation($name: String!) {
        delete_resource_preset(name: $name) {
          ok
          msg
        }
      }
    `);

  const columns = filterEmptyItem<ColumnType<ResourcePreset>>([
    {
      title: t('resourcePreset.Name'),
      dataIndex: 'name',
      sorter: (a, b) => localeCompare(a?.name, b?.name),
    },
    {
      title: t('resourcePreset.Resources'),
      dataIndex: 'resource_slots',
      render: (text) => (
        <Flex gap="xxs">
          {!_.isEmpty(text)
            ? _.map(JSON.parse(text), (value, key) => (
                <ResourceNumber key={key} type={key} value={value} />
              ))
            : '-'}
        </Flex>
      ),
    },
    {
      title: t('resourcePreset.SharedMemory'),
      dataIndex: 'shared_memory',
      render: (text) => {
        if (!text) {
          return '-';
        }
        return (
          <NumberWithUnit
            numberUnit={text + 'b'}
            targetUnit="g"
            unitType="binary"
          />
        );
      },
    },
    baiClient?.supports('resource-presets-per-resource-group') && {
      title: t('general.ResourceGroup'),
      dataIndex: 'scaling_group_name',
      sorter: (a, b) =>
        localeCompare(a?.scaling_group_name, b?.scaling_group_name),
      render: (text) => text ?? '-',
    },
    {
      title: t('general.Control'),
      key: 'control',
      fixed: 'right',
      render: (text, record) => (
        <Flex align="stretch">
          <Tooltip title={t('button.Edit')}>
            <Button
              type="text"
              size="large"
              icon={<SettingOutlined />}
              style={{
                color: token.colorInfo,
              }}
              onClick={() => {
                if (record) {
                  setEditingResourcePreset(record);
                }
              }}
            />
          </Tooltip>
          <Tooltip title={t('button.Delete')}>
            <Button
              type="text"
              size="large"
              icon={
                <DeleteOutlined
                  style={{
                    color: token.colorError,
                  }}
                />
              }
              loading={
                isInflightDelete &&
                inFlightResourcePresetName ===
                  record?.name + resourcePresetsFetchKey
              }
              disabled={
                isInflightDelete &&
                inFlightResourcePresetName !==
                  record?.name + resourcePresetsFetchKey
              }
              onClick={() => {
                modal.confirm({
                  title: t('resourcePreset.DeleteResourcePreset'),
                  content: (
                    <>
                      {t('resourcePreset.AboutToDeletePreset')}{' '}
                      <Typography.Text strong>{record?.name}</Typography.Text>
                    </>
                  ),
                  onOk: () => {
                    setInFlightResourcePresetName(
                      record?.name + resourcePresetsFetchKey,
                    );
                    commitDelete({
                      variables: {
                        name: record?.name ?? '',
                      },
                      onCompleted: (res, errors) => {
                        if (!res?.delete_resource_preset?.ok) {
                          message.error(res?.delete_resource_preset?.msg);
                        } else if (errors && errors?.length > 0) {
                          const errorMsgList = _.map(
                            errors,
                            (err) => err?.message,
                          );
                          _.forEach(errorMsgList, (err) => message.error(err));
                        } else {
                          message.success(t('resourcePreset.Deleted'));
                          startRefetchTransition(() => {
                            updateResourcePresetsFetchKey();
                          });
                        }
                      },
                      onError: (error) => {
                        message.error(error?.message);
                      },
                    });
                  },
                  okText: t('button.Delete'),
                  okType: 'primary',
                  okButtonProps: {
                    danger: true,
                  },
                });
              }}
            />
          </Tooltip>
        </Flex>
      ),
    },
  ]);

  return (
    <Flex direction="column" align="stretch">
      <Flex
        direction="row"
        gap={'xs'}
        justify="end"
        wrap="wrap"
        style={{
          padding: token.paddingContentVertical,
          paddingLeft: token.paddingContentHorizontalSM,
          paddingRight: token.paddingContentHorizontalSM,
        }}
      >
        <Flex direction="row" gap={'xs'} wrap="wrap" style={{ flexShrink: 1 }}>
          <Tooltip title={t('button.Refresh')}>
            <Button
              icon={<ReloadOutlined />}
              loading={isRefetchPending}
              onClick={() => {
                startRefetchTransition(() => {
                  updateResourcePresetsFetchKey();
                });
              }}
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsCreating(true);
            }}
          >
            {t('resourcePreset.CreatePreset')}
          </Button>
        </Flex>
      </Flex>
      <Table
        rowKey={'name'}
        dataSource={filterNonNullItems(resource_presets)}
        scroll={{ x: 'max-content' }}
        pagination={false}
        showSorterTooltip={false}
        columns={columns}
      />
      <Suspense fallback={null}>
        <ResourcePresetSettingModal
          resourcePresetFrgmt={editingResourcePreset}
          open={!!editingResourcePreset || isCreating}
          onRequestClose={(success) => {
            setEditingResourcePreset(null);
            setIsCreating(false);
            if (success) {
              startRefetchTransition(() => {
                updateResourcePresetsFetchKey();
              });
            }
          }}
          existingResourcePresetNames={
            _.map(resource_presets, (preset) => preset?.name) as Array<string>
          }
        />
      </Suspense>
    </Flex>
  );
};

export default ResourcePresetList;
