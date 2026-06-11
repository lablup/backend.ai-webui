import {
  BAIAuditLogNodesFragment$data,
  BAIAuditLogNodesFragment$key,
} from '../../__generated__/BAIAuditLogNodesFragment.graphql';
import { filterOutEmpty, filterOutNullAndUndefined } from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIAuditLogStatusTag, { AuditLogStatus } from '../BAIAuditLogStatusTag';
import BAIId from '../BAIId';
import BAIText from '../BAIText';
import {
  BAIColumnsType,
  BAIColumnType,
  BAITable,
  BAITableProps,
} from '../Table';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { graphql, useFragment } from 'react-relay';

export type AuditLogNodeInList = NonNullable<
  BAIAuditLogNodesFragment$data[number]
>;

const availableAuditLogSorterKeys = [
  'createdAt',
  'operation',
  'status',
] as const;

export const availableAuditLogSorterValues = [
  ...availableAuditLogSorterKeys,
  ...availableAuditLogSorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableAuditLogSorterKeys, key);
};

const toAuditLogStatus = (status: string): AuditLogStatus | null => {
  return _.includes(['SUCCESS', 'ERROR', 'UNKNOWN', 'RUNNING'], status)
    ? (status as AuditLogStatus)
    : null;
};

export interface BAIAuditLogNodesProps extends Omit<
  BAITableProps<AuditLogNodeInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  auditLogFrgmt: BAIAuditLogNodesFragment$key;
  disableSorter?: boolean;
  customizeColumns?: (
    baseColumns: BAIColumnsType<AuditLogNodeInList>,
  ) => BAIColumnsType<AuditLogNodeInList>;
  onChangeOrder?: (
    order: (typeof availableAuditLogSorterValues)[number] | null,
  ) => void;
}

/**
 * BAIAuditLogNodes - The common audit log table view. Presentational table over
 * an `AuditLogV2` plural fragment, scoped to a single resource. Renders the
 * standardized column / status UX shared across the Session, VFolder, and Model
 * Deployment detail surfaces; filter, pagination, and query orchestration live
 * in the consuming surface.
 */
const BAIAuditLogNodes = ({
  auditLogFrgmt,
  disableSorter,
  customizeColumns,
  onChangeOrder,
  ...tableProps
}: BAIAuditLogNodesProps) => {
  'use memo';
  const { t } = useBAIi18n();

  const auditLogs = useFragment<BAIAuditLogNodesFragment$key>(
    graphql`
      fragment BAIAuditLogNodesFragment on AuditLogV2 @relay(plural: true) {
        id
        createdAt
        operation
        status
        description
        duration
        requestId
        actionId
        entityType
        entityId
        triggeredBy
        user {
          id
          basicInfo {
            email
          }
        }
      }
    `,
    auditLogFrgmt,
  );

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<AuditLogNodeInList>>([
      {
        key: 'createdAt',
        title: t('comp:BAIAuditLogNodes.Time'),
        dataIndex: 'createdAt',
        sorter: isEnableSorter('createdAt'),
        render: (__, record) =>
          record.createdAt ? dayjs(record.createdAt).format('ll LTS') : '-',
      },
      {
        key: 'operation',
        title: t('comp:BAIAuditLogNodes.Operation'),
        dataIndex: 'operation',
        sorter: isEnableSorter('operation'),
        render: (__, record) => record.operation || '-',
      },
      {
        key: 'status',
        title: t('comp:BAIAuditLogNodes.Status'),
        dataIndex: 'status',
        sorter: isEnableSorter('status'),
        render: (__, record) => (
          <BAIAuditLogStatusTag status={toAuditLogStatus(record.status)} />
        ),
      },
      {
        key: 'description',
        title: t('comp:BAIAuditLogNodes.Description'),
        dataIndex: 'description',
        onCell: () => ({ style: { maxWidth: 400 } }),
        render: (__, record) =>
          record.description ? (
            <BAIText ellipsis={{ tooltip: true }} style={{ width: '100%' }}>
              {record.description}
            </BAIText>
          ) : (
            '-'
          ),
      },
      {
        key: 'duration',
        title: t('comp:BAIAuditLogNodes.Duration'),
        dataIndex: 'duration',
        render: (__, record) => record.duration || '-',
      },
      {
        key: 'triggeredBy',
        title: t('comp:BAIAuditLogNodes.TriggeredBy'),
        render: (__, record) => {
          const fallback = record.triggeredBy ? (
            <BAIId uuid={record.triggeredBy} />
          ) : (
            '-'
          );
          if (!record.user) {
            return fallback;
          }
          // Show "email (id)" when the email is available; otherwise fall back
          // to the user id alone so we never render an empty label before the
          // parentheses when basicInfo.email is missing/null.
          const email = record.user.basicInfo?.email;
          return email ? (
            <>
              {email} &nbsp; (<BAIId globalId={record.user.id} />)
            </>
          ) : (
            <BAIId globalId={record.user.id} />
          );
        },
      },
      {
        key: 'entityType',
        title: t('comp:BAIAuditLogNodes.EntityType'),
        dataIndex: 'entityType',
        defaultHidden: true,
        render: (__, record) => record.entityType || '-',
      },
      {
        key: 'entityId',
        title: t('comp:BAIAuditLogNodes.EntityId'),
        defaultHidden: true,
        render: (__, record) =>
          record.entityId ? <BAIId uuid={record.entityId} /> : '-',
      },
      {
        key: 'requestId',
        title: t('comp:BAIAuditLogNodes.RequestId'),
        defaultHidden: true,
        render: (__, record) =>
          record.requestId ? <BAIId uuid={record.requestId} /> : '-',
      },
      {
        key: 'actionId',
        title: t('comp:BAIAuditLogNodes.ActionId'),
        defaultHidden: true,
        render: (__, record) =>
          record.actionId ? <BAIId uuid={record.actionId} /> : '-',
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
      dataSource={filterOutNullAndUndefined(auditLogs)}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableAuditLogSorterValues)[number]) || null,
        );
      }}
      {...tableProps}
    />
  );
};

export default BAIAuditLogNodes;
