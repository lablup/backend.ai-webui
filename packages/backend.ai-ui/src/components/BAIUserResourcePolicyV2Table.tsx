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
  BAIUserResourcePolicyV2TableFragment$data,
  BAIUserResourcePolicyV2TableFragment$key,
} from '../__generated__/BAIUserResourcePolicyV2TableFragment.graphql';
import { useBAIi18n } from '../hooks/useBAIi18n';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { graphql, useFragment } from 'react-relay';

export type UserResourcePolicyV2InList = NonNullable<
  BAIUserResourcePolicyV2TableFragment$data[number]
>;

const availableUserResourcePolicySorterKeys = [
  'name',
  'maxVfolderCount',
  'maxConcurrentLogins',
  'maxSessionCountPerModelSession',
  'maxQuotaScopeSize',
  'maxCustomizedImageCount',
  'createdAt',
] as const;

export const availableUserResourcePolicySorterValues = [
  ...availableUserResourcePolicySorterKeys,
  ...availableUserResourcePolicySorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableUserResourcePolicySorterKeys, key);
};

export interface BAIUserResourcePolicyV2TableProps extends Omit<
  BAITableProps<UserResourcePolicyV2InList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  userResourcePoliciesFrgmt: BAIUserResourcePolicyV2TableFragment$key;
  disableSorter?: boolean;
  customizeColumns?: (
    baseColumns: BAIColumnsType<UserResourcePolicyV2InList>,
  ) => BAIColumnsType<UserResourcePolicyV2InList>;
  onChangeOrder?: (
    order: (typeof availableUserResourcePolicySorterValues)[number] | null,
  ) => void;
}

const BAIUserResourcePolicyV2Table = ({
  userResourcePoliciesFrgmt,
  disableSorter,
  customizeColumns,
  onChangeOrder,
  ...tableProps
}: BAIUserResourcePolicyV2TableProps) => {
  'use memo';
  const { t } = useBAIi18n();

  const userResourcePolicies =
    useFragment<BAIUserResourcePolicyV2TableFragment$key>(
      graphql`
        fragment BAIUserResourcePolicyV2TableFragment on UserResourcePolicyV2
        @relay(plural: true) {
          id
          name
          createdAt
          maxVfolderCount
          maxConcurrentLogins
          maxSessionCountPerModelSession
          maxQuotaScopeSize {
            expr
          }
          maxCustomizedImageCount
        }
      `,
      userResourcePoliciesFrgmt,
    );

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<UserResourcePolicyV2InList>>([
      {
        title: t('comp:BAIUserResourcePolicyV2Table.Name'),
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        sorter: isEnableSorter('name'),
      },
      {
        title: t('comp:BAIUserResourcePolicyV2Table.MaxVFolderCount'),
        dataIndex: 'maxVfolderCount',
        key: 'maxVfolderCount',
        sorter: isEnableSorter('maxVfolderCount'),
        render: (text) => (_.toNumber(text) === 0 ? '∞' : text),
      },
      {
        title: t('comp:BAIUserResourcePolicyV2Table.MaxConcurrentLogins'),
        dataIndex: 'maxConcurrentLogins',
        key: 'maxConcurrentLogins',
        sorter: isEnableSorter('maxConcurrentLogins'),
        render: (text) => (_.isNil(text) ? '∞' : text),
      },
      {
        title: t(
          'comp:BAIUserResourcePolicyV2Table.MaxSessionCountPerModelSession',
        ),
        dataIndex: 'maxSessionCountPerModelSession',
        key: 'maxSessionCountPerModelSession',
        sorter: isEnableSorter('maxSessionCountPerModelSession'),
      },
      {
        title: t('comp:BAIUserResourcePolicyV2Table.MaxQuotaScopeSize'),
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
        title: t('comp:BAIUserResourcePolicyV2Table.MaxCustomizedImageCount'),
        dataIndex: 'maxCustomizedImageCount',
        key: 'maxCustomizedImageCount',
        sorter: isEnableSorter('maxCustomizedImageCount'),
      },
      {
        title: t('comp:BAIUserResourcePolicyV2Table.CreatedAt'),
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
      resizable
      rowKey="id"
      showSorterTooltip={false}
      dataSource={filterOutNullAndUndefined(userResourcePolicies)}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableUserResourcePolicySorterValues)[number]) ||
            null,
        );
      }}
      {...tableProps}
    />
  );
};

export default BAIUserResourcePolicyV2Table;
