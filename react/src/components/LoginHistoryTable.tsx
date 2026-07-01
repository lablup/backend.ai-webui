/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  LoginHistoryTableFragment$data,
  LoginHistoryTableFragment$key,
} from '../__generated__/LoginHistoryTableFragment.graphql';
import {
  BAIColumnsType,
  BAIColumnType,
  BAITable,
  BAITableProps,
  BAITag,
  filterOutEmpty,
  filterOutNullAndUndefined,
  type SemanticColor,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type LoginHistoryNodeInList = NonNullable<
  LoginHistoryTableFragment$data[number]
>;

type LoginAttemptResult = LoginHistoryNodeInList['result'];

// Concrete login attempt results, in display order. Excludes Relay's
// forward-compatibility `'%future added value'` member so it can drive the
// result filter's select options.
const loginAttemptResults: ReadonlyArray<
  Exclude<LoginAttemptResult, '%future added value'>
> = [
  'SUCCESS',
  'FAILED_INVALID_CREDENTIALS',
  'FAILED_USER_INACTIVE',
  'FAILED_BLOCKED',
  'FAILED_PASSWORD_EXPIRED',
  'FAILED_REJECTED_BY_HOOK',
  'FAILED_SESSION_ALREADY_EXISTS',
  'LOGOUT',
  'REVOKED_BY_ADMIN',
  'REVOKED_BY_USER',
  'EVICTED',
  'EXPIRED',
];

// Result-filter select options. The label is the raw server enum (results are
// not translated), so this is a static, render-invariant list.
export const loginResultFilterOptions = loginAttemptResults.map((result) => ({
  label: result,
  value: result,
}));

const availableLoginHistorySorterKeys = [
  'createdAt',
  'result',
  'domainName',
] as const;

export const availableLoginHistorySorterValues = [
  ...availableLoginHistorySorterKeys,
  ...availableLoginHistorySorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableLoginHistorySorterKeys, key);
};

// Semantic color per login attempt result. SUCCESS is green, every FAILED_*
// outcome is red, and the remaining lifecycle results (logout/expiry/eviction)
// stay neutral or amber so a failed sign-in stands out at a glance.
const loginHistoryResultColorMap: Record<LoginAttemptResult, SemanticColor> = {
  SUCCESS: 'success',
  FAILED_INVALID_CREDENTIALS: 'error',
  FAILED_USER_INACTIVE: 'error',
  FAILED_BLOCKED: 'error',
  FAILED_PASSWORD_EXPIRED: 'error',
  FAILED_REJECTED_BY_HOOK: 'error',
  FAILED_SESSION_ALREADY_EXISTS: 'error',
  LOGOUT: 'default',
  REVOKED_BY_ADMIN: 'warning',
  REVOKED_BY_USER: 'default',
  EVICTED: 'warning',
  EXPIRED: 'default',
  // Relay generates `'%future added value'` for forward-compatible enums.
  '%future added value': 'default',
};

export interface LoginHistoryTableProps extends Omit<
  BAITableProps<LoginHistoryNodeInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  loginHistoryFrgmt: LoginHistoryTableFragment$key;
  disableSorter?: boolean;
  customizeColumns?: (
    baseColumns: BAIColumnsType<LoginHistoryNodeInList>,
  ) => BAIColumnsType<LoginHistoryNodeInList>;
  onChangeOrder?: (
    order: (typeof availableLoginHistorySorterValues)[number] | null,
  ) => void;
}

/**
 * LoginHistoryTable - Presentational table over a `LoginHistoryV2` plural
 * fragment. Renders every login-history column; filter, pagination, and query
 * orchestration live in the consuming surface via the `customizeColumns` prop.
 * Login history is read-only, so unlike `LoginSessionTable` it exposes no
 * row-level actions. Mirrors the `*Nodes` idiom (`LoginSessionTable`,
 * `SessionNodes`).
 */
const LoginHistoryTable = ({
  loginHistoryFrgmt,
  disableSorter,
  customizeColumns,
  onChangeOrder,
  ...tableProps
}: LoginHistoryTableProps) => {
  'use memo';
  const { t } = useTranslation();

  const loginHistory = useFragment<LoginHistoryTableFragment$key>(
    graphql`
      fragment LoginHistoryTableFragment on LoginHistoryV2
      @relay(plural: true) {
        id
        result
        domainName
        failReason
        createdAt
      }
    `,
    loginHistoryFrgmt,
  );

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<LoginHistoryNodeInList>>([
      {
        key: 'result',
        title: t('loginHistory.Result'),
        dataIndex: 'result',
        fixed: 'left',
        sorter: isEnableSorter('result'),
        // Login attempt results are shown as the raw server enum value
        // (e.g. `FAILED_INVALID_CREDENTIALS`); only the tag color is mapped.
        render: (__, record) => (
          <BAITag color={loginHistoryResultColorMap[record.result]}>
            {record.result}
          </BAITag>
        ),
      },
      {
        key: 'domainName',
        title: t('loginHistory.Domain'),
        dataIndex: 'domainName',
        sorter: isEnableSorter('domainName'),
        render: (__, record) => record.domainName || '-',
      },
      {
        key: 'createdAt',
        title: t('loginHistory.LoginTime'),
        dataIndex: 'createdAt',
        sorter: isEnableSorter('createdAt'),
        render: (__, record) =>
          record.createdAt ? dayjs(record.createdAt).format('ll LTS') : '-',
      },
      {
        key: 'failReason',
        title: t('loginHistory.FailReason'),
        dataIndex: 'failReason',
        render: (__, record) => record.failReason || '-',
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
      dataSource={filterOutNullAndUndefined(loginHistory)}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableLoginHistorySorterValues)[number]) || null,
        );
      }}
      {...tableProps}
    />
  );
};

export default LoginHistoryTable;
