import { filterNonNullItems, iSizeToSize, localeCompare } from '../helper';
import { useUpdatableState } from '../hooks';
import Flex from './Flex';
import ResourceNumber from './ResourceNumber';
import ResourcePresetSettingModal from './ResourcePresetSettingModal';
import { ResourcePresetListDeleteMutation } from './__generated__/ResourcePresetListDeleteMutation.graphql';
import { ResourcePresetListQuery } from './__generated__/ResourcePresetListQuery.graphql';
import { ResourcePresetSettingModalFragment$key } from './__generated__/ResourcePresetSettingModalFragment.graphql';
import {
  ReloadOutlined,
  PlusOutlined,
  SettingOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Tooltip, Button, theme, Table, App, Typography } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery, useMutation } from 'react-relay';

interface ResourcePresetListProps {}

const ResourcePresetList: React.FC<ResourcePresetListProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [resourcePresetsFetchKey, updateResourcePresetsFetchKey] =
    useUpdatableState('initial-fetch');
  const [inFlightResourcePresetName, setInFlightResourcePresetName] =
    useState<string>();
  const [editingResourcePreset, setEditingResourcePreset] =
    useState<ResourcePresetSettingModalFragment$key | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { resource_presets } = useLazyLoadQuery<ResourcePresetListQuery>(
    graphql`
      query ResourcePresetListQuery {
        resource_presets {
          name
          resource_slots
          shared_memory
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
        sortDirections={['descend', 'ascend', 'descend']}
        showSorterTooltip={false}
        columns={[
          {
            title: t('resourcePreset.Name'),
            dataIndex: 'name',
            sorter: (a, b) => localeCompare(a.name, b.name),
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
            render: (text) =>
              text ? iSizeToSize(text + '', 'g')?.number : '-',
            sorter: (a, b) => a.shared_memory - b.shared_memory,
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
                      setEditingResourcePreset(record);
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
                            <Typography.Text strong>
                              {record?.name}
                            </Typography.Text>
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
                            onCompleted: () => {
                              startRefetchTransition(() => {
                                updateResourcePresetsFetchKey();
                              });
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
        ]}
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
