/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  DeploymentPresetNodesFragment$data,
  DeploymentPresetNodesFragment$key,
} from '../__generated__/DeploymentPresetNodesFragment.graphql';
import type { DeploymentPresetNodesImageQuery } from '../__generated__/DeploymentPresetNodesImageQuery.graphql';
import { SettingOutlined } from '@ant-design/icons';
import {
  BAIColumnType,
  BAINameActionCell,
  BAITable,
  BAITableProps,
  BAITrashBinIcon,
  filterOutEmpty,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

export type DeploymentPresetNodeInList = NonNullable<
  DeploymentPresetNodesFragment$data[number]
>;

const availablePresetSorterKeys = ['name', 'rank', 'createdAt'] as const;

export const availablePresetSorterValues = [
  ...availablePresetSorterKeys,
  ...availablePresetSorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availablePresetSorterKeys, key);
};

const ImageCanonicalName: React.FC<{ imageId: string }> = ({ imageId }) => {
  'use memo';
  const data = useLazyLoadQuery<DeploymentPresetNodesImageQuery>(
    graphql`
      query DeploymentPresetNodesImageQuery($id: ID!) {
        imageV2(id: $id) {
          identity {
            canonicalName
          }
        }
      }
    `,
    { id: imageId },
    { fetchPolicy: 'store-or-network' },
  );
  return <>{data.imageV2?.identity?.canonicalName ?? imageId}</>;
};

interface DeploymentPresetNodesProps extends Omit<
  BAITableProps<DeploymentPresetNodeInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  presetsFrgmt: DeploymentPresetNodesFragment$key;
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

const DeploymentPresetNodes: React.FC<DeploymentPresetNodesProps> = ({
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
      fragment DeploymentPresetNodesFragment on DeploymentRevisionPreset
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
        ...DeploymentPresetDetailContentFragment
      }
    `,
    presetsFrgmt,
  );

  const baseColumns = _.map(
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
                icon: <BAITrashBinIcon />,
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
        render: (__, record) =>
          record.execution?.imageId ? (
            <Suspense fallback={record.execution.imageId}>
              <ImageCanonicalName imageId={record.execution.imageId} />
            </Suspense>
          ) : (
            '-'
          ),
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
      dataSource={filterOutNullAndUndefined(presets)}
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

export default DeploymentPresetNodes;
