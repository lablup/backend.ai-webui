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
import { App } from '../app-shim';
import { localeCompare } from '../helper';
import { reasonMessage } from '../helper/mutationError';
import ResourcePresetSettingModal from './ResourcePresetSettingModal';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  filterOutNullAndUndefined,
  BAITable,
  BAIFlex,
  BAINumberWithUnit,
  useUpdatableState,
  BAIResourceNumberWithIcon,
  BAINameActionCell,
  BAIDeleteConfirmModal,
  type BAIColumnsType,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { RotateCw, Trash2, PlusIcon, SquarePenIcon } from 'lucide-react';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type ResourcePreset = NonNullable<
  NonNullable<ResourcePresetListQuery$data['resource_presets']>[number]
>;

interface ResourcePresetListProps {}

const ResourcePresetList: React.FC<ResourcePresetListProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [resourcePresetsFetchKey, updateResourcePresetsFetchKey] =
    useUpdatableState('initial-fetch');
  const [editingResourcePreset, setEditingResourcePreset] =
    useState<ResourcePresetSettingModalFragment$key | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null);

  const { resource_presets } = useLazyLoadQuery<ResourcePresetListQuery>(
    graphql`
      query ResourcePresetListQuery {
        resource_presets {
          id
          name
          resource_slots
          shared_memory
          scaling_group_name
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
  const presets = filterOutNullAndUndefined(resource_presets);

  const [commitDelete, isDeleteInFlight] =
    useMutation<ResourcePresetListDeleteMutation>(graphql`
      mutation ResourcePresetListDeleteMutation($id: UUID!) {
        delete_resource_preset(id: $id) {
          ok
          msg
        }
      }
    `);

  const columns: BAIColumnsType<ResourcePreset> = [
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
              icon: <SquarePenIcon />,
              onClick: () => {
                if (record) {
                  setEditingResourcePreset(record);
                }
              },
            },
            {
              key: 'delete',
              title: t('button.Delete'),
              icon: <Trash2 size="1em" />,
              type: 'danger',
              onClick: () => {
                setDeletingPresetId(record?.id ?? null);
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
    {
      title: t('general.ResourceGroup'),
      dataIndex: 'scaling_group_name',
      sorter: (a, b) =>
        localeCompare(a?.scaling_group_name, b?.scaling_group_name),
      render: (text) => text ?? '-',
    },
  ];

  const deletingPresetName =
    _.find(presets, (preset) => preset.id === deletingPresetId)?.name ?? '';

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" gap={'xs'} justify="end" wrap="wrap">
        <BAIFlex
          direction="row"
          gap={'xs'}
          wrap="wrap"
          style={{ flexShrink: 1 }}
        >
          <IconButton
            label={t('button.Refresh')}
            tooltip={t('button.Refresh')}
            icon={<RotateCw size="1em" />}
            isLoading={isRefetchPending}
            onClick={() => {
              startRefetchTransition(() => {
                updateResourcePresetsFetchKey();
              });
            }}
          />
          <Button
            variant="primary"
            icon={<PlusIcon />}
            label={t('resourcePreset.CreatePreset')}
            onClick={() => {
              setIsCreating(true);
            }}
          />
        </BAIFlex>
      </BAIFlex>
      <BAITable
        scroll={{ x: 'max-content' }}
        rowKey="id"
        dataSource={presets}
        columns={columns}
      />
      <BAIDeleteConfirmModal
        open={!!deletingPresetId}
        title={t('resourcePreset.DeleteResourcePreset')}
        target={t('resourcePreset.ResourcePreset')}
        items={
          deletingPresetId
            ? [{ key: deletingPresetId, label: deletingPresetName }]
            : []
        }
        confirmText={deletingPresetName}
        requireConfirmInput
        inputProps={{ placeholder: deletingPresetName }}
        okButtonProps={{ loading: isDeleteInFlight }}
        onOk={() => {
          if (!deletingPresetId) {
            return;
          }
          commitDelete({
            variables: { id: deletingPresetId },
            onCompleted: (_res, errors) => {
              if (errors && errors.length > 0) {
                message.error(reasonMessage(errors));
              } else {
                message.success(t('resourcePreset.Deleted'));
                startRefetchTransition(() => {
                  updateResourcePresetsFetchKey();
                });
                setDeletingPresetId(null);
              }
            },
            onError: (error) => {
              message.error(error?.message);
            },
          });
        }}
        onCancel={() => setDeletingPresetId(null)}
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
        />
      </Suspense>
    </BAIFlex>
  );
};

export default ResourcePresetList;
