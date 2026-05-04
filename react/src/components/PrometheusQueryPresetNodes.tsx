/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PrometheusQueryPresetEditorModalFragment$key } from '../__generated__/PrometheusQueryPresetEditorModalFragment.graphql';
import {
  PrometheusQueryPresetNodesFragment$data,
  PrometheusQueryPresetNodesFragment$key,
} from '../__generated__/PrometheusQueryPresetNodesFragment.graphql';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import {
  BAIColumnsType,
  BAIFlex,
  BAINameActionCell,
  BAITable,
  BAITableProps,
  BAIText,
  filterOutNullAndUndefined,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type PrometheusQueryPresetNodeInList = NonNullable<
  PrometheusQueryPresetNodesFragment$data[number]
>;

const availablePrometheusQueryPresetSorterKeys = [
  'name',
  'createdAt',
  'updatedAt',
] as const;

export const availablePrometheusQueryPresetSorterValues = [
  ...availablePrometheusQueryPresetSorterKeys,
  ...availablePrometheusQueryPresetSorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availablePrometheusQueryPresetSorterKeys, key);
};

interface PrometheusQueryPresetNodesProps extends Omit<
  BAITableProps<PrometheusQueryPresetNodeInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  presetsFrgmt: PrometheusQueryPresetNodesFragment$key;
  onDeletePreset?: (preset: PrometheusQueryPresetNodeInList) => void;
  onEditPreset?: (preset: PrometheusQueryPresetEditorModalFragment$key) => void;
  customizeColumns?: (
    baseColumns: BAIColumnsType<PrometheusQueryPresetNodeInList>,
  ) => BAIColumnsType<PrometheusQueryPresetNodeInList>;
  onChangeOrder?: (
    order: (typeof availablePrometheusQueryPresetSorterValues)[number] | null,
  ) => void;
}

