/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PrometheusQueryPresetEditorModalFragment$key } from '../__generated__/PrometheusQueryPresetEditorModalFragment.graphql';
import {
  PrometheusQueryPresetListFragment$data,
  PrometheusQueryPresetListFragment$key,
} from '../__generated__/PrometheusQueryPresetListFragment.graphql';
import { localeCompare } from '../helper';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  Button,
  Typography,
  type TableColumnsType,
  type TablePaginationConfig,
} from 'antd';
import {
  BAIFlex,
  BAITable,
  BAITableProps,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

type PrometheusQueryPresetRow = PrometheusQueryPresetListFragment$data[number];

interface PrometheusQueryPresetListProps extends Omit<
  BAITableProps<PrometheusQueryPresetRow>,
  'dataSource' | 'columns'
> {
  presetsFrgmt: PrometheusQueryPresetListFragment$key;
  loading?: boolean;
  pagination: TablePaginationConfig;
  onDeletePreset?: (preset: PrometheusQueryPresetRow) => void;
  onEditPreset?: (preset: PrometheusQueryPresetEditorModalFragment$key) => void;
}

const PrometheusQueryPresetList: React.FC<PrometheusQueryPresetListProps> = ({
  presetsFrgmt,
  loading,
  pagination,
  onDeletePreset,
  onEditPreset,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();

  const presets = useFragment(
    graphql`
      fragment PrometheusQueryPresetListFragment on QueryDefinition
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
        ...PrometheusQueryPresetEditorModalFragment
      }
    `,
    presetsFrgmt,
  );

  const columns: TableColumnsType<PrometheusQueryPresetRow> = [
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
            icon={<EditOutlined />}
            onClick={() => onEditPreset?.(row)}
          />
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

  return (
    <BAITable
      size="small"
      loading={loading}
      scroll={{ x: 'max-content' }}
      rowKey="id"
      dataSource={filterOutNullAndUndefined(presets)}
      columns={columns}
      pagination={pagination}
      showSorterTooltip={false}
      {...tableProps}
    />
  );
};

export default PrometheusQueryPresetList;
