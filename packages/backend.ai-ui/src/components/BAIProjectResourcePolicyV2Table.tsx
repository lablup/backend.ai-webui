import {
  BAIColumnsType,
  BAIColumnType,
  BAITable,
  BAITableProps,
  convertToDecimalUnit,
  filterOutEmpty,
  filterOutNullAndUndefined,
} from '..';
import type {
  BAIProjectResourcePolicyV2TableFragment$data,
  BAIProjectResourcePolicyV2TableFragment$key,
} from '../__generated__/BAIProjectResourcePolicyV2TableFragment.graphql';
import { useBAIi18n } from '../hooks/useBAIi18n';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { graphql, useFragment } from 'react-relay';

export type ProjectResourcePolicyV2InList = NonNullable<
  BAIProjectResourcePolicyV2TableFragment$data[number]
>;

const availableProjectResourcePolicySorterKeys = [
  'name',
  'maxVfolderCount',
  'maxQuotaScopeSize',
  'maxNetworkCount',
  'createdAt',
] as const;

export const availableProjectResourcePolicySorterValues = [
  ...availableProjectResourcePolicySorterKeys,
  ...availableProjectResourcePolicySorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableProjectResourcePolicySorterKeys, key);
};

export interface BAIProjectResourcePolicyV2TableProps extends Omit<
  BAITableProps<ProjectResourcePolicyV2InList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  projectResourcePoliciesFrgmt: BAIProjectResourcePolicyV2TableFragment$key;
  disableSorter?: boolean;
  customizeColumns?: (
    baseColumns: BAIColumnsType<ProjectResourcePolicyV2InList>,
  ) => BAIColumnsType<ProjectResourcePolicyV2InList>;
  onChangeOrder?: (
    order: (typeof availableProjectResourcePolicySorterValues)[number] | null,
  ) => void;
}

const BAIProjectResourcePolicyV2Table = ({
  projectResourcePoliciesFrgmt,
  disableSorter,
  customizeColumns,
  onChangeOrder,
  ...tableProps
}: BAIProjectResourcePolicyV2TableProps) => {
  'use memo';
  const { t } = useBAIi18n();

  const projectResourcePolicies =
    useFragment<BAIProjectResourcePolicyV2TableFragment$key>(
      graphql`
        fragment BAIProjectResourcePolicyV2TableFragment on ProjectResourcePolicyV2
        @relay(plural: true) {
          id
          name
          createdAt
          maxVfolderCount
          maxQuotaScopeSize {
            expr
          }
          maxNetworkCount
        }
      `,
      projectResourcePoliciesFrgmt,
    );

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<ProjectResourcePolicyV2InList>>([
      {
        title: t('comp:BAIProjectResourcePolicyV2Table.Name'),
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        sorter: isEnableSorter('name'),
      },
      {
        title: t('comp:BAIProjectResourcePolicyV2Table.MaxVFolderCount'),
        dataIndex: 'maxVfolderCount',
        key: 'maxVfolderCount',
        sorter: isEnableSorter('maxVfolderCount'),
        render: (text) => (_.toNumber(text) === 0 ? '∞' : text),
      },
      {
        title: t('comp:BAIProjectResourcePolicyV2Table.MaxQuotaScopeSize'),
        dataIndex: 'maxQuotaScopeSize',
        key: 'maxQuotaScopeSize',
        sorter: isEnableSorter('maxQuotaScopeSize'),
        render: (__, row) =>
          row.maxQuotaScopeSize.expr === '-1'
            ? '∞'
            : (convertToDecimalUnit(row.maxQuotaScopeSize.expr, 'auto')
                ?.displayValue ?? '-'),
      },
      {
        title: t('comp:BAIProjectResourcePolicyV2Table.MaxNetworkCount'),
        dataIndex: 'maxNetworkCount',
        key: 'maxNetworkCount',
        sorter: isEnableSorter('maxNetworkCount'),
        render: (text) => (_.toNumber(text) === -1 ? '∞' : text),
      },
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        sorter: isEnableSorter('id'),
      },
      {
        title: t('comp:BAIProjectResourcePolicyV2Table.CreatedAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: isEnableSorter('createdAt'),
        render: (text) => (text ? dayjs(text).format('lll') : '-'),
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
      scroll={{ x: 'max-content' }}
      resizable
      rowKey="id"
      dataSource={filterOutNullAndUndefined(projectResourcePolicies)}
      columns={allColumns}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableProjectResourcePolicySorterValues)[number]) ||
            null,
        );
      }}
      {...tableProps}
    />
  );
};

export default BAIProjectResourcePolicyV2Table;