const PrometheusQueryPresetNodes: React.FC<PrometheusQueryPresetNodesProps> = ({
  presetsFrgmt,
  onDeletePreset,
  onEditPreset,
  customizeColumns,
  onChangeOrder,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();

  const presets = useFragment(
    graphql`
      fragment PrometheusQueryPresetNodesFragment on QueryDefinition
      @relay(plural: true) {
        id
        name
        description
        rank
        categoryId
        metricName
        queryTemplate
        timeWindow
        options {
          filterLabels
          groupLabels
        }
        createdAt
        updatedAt
        category {
          id
          name
        }
        ...PrometheusQueryPresetEditorModalFragment
      }
    `,
    presetsFrgmt,
  );

  const baseColumns: BAIColumnsType<PrometheusQueryPresetNodeInList> = [
    {
      title: t('prometheusQueryPreset.Name'),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      required: true,
      sorter: isEnableSorter('name'),
      render: (_name: string, row) => (
        <BAINameActionCell
          title={row.name}
          showActions="always"
          actions={[
            {
              key: 'edit',
              title: t('button.Edit'),
              icon: <EditOutlined />,
              onClick: () => onEditPreset?.(row),
            },
            {
              key: 'delete',
              title: t('button.Delete'),
              icon: <DeleteOutlined />,
              type: 'danger',
              onClick: () => onDeletePreset?.(row),
            },
          ]}
        />
      ),
    },
    {
      title: t('prometheusQueryPreset.Id'),
      dataIndex: 'id',
      key: 'id',
      defaultHidden: true,
      sorter: isEnableSorter('id'),
      onCell: () => ({ style: { maxWidth: 120 } }),
      render: (id: string) => (
        <BAIText copyable ellipsis monospace title={toLocalId(id)}>
          {toLocalId(id)}
        </BAIText>
      ),
    },
    {
      title: t('prometheusQueryPreset.MetricName'),
      dataIndex: 'metricName',
      key: 'metricName',
      sorter: isEnableSorter('metricName'),
      render: (metricName: string) => metricName ?? '-',
    },
    {
      title: t('prometheusQueryPreset.QueryTemplate'),
      dataIndex: 'queryTemplate',
      key: 'queryTemplate',
      sorter: isEnableSorter('queryTemplate'),
      onCell: () => ({ style: { maxWidth: 320 } }),
      render: (queryTemplate: string) =>
        queryTemplate ? (
          <BAIText
            code
            ellipsis={{ tooltip: true }}
            copyable={{ text: queryTemplate }}
          >
            {queryTemplate}
          </BAIText>
        ) : (
          '-'
        ),
    },
    {
      title: t('prometheusQueryPreset.TimeWindow'),
      dataIndex: 'timeWindow',
      key: 'timeWindow',
      sorter: isEnableSorter('timeWindow'),
      render: (timeWindow: string | null | undefined) => timeWindow ?? '-',
    },
    {
      title: t('prometheusQueryPreset.Category'),
      key: 'category',
      children: [
        {
          title: t('prometheusQueryPreset.Id'),
          dataIndex: ['category', 'id'],
          key: 'categoryId',
          sorter: isEnableSorter('categoryId'),
          onCell: () => ({ style: { maxWidth: 120 } }),

          render: (_value: unknown, row) => (
            <BAIText
              ellipsis
              copyable
              monospace
              title={row.category?.id ?? '-'}
            >
              {row.category?.id ?? '-'}
            </BAIText>
          ),
        },
        {
          title: t('prometheusQueryPreset.Name'),
          dataIndex: ['category', 'name'],
          key: 'categoryName',
          sorter: isEnableSorter('categoryName'),
          render: (_value: unknown, row) => row.category?.name ?? '-',
        },
      ],
    },
    {
      title: t('prometheusQueryPreset.Options'),
      key: 'options',
      children: [
        {
          title: t('prometheusQueryPreset.FilterLabels'),
          dataIndex: ['options', 'filterLabels'],
          key: 'filterLabels',
          sorter: isEnableSorter('filterLabels'),
          width: 200,
          render: (_value: unknown, row) => {
            const labels = row.options?.filterLabels;
            if (!labels || labels.length === 0) return '-';
            return (
              <BAIFlex wrap="wrap" gap="xxs">
                {_.map(labels, (label) => (
                  <Tag key={label}>{label}</Tag>
                ))}
              </BAIFlex>
            );
          },
        },
        {
          title: t('prometheusQueryPreset.GroupLabels'),
          dataIndex: ['options', 'groupLabels'],
          key: 'groupLabels',
          sorter: isEnableSorter('groupLabels'),
          width: 200,
          render: (_value: unknown, row) => {
            const labels = row.options?.groupLabels;
            if (!labels || labels.length === 0) return '-';
            return (
              <BAIFlex wrap="wrap" gap="xxs">
                {_.map(labels, (label) => (
                  <Tag key={label}>{label}</Tag>
                ))}
              </BAIFlex>
            );
          },
        },
      ],
    },
    {
      title: t('prometheusQueryPreset.Rank'),
      dataIndex: 'rank',
      defaultHidden: true,
      key: 'rank',
      sorter: isEnableSorter('rank'),
      render: (rank: number | null | undefined) =>
        _.isNumber(rank) ? rank : '-',
    },
    {
      title: t('prometheusQueryPreset.Description'),
      dataIndex: 'description',
      key: 'description',
      defaultHidden: true,
      sorter: isEnableSorter('description'),
      onCell: () => ({ style: { maxWidth: 320 } }),
      render: (description: string | null | undefined) =>
        description ? (
          <BAIText ellipsis={{ tooltip: true }}>{description}</BAIText>
        ) : (
          '-'
        ),
    },
    {
      title: t('prometheusQueryPreset.CreatedAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      defaultHidden: true,
      sorter: isEnableSorter('createdAt'),
      render: (createdAt: string | null | undefined) =>
        createdAt ? dayjs(createdAt).format('lll') : '-',
    },
    {
      title: t('prometheusQueryPreset.UpdatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      defaultHidden: true,
      sorter: isEnableSorter('updatedAt'),
      render: (updatedAt: string | null | undefined) =>
        updatedAt ? dayjs(updatedAt).format('lll') : '-',
    },
  ];

  const allColumns = customizeColumns
    ? customizeColumns(baseColumns)
    : baseColumns;

  return (
    <BAITable
      size="small"
      scroll={{ x: 'max-content' }}
      rowKey="id"
      dataSource={filterOutNullAndUndefined(presets)}
      columns={allColumns}
      showSorterTooltip={false}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availablePrometheusQueryPresetSorterValues)[number]) ||
            null,
        );
      }}
      {...tableProps}
    />
  );
};

export default PrometheusQueryPresetNodes;
