import {
  BAIBooleanToken,
  BAIColumnsType,
  BAIColumnType,
  BAITable,
  BAITableProps,
  BAIText,
  filterOutNullAndUndefined,
} from '..';
import type {
  BAIAdminRetentionPolicyTableFragment$data,
  BAIAdminRetentionPolicyTableFragment$key,
} from '../__generated__/BAIAdminRetentionPolicyTableFragment.graphql';
import { useBAIi18n } from '../hooks/useBAIi18n';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { graphql, useFragment } from 'react-relay';

export type RetentionPolicyInList = NonNullable<
  BAIAdminRetentionPolicyTableFragment$data[number]
>;

/** The `RetentionPolicyOrderField` members the server sorts by. */
const availableRetentionPolicySorterKeys = [
  'category',
  'createdAt',
  'lastSweptAt',
] as const;

export const availableRetentionPolicySorterValues = [
  ...availableRetentionPolicySorterKeys,
  ...availableRetentionPolicySorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableRetentionPolicySorterKeys, key);
};

export interface BAIAdminRetentionPolicyTableProps extends Omit<
  BAITableProps<RetentionPolicyInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  retentionPoliciesFrgmt: BAIAdminRetentionPolicyTableFragment$key;
  disableSorter?: boolean;
  customizeColumns?: (
    baseColumns: BAIColumnsType<RetentionPolicyInList>,
  ) => BAIColumnsType<RetentionPolicyInList>;
  onChangeOrder?: (
    order: (typeof availableRetentionPolicySorterValues)[number] | null,
  ) => void;
}

const BAIAdminRetentionPolicyTable = ({
  retentionPoliciesFrgmt,
  disableSorter,
  customizeColumns,
  onChangeOrder,
  ...tableProps
}: BAIAdminRetentionPolicyTableProps) => {
  'use memo';
  const { t } = useBAIi18n();

  const retentionPolicies =
    useFragment<BAIAdminRetentionPolicyTableFragment$key>(
      graphql`
        fragment BAIAdminRetentionPolicyTableFragment on RetentionPolicy
        @relay(plural: true) {
          id
          category
          retentionPeriodDays
          enabled
          lastSweptAt
          createdAt
          updatedAt
        }
      `,
      retentionPoliciesFrgmt,
    );

  const categoryLabels: Record<RetentionPolicyInList['category'], string> = {
    LOGS: t('comp:BAIAdminRetentionPolicyTable.CategoryLogs'),
    LOGIN: t('comp:BAIAdminRetentionPolicyTable.CategoryLogin'),
    RECONCILE_HISTORY: t(
      'comp:BAIAdminRetentionPolicyTable.CategoryReconcileHistory',
    ),
    ROLES_INVITATIONS: t(
      'comp:BAIAdminRetentionPolicyTable.CategoryRolesInvitations',
    ),
    DEPLOYMENTS: t('comp:BAIAdminRetentionPolicyTable.CategoryDeployments'),
    SESSIONS: t('comp:BAIAdminRetentionPolicyTable.CategorySessions'),
    USAGE_RECORDS: t('comp:BAIAdminRetentionPolicyTable.CategoryUsageRecords'),
    USAGE_BUCKETS: t('comp:BAIAdminRetentionPolicyTable.CategoryUsageBuckets'),
    '%future added value': '',
  };

  const baseColumns = _.map(
    [
      {
        title: t('comp:BAIAdminRetentionPolicyTable.Category'),
        dataIndex: 'category',
        key: 'category',
        fixed: 'left',
        required: true,
        sorter: isEnableSorter('category'),
        render: (__, row) => categoryLabels[row.category] || row.category,
      },
      {
        title: t('comp:BAIAdminRetentionPolicyTable.RetentionPeriodDays'),
        dataIndex: 'retentionPeriodDays',
        key: 'retentionPeriodDays',
      },
      {
        title: t('comp:BAIAdminRetentionPolicyTable.Enabled'),
        dataIndex: 'enabled',
        key: 'enabled',
        render: (__, row) => <BAIBooleanToken value={row.enabled} />,
      },
      {
        title: t('comp:BAIAdminRetentionPolicyTable.LastSweptAt'),
        dataIndex: 'lastSweptAt',
        key: 'lastSweptAt',
        sorter: isEnableSorter('lastSweptAt'),
        render: (__, row) =>
          row.lastSweptAt ? (
            dayjs(row.lastSweptAt).format('lll')
          ) : (
            <BAIText type="secondary">
              {t('comp:BAIAdminRetentionPolicyTable.NotSweptYet')}
            </BAIText>
          ),
      },
      {
        title: t('comp:BAIAdminRetentionPolicyTable.CreatedAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: isEnableSorter('createdAt'),
        defaultHidden: true,
        render: (__, row) => dayjs(row.createdAt).format('lll'),
      },
      {
        title: t('comp:BAIAdminRetentionPolicyTable.UpdatedAt'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        sorter: isEnableSorter('updatedAt'),
        defaultHidden: true,
        render: (__, row) => dayjs(row.updatedAt).format('lll'),
      },
    ] satisfies Array<BAIColumnType<RetentionPolicyInList>>,
    (column): BAIColumnType<RetentionPolicyInList> =>
      disableSorter ? _.omit(column, 'sorter') : column,
  );

  const allColumns = customizeColumns
    ? customizeColumns(baseColumns)
    : baseColumns;

  return (
    <BAITable
      scroll={{ x: 'max-content' }}
      size="small"
      rowKey="id"
      dataSource={filterOutNullAndUndefined(retentionPolicies)}
      columns={allColumns}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableRetentionPolicySorterValues)[number]) ||
            null,
        );
      }}
      {...tableProps}
    />
  );
};

export default BAIAdminRetentionPolicyTable;
