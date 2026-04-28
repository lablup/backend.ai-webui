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
import { Typography } from 'antd';
import {
  BAIColumnsType,
  BAIFlex,
  BAINameActionCell,
  BAITable,
  BAITableProps,
  filterOutNullAndUndefined,
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
        category @since(version: "26.4.3") {
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
            copyable={{ text: queryTemplate }}
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
    <BAIFlex direction="column" align="stretch">
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
    </BAIFlex>
  );
};

export default PrometheusQueryPresetNodes;
