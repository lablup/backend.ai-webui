/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  AdminDeploymentPresetNodesFragment$data,
  AdminDeploymentPresetNodesFragment$key,
} from '../__generated__/AdminDeploymentPresetNodesFragment.graphql';
import { DeleteFilled, SettingOutlined } from '@ant-design/icons';
import {
  BAIColumnType,
  BAINameActionCell,
  BAISessionClusterMode,
  BAITable,
  BAITableProps,
  BAIText,
  BooleanTag,
  filterOutEmpty,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

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
          startupCommand
        }
        image @since(version: "26.4.4") {
          id
          identity {
            canonicalName
            architecture
          }
        }
        deploymentDefaults {
          replicaCount
          deploymentStrategy
          openToPublic
          revisionHistoryLimit
        }
        createdAt
        updatedAt
      }
    `,
    presetsFrgmt,
  );

  const filteredPresets = filterOutNullAndUndefined(presets);

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
          // `image` is gated by @since(26.4.4); on older servers it is null,
          // so fall back to the raw imageId. Label is
          // "<canonicalName>@<architecture>" so admins can tell aarch64 and
          // x86_64 images apart.
          const identity = record.image?.identity;
          const label = identity
            ? identity.architecture
              ? `${identity.canonicalName}@${identity.architecture}`
              : identity.canonicalName
            : record.execution?.imageId;
          if (!label) return '-';
          return (
            <BAIText copyable style={{ wordBreak: 'break-all' }}>
              {label}
            </BAIText>
          );
        },
      },
      {
        key: 'startupCommand',
        title: t('adminDeploymentPreset.StartupCommand'),
        defaultHidden: true,
        onCell: () => ({ style: { maxWidth: 500 } }),
        render: (__, record) => {
          const startupCommand = record.execution?.startupCommand;
          return startupCommand ? (
            <BAIText code copyable ellipsis={{ tooltip: true }}>
              {startupCommand}
            </BAIText>
          ) : (
            '-'
          );
        },
      },
      {
        key: 'cluster',
        title: t('adminDeploymentPreset.Cluster'),
        defaultHidden: true,
        render: (__, record) => (
          <BAISessionClusterMode
            clusterMode={record.cluster?.clusterMode}
            clusterSize={record.cluster?.clusterSize}
          />
        ),
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
        key: 'openToPublic',
        title: t('adminDeploymentPreset.OpenToPublic'),
        defaultHidden: true,
        render: (__, record) => (
          <BooleanTag
            value={record.deploymentDefaults?.openToPublic ?? false}
            trueLabel={t('deployment.Public')}
            falseLabel={t('deployment.Private')}
          />
        ),
      },
      {
        key: 'revisionHistoryLimit',
        title: t('adminDeploymentPreset.RevisionHistoryLimit'),
        defaultHidden: true,
        render: (__, record) =>
          record.deploymentDefaults?.revisionHistoryLimit ?? '-',
      },
      {
        key: 'createdAt',
        title: t('general.CreatedAt'),
        dataIndex: 'createdAt',
        sorter: isEnableSorter('createdAt'),
        render: (createdAt: string) =>
          createdAt ? dayjs(createdAt).format('YYYY-MM-DD HH:mm') : '-',
      },
      {
        key: 'updatedAt',
        title: t('general.ModifiedAt'),
        dataIndex: 'updatedAt',
        render: (updatedAt: string | null | undefined) =>
          updatedAt ? dayjs(updatedAt).format('YYYY-MM-DD HH:mm') : '-',
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
