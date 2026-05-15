/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  AdminDeploymentPresetNodesFragment$data,
  AdminDeploymentPresetNodesFragment$key,
} from '../__generated__/AdminDeploymentPresetNodesFragment.graphql';
import type { AdminDeploymentPresetNodesImagesQuery } from '../__generated__/AdminDeploymentPresetNodesImagesQuery.graphql';
import { DeleteFilled, SettingOutlined } from '@ant-design/icons';
import {
  BAIColumnType,
  BAINameActionCell,
  BAITable,
  BAITableProps,
  filterOutEmpty,
  filterOutNullAndUndefined,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

export type DeploymentPresetNodeInList = NonNullable<
  AdminDeploymentPresetNodesFragment$data[number]
>;

const availablePresetSorterKeys = ['name', 'rank', 'createdAt'] as const;

export const availablePresetSorterValues = [
  ...availablePresetSorterKeys,
  ...availablePresetSorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availablePresetSorterKeys, key);
};

interface AdminDeploymentPresetNodesProps extends Omit<
  BAITableProps<DeploymentPresetNodeInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  presetsFrgmt: AdminDeploymentPresetNodesFragment$key;
  customizeColumns?: (
    baseColumns: BAIColumnType<DeploymentPresetNodeInList>[],
  ) => BAIColumnType<DeploymentPresetNodeInList>[];
  disableSorter?: boolean;
  onEdit?: (preset: DeploymentPresetNodeInList) => void;
  onDelete?: (preset: DeploymentPresetNodeInList) => void;
  onChangeOrder?: (
    order: (typeof availablePresetSorterValues)[number] | null,
  ) => void;
}

const AdminDeploymentPresetNodes: React.FC<AdminDeploymentPresetNodesProps> = ({
  presetsFrgmt,
  customizeColumns,
  disableSorter,
  onEdit,
  onDelete,
  onChangeOrder,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();

  const presets = useFragment(
    graphql`
      fragment AdminDeploymentPresetNodesFragment on DeploymentRevisionPreset
      @relay(plural: true) {
        id @required(action: NONE)
        name @required(action: NONE)
        description
        rank
        runtimeVariantId
        runtimeVariant {
          id
          name
        }
        cluster {
          clusterMode
          clusterSize
        }
        execution {
          imageId
        }
        deploymentDefaults {
          replicaCount
          deploymentStrategy
        }
        createdAt
      }
    `,
    presetsFrgmt,
  );

  const filteredPresets = filterOutNullAndUndefined(presets);

  const imageIds = _.uniq(
    filteredPresets
      .map((p) => p.execution?.imageId)
      .filter((id): id is string => id != null),
  );

  const imagesData = useLazyLoadQuery<AdminDeploymentPresetNodesImagesQuery>(
    graphql`
      query AdminDeploymentPresetNodesImagesQuery(
        $ids: [UUID!]!
        $limit: Int!
      ) {
        adminImagesV2(filter: { id: { in: $ids } }, limit: $limit) {
          edges {
            node {
              id
              identity {
                canonicalName
              }
            }
          }
        }
      }
    `,
    { ids: imageIds, limit: imageIds.length || 1 },
    { fetchPolicy: 'store-or-network' },
  );

  // PresetExecutionSpec.imageId is a raw UUID, but ImageV2.id is a Relay
  // global ID — toLocalId is required to match results back to imageIds.
  const imageNameById: Record<string, string> = {};
  for (const edge of imagesData.adminImagesV2?.edges ?? []) {
    if (edge?.node?.id && edge.node.identity?.canonicalName) {
      imageNameById[toLocalId(edge.node.id)] = edge.node.identity.canonicalName;
    }
  }

  const baseColumns: BAIColumnType<DeploymentPresetNodeInList>[] = _.map(
    filterOutEmpty<BAIColumnType<DeploymentPresetNodeInList>>([
      {
        key: 'name',
        title: t('adminDeploymentPreset.Name'),
        dataIndex: 'name',
        sorter: isEnableSorter('name'),
        fixed: 'left' as const,
        render: (name: string, preset) => (
          <BAINameActionCell
            title={name}
            showActions="always"
            actions={[
              {
                key: 'edit',
                title: t('button.Edit'),
                icon: <SettingOutlined />,
                onClick: () => onEdit?.(preset),
              },
              {
                key: 'delete',
                title: t('button.Delete'),
                icon: <DeleteFilled />,
                type: 'danger' as const,
                onClick: () => onDelete?.(preset),
              },
            ]}
          />
        ),
      },
      {
        key: 'description',
        title: t('adminDeploymentPreset.Description'),
        dataIndex: 'description',
        defaultHidden: true,
        render: (desc: string | null) => desc || '-',
      },
      {
        key: 'runtime',
        title: t('adminDeploymentPreset.Runtime'),
        render: (__, record) => record.runtimeVariant?.name ?? '-',
      },
      {
        key: 'image',
        title: t('adminDeploymentPreset.Image'),
        render: (__, record) => {
          const imageId = record.execution?.imageId;
          if (!imageId) return '-';
          return imageNameById[imageId] ?? imageId;
        },
      },
      {
        key: 'cluster',
        title: t('adminDeploymentPreset.Cluster'),
        defaultHidden: true,
        render: (__, record) => {
          const { clusterMode, clusterSize } = record.cluster ?? {};
          if (!clusterMode) return '-';
          return `${clusterMode} × ${clusterSize}`;
        },
      },
      {
        key: 'replicaCount',
        title: t('adminDeploymentPreset.Replicas'),
        render: (__, record) => record.deploymentDefaults?.replicaCount ?? '-',
      },
      {
        key: 'strategy',
        title: t('adminDeploymentPreset.Strategy'),
        defaultHidden: true,
        render: (__, record) =>
          record.deploymentDefaults?.deploymentStrategy ?? '-',
      },
      {
        key: 'createdAt',
        title: t('general.CreatedAt'),
        dataIndex: 'createdAt',
        sorter: isEnableSorter('createdAt'),
        render: (createdAt: string) =>
          createdAt ? dayjs(createdAt).format('YYYY-MM-DD HH:mm') : '-',
      },
    ]),
    (column) => {
      return disableSorter ? _.omit(column, 'sorter') : column;
    },
  );

  const allColumns = customizeColumns
    ? customizeColumns(baseColumns)
    : baseColumns;

  return (
    <BAITable
      rowKey="id"
      dataSource={filteredPresets}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availablePresetSorterValues)[number]) || null,
        );
      }}
      {...tableProps}
    />
  );
};

export default AdminDeploymentPresetNodes;
