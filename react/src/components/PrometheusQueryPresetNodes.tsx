/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  PrometheusQueryPresetNodesFragment$data,
  PrometheusQueryPresetNodesFragment$key,
} from '../__generated__/PrometheusQueryPresetNodesFragment.graphql';
import { localeCompare } from '../helper';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';
import {
  BAIColumnsType,
  BAIFlex,
  BAITable,
  BAITableProps,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type PrometheusQueryPresetNodeInList = NonNullable<
  PrometheusQueryPresetNodesFragment$data[number]
>;

interface PrometheusQueryPresetNodesProps extends Omit<
  BAITableProps<PrometheusQueryPresetNodeInList>,
  'dataSource' | 'columns'
> {
  presetsFrgmt: PrometheusQueryPresetNodesFragment$key;
  onDeletePreset?: (preset: PrometheusQueryPresetNodeInList) => void;
  customizeColumns?: (
    baseColumns: BAIColumnsType<PrometheusQueryPresetNodeInList>,
  ) => BAIColumnsType<PrometheusQueryPresetNodeInList>;
}

const PrometheusQueryPresetNodes: React.FC<PrometheusQueryPresetNodesProps> = ({
  presetsFrgmt,
  onDeletePreset,
  customizeColumns,
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
        category @since(version: "26.4.3") {
          id
          name
        }
      }
    `,
    presetsFrgmt,
  );

  const baseColumns: BAIColumnsType<PrometheusQueryPresetNodeInList> = [
    {
      title: t('prometheusQueryPreset.Name'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => localeCompare(a?.name, b?.name),
      render: (name: string) => name,
    },
    {
      title: t('prometheusQueryPreset.MetricName'),
      dataIndex: 'metricName',
      key: 'metricName',
      render: (metricName: string) => metricName ?? '-',
    },
    {
      title: t('prometheusQueryPreset.QueryTemplate'),
      dataIndex: 'queryTemplate',
      key: 'queryTemplate',
      render: (queryTemplate: string) =>
        queryTemplate ? (
          <Typography.Text
            code
            ellipsis={{ tooltip: queryTemplate }}
            style={{ maxWidth: 320 }}
          >
            {queryTemplate}
          </Typography.Text>
        ) : (
          '-'
        ),
    },
    {
      title: t('prometheusQueryPreset.TimeWindow'),
      dataIndex: 'timeWindow',
      key: 'timeWindow',
      render: (timeWindow: string | null | undefined) => timeWindow ?? '-',
    },
    {
      title: t('prometheusQueryPreset.CreatedAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string | null | undefined) =>
        createdAt ? dayjs(createdAt).format('lll') : '-',
    },
    {
      title: t('prometheusQueryPreset.UpdatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt: string | null | undefined) =>
        updatedAt ? dayjs(updatedAt).format('lll') : '-',
    },
    {
      title: t('general.Control'),
      key: 'actions',
      fixed: 'right',
      render: (_value, row) => (
        <BAIFlex gap="xxs">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDeletePreset?.(row)}
          />
        </BAIFlex>
      ),
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
      {...tableProps}
    />
  );
};

export default PrometheusQueryPresetNodes;
