/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  UserResourcePolicyV2TableFragment$data,
  UserResourcePolicyV2TableFragment$key,
} from '../__generated__/UserResourcePolicyV2TableFragment.graphql';
import { convertToDecimalUnit } from '../helper';
import {
  BAIColumnsType,
  BAIColumnType,
  BAIId,
  BAITable,
  BAITableProps,
  filterOutEmpty,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type UserResourcePolicyV2InList = NonNullable<
  UserResourcePolicyV2TableFragment$data[number]
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

export interface UserResourcePolicyV2TableProps extends Omit<
  BAITableProps<UserResourcePolicyV2InList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  userResourcePoliciesFrgmt: UserResourcePolicyV2TableFragment$key;
  disableSorter?: boolean;
  customizeColumns?: (
    baseColumns: BAIColumnsType<UserResourcePolicyV2InList>,
  ) => BAIColumnsType<UserResourcePolicyV2InList>;
  onChangeOrder?: (
    order: (typeof availableUserResourcePolicySorterValues)[number] | null,
  ) => void;
}

const UserResourcePolicyV2Table = ({
  userResourcePoliciesFrgmt,
  disableSorter,
  customizeColumns,
  onChangeOrder,
  ...tableProps
}: UserResourcePolicyV2TableProps) => {
  'use memo';
  const { t } = useTranslation();

  const userResourcePolicies =
    useFragment<UserResourcePolicyV2TableFragment$key>(
      graphql`
        fragment UserResourcePolicyV2TableFragment on UserResourcePolicyV2
        @relay(plural: true) {
          id
          name
          createdAt
          maxVfolderCount
          maxConcurrentLogins
          maxSessionCountPerModelSession
          maxQuotaScopeSize {
            value
          }
          maxCustomizedImageCount
        }
      `,
      userResourcePoliciesFrgmt,
    );

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<UserResourcePolicyV2InList>>([
      {
        title: t('resourcePolicy.Name'),
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        sorter: isEnableSorter('name'),
      },
      {
        title: t('resourcePolicy.MaxVFolderCount'),
        dataIndex: 'maxVfolderCount',
        key: 'maxVfolderCount',
        sorter: isEnableSorter('maxVfolderCount'),
        render: (text) => (_.toNumber(text) === 0 ? '∞' : text),
      },
      {
        title: t('resourcePolicy.MaxConcurrentLogins'),
        dataIndex: 'maxConcurrentLogins',
        key: 'maxConcurrentLogins',
        sorter: isEnableSorter('maxConcurrentLogins'),
        render: (text) => (_.isNil(text) ? '∞' : text),
      },
      {
        title: t('resourcePolicy.MaxSessionCountPerModelSession'),
        dataIndex: 'maxSessionCountPerModelSession',
        key: 'maxSessionCountPerModelSession',
        sorter: isEnableSorter('maxSessionCountPerModelSession'),
      },
      {
        title: t('resourcePolicy.MaxQuotaScopeSize'),
        dataIndex: 'maxQuotaScopeSize',
        key: 'maxQuotaScopeSize',
        sorter: isEnableSorter('maxQuotaScopeSize'),
        render: (__, row) =>
          row.maxQuotaScopeSize.value === -1
            ? '∞'
            : (convertToDecimalUnit(row.maxQuotaScopeSize.value, 'auto')
                ?.displayValue ?? '-'),
      },
      {
        title: t('resourcePolicy.MaxCustomizedImageCount'),
        dataIndex: 'maxCustomizedImageCount',
        key: 'maxCustomizedImageCount',
        sorter: isEnableSorter('maxCustomizedImageCount'),
      },
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        defaultHidden: true,
        render: (id: string) => <BAIId globalId={id} />,
      },
      {
        title: t('resourcePolicy.CreatedAt'),
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

export default UserResourcePolicyV2Table;
