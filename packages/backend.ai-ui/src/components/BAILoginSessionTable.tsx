import {
  BAIColumnsType,
  BAIColumnType,
  BAITable,
  BAITableProps,
  BAIText,
  filterOutEmpty,
  filterOutNullAndUndefined,
} from '..';
import type {
  BAILoginSessionTableFragment$data,
  BAILoginSessionTableFragment$key,
} from '../__generated__/BAILoginSessionTableFragment.graphql';
import { useBAIi18n } from '../hooks/useBAIi18n';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { graphql, useFragment } from 'react-relay';

export type LoginSessionNodeInList = NonNullable<
  BAILoginSessionTableFragment$data[number]
>;

const availableLoginSessionSorterKeys = ['createdAt'] as const;

export const availableLoginSessionSorterValues = [
  ...availableLoginSessionSorterKeys,
  ...availableLoginSessionSorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableLoginSessionSorterKeys, key);
};

export interface BAILoginSessionTableProps extends Omit<
  BAITableProps<LoginSessionNodeInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  loginSessionsFrgmt: BAILoginSessionTableFragment$key;
  disableSorter?: boolean;
  customizeColumns?: (
    baseColumns: BAIColumnsType<LoginSessionNodeInList>,
  ) => BAIColumnsType<LoginSessionNodeInList>;
  onChangeOrder?: (
    order: (typeof availableLoginSessionSorterValues)[number] | null,
  ) => void;
}

/**
 * BAILoginSessionTable - Presentational table over a `LoginSessionV2` plural
 * fragment. Renders the user, access key, and created-at columns; filter,
 * pagination, and query orchestration (plus row-level actions such as revoke)
 * live in the consuming surface via the `customizeColumns` prop. Mirrors the
 * `*Nodes` idiom (`BAIAuditLogNodes`, `SessionNodes`).
 */
const BAILoginSessionTable = ({
  loginSessionsFrgmt,
  disableSorter,
  customizeColumns,
  onChangeOrder,
  ...tableProps
}: BAILoginSessionTableProps) => {
  'use memo';
  const { t } = useBAIi18n();

  const loginSessions = useFragment<BAILoginSessionTableFragment$key>(
    graphql`
      fragment BAILoginSessionTableFragment on LoginSessionV2
      @relay(plural: true) {
        id
        accessKey
        # status is intentionally not selected: the backend does not write it
        # yet, so it is neither displayed nor filterable here.
        createdAt
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
        title: t('comp:BAILoginSessionTable.User'),
        fixed: 'left',
        render: (__, record) => record.user?.basicInfo.email || '-',
      },
      {
        key: 'accessKey',
        title: t('comp:BAILoginSessionTable.AccessKey'),
        dataIndex: 'accessKey',
        render: (__, record) =>
          record.accessKey ? (
            <BAIText monospace copyable>
              {record.accessKey}
            </BAIText>
          ) : (
            '-'
          ),
      },
      {
        key: 'createdAt',
        title: t('comp:BAILoginSessionTable.CreatedAt'),
        dataIndex: 'createdAt',
        sorter: isEnableSorter('createdAt'),
        render: (__, record) =>
          record.createdAt ? dayjs(record.createdAt).format('ll LTS') : '-',
      },
      // invalidatedAt currently receives no value at all, so this column is
      // disabled until it carries meaningful data.
      // {
      //   key: 'invalidatedAt',
      //   title: t('comp:BAILoginSessionTable.InvalidatedAt'),
      //   dataIndex: 'invalidatedAt',
      //   render: (__, record) =>
      //     record.invalidatedAt
      //       ? dayjs(record.invalidatedAt).format('ll LTS')
      //       : '-',
      // },
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

export default BAILoginSessionTable;
