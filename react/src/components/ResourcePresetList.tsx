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
  const [deletingPreset, setDeletingPreset] = useState<ResourcePreset | null>(
    null,
  );

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
                setDeletingPreset(record ?? null);
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
        rowKey="id"
        dataSource={filterOutNullAndUndefined(resource_presets)}
        columns={columns}
      />
      <BAIDeleteConfirmModal
        open={!!deletingPreset}
        title={t('resourcePreset.DeleteResourcePreset')}
        target={t('resourcePreset.ResourcePreset')}
        items={
          deletingPreset
            ? [
                {
                  key: deletingPreset.id ?? '',
                  label: deletingPreset.name,
                },
              ]
            : []
        }
        confirmText={deletingPreset?.name ?? ''}
        requireConfirmInput
        inputProps={{ placeholder: deletingPreset?.name ?? '' }}
        okButtonProps={{ loading: isDeleteInFlight }}
        onOk={() => {
          if (!deletingPreset?.id) {
            return;
          }
          commitDelete({
            variables: { id: deletingPreset.id },
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
              setDeletingPreset(null);
            },
            onError: (error) => {
              message.error(error?.message);
              setDeletingPreset(null);
            },
          });
        }}
        onCancel={() => setDeletingPreset(null)}
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
