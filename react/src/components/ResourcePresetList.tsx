/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourcePresetListDeleteMutation } from '../__generated__/ResourcePresetListDeleteMutation.graphql';
import {
  ResourcePresetListQuery,
  ResourcePresetListQuery$data,
} from '../__generated__/ResourcePresetListQuery.graphql';
import { ResourcePresetSettingModalFragment$key } from '../__generated__/ResourcePresetSettingModalFragment.graphql';
import { localeCompare } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import ResourcePresetSettingModal from './ResourcePresetSettingModal';
import {
  ReloadOutlined,
  PlusOutlined,
  SettingOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  Tooltip,
  Button,
  App,
  Typography,
  TableColumnsType,
  Alert,
  theme,
} from 'antd';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAITable,
  BAIFlex,
  BAINumberWithUnit,
  useUpdatableState,
  BAIResourceNumberWithIcon,
  BAINameActionCell,
  BAIConfirmModalWithInput,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type ResourcePreset = NonNullable<
  NonNullable<ResourcePresetListQuery$data['resource_presets']>[number]
>;

interface ResourcePresetListProps {}

const ResourcePresetList: React.FC<ResourcePresetListProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [resourcePresetsFetchKey, updateResourcePresetsFetchKey] =
    useUpdatableState('initial-fetch');
  const [editingResourcePreset, setEditingResourcePreset] =
    useState<ResourcePresetSettingModalFragment$key | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingPresetName, setDeletingPresetName] = useState<string | null>(
    null,
  );
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

  const [commitDelete, isDeleteInFlight] =
    useMutation<ResourcePresetListDeleteMutation>(graphql`
      mutation ResourcePresetListDeleteMutation($name: String!) {
        delete_resource_preset(name: $name) {
          ok
          msg
        }
      }
    `);

  const columns: TableColumnsType<ResourcePreset> = filterOutEmpty([
    {
      title: t('resourcePreset.Name'),
      dataIndex: 'name',
      sorter: (a, b) => localeCompare(a?.name, b?.name),
      render: (name: string, record) => (
        <BAINameActionCell
          title={name}
          showActions="always"
          actions={[
            {
              key: 'edit',
              title: t('button.Edit'),
              icon: <SettingOutlined />,
              onClick: () => {
                if (record) {
                  setEditingResourcePreset(record);
                }
              },
            },
            {
              key: 'delete',
              title: t('button.Delete'),
              icon: <DeleteOutlined />,
              type: 'danger',
              onClick: () => {
                setDeletingPresetName(record?.name ?? null);
              },
            },
          ]}
        />
      ),
    },
    {
      title: t('resourcePreset.Resources'),
      dataIndex: 'resource_slots',
      render: (text) => (
        <BAIFlex gap="xxs">
          {!_.isEmpty(text)
            ? _.map(JSON.parse(text), (value, key) => (
                <BAIResourceNumberWithIcon key={key} type={key} value={value} />
              ))
            : '-'}
        </BAIFlex>
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
          <BAINumberWithUnit
            numberUnit={text}
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
  ]);

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" gap={'xs'} justify="end" wrap="wrap">
        <BAIFlex
          direction="row"
          gap={'xs'}
          wrap="wrap"
          style={{ flexShrink: 1 }}
        >
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
        </BAIFlex>
      </BAIFlex>
      <BAITable
        rowKey={'name'}
        dataSource={filterOutNullAndUndefined(resource_presets)}
        scroll={{ x: 'max-content' }}
        showSorterTooltip={false}
        columns={columns}
      />
      <BAIConfirmModalWithInput
        open={!!deletingPresetName}
        title={t('resourcePreset.DeleteResourcePreset')}
        content={
          <BAIFlex direction="column" gap="md" align="stretch">
            <Alert type="warning" title={t('dialog.warning.CannotBeUndone')} />
            <BAIFlex>
              <Typography.Text style={{ marginRight: token.marginXXS }}>
                {t('dialog.TypeNameToConfirmDeletion')}
              </Typography.Text>
              (<Typography.Text code>{deletingPresetName}</Typography.Text>)
            </BAIFlex>
          </BAIFlex>
        }
        confirmText={deletingPresetName ?? ''}
        inputProps={{ placeholder: deletingPresetName ?? '' }}
        okText={t('button.Delete')}
        okButtonProps={{ loading: isDeleteInFlight }}
        onOk={() => {
          commitDelete({
            variables: {
              name: deletingPresetName ?? '',
            },
            onCompleted: (res, errors) => {
              if (!res?.delete_resource_preset?.ok) {
                message.error(res?.delete_resource_preset?.msg);
              } else if (errors && errors?.length > 0) {
                const errorMsgList = _.map(errors, (err) => err?.message);
                _.forEach(errorMsgList, (err) => message.error(err));
              } else {
                message.success(t('resourcePreset.Deleted'));
                startRefetchTransition(() => {
                  updateResourcePresetsFetchKey();
                });
              }
              setDeletingPresetName(null);
            },
            onError: (error) => {
              message.error(error?.message);
              setDeletingPresetName(null);
            },
          });
        }}
        onCancel={() => setDeletingPresetName(null)}
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
    </BAIFlex>
  );
};

export default ResourcePresetList;
