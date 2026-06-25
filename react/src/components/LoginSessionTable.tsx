/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  LoginSessionTableFragment$data,
  LoginSessionTableFragment$key,
} from '../__generated__/LoginSessionTableFragment.graphql';
import {
  BAIColumnsType,
  BAIColumnType,
  BAITable,
  BAITableProps,
  filterOutEmpty,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type LoginSessionNodeInList = NonNullable<
  LoginSessionTableFragment$data[number]
>;

const availableLoginSessionSorterKeys = ['createdAt'] as const;

export const availableLoginSessionSorterValues = [
  ...availableLoginSessionSorterKeys,
  ...availableLoginSessionSorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableLoginSessionSorterKeys, key);
};

export interface LoginSessionTableProps extends Omit<
  BAITableProps<LoginSessionNodeInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  loginSessionsFrgmt: LoginSessionTableFragment$key;
  disableSorter?: boolean;
  customizeColumns?: (
    baseColumns: BAIColumnsType<LoginSessionNodeInList>,
  ) => BAIColumnsType<LoginSessionNodeInList>;
  onChangeOrder?: (
    order: (typeof availableLoginSessionSorterValues)[number] | null,
  ) => void;
}

/**
 * LoginSessionTable - Presentational table over a `LoginSessionV2` plural
 * fragment. Renders every login-session column; filter, pagination, and query
 * orchestration (plus row-level actions such as revoke) live in the consuming
 * surface via the `customizeColumns` prop. Mirrors the `*Nodes` idiom
 * (`BAIAuditLogNodes`, `SessionNodes`).
 */
const LoginSessionTable = ({
  loginSessionsFrgmt,
  disableSorter,
  customizeColumns,
  onChangeOrder,
  ...tableProps
}: LoginSessionTableProps) => {
  'use memo';
  const { t } = useTranslation();

  const loginSessions = useFragment<LoginSessionTableFragment$key>(
    graphql`
      fragment LoginSessionTableFragment on LoginSessionV2
      @relay(plural: true) {
        id
        accessKey
        # status is intentionally not selected: the backend does not write it
        # yet, so it is neither displayed nor filterable here.
        createdAt
        invalidatedAt
        user {
          id
          basicInfo {
            email
          }
        }
      }
    `,
    loginSessionsFrgmt,
  );

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<LoginSessionNodeInList>>([
      {
        key: 'user',
        title: t('loginSession.User'),
        fixed: 'left',
        render: (__, record) => record.user?.basicInfo.email || '-',
      },
      {
        key: 'accessKey',
        title: t('loginSession.AccessKey'),
        dataIndex: 'accessKey',
        render: (__, record) => record.accessKey || '-',
      },
      {
        key: 'createdAt',
        title: t('loginSession.CreatedAt'),
        dataIndex: 'createdAt',
        sorter: isEnableSorter('createdAt'),
        render: (__, record) =>
          record.createdAt ? dayjs(record.createdAt).format('ll LTS') : '-',
      },
      {
        key: 'invalidatedAt',
        title: t('loginSession.InvalidatedAt'),
        dataIndex: 'invalidatedAt',
        render: (__, record) =>
          record.invalidatedAt
            ? dayjs(record.invalidatedAt).format('ll LTS')
            : '-',
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
      size="small"
      dataSource={filterOutNullAndUndefined(loginSessions)}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableLoginSessionSorterValues)[number]) || null,
        );
      }}
      {...tableProps}
    />
  );
};

export default LoginSessionTable;
