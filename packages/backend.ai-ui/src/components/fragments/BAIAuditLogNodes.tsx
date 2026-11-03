import {
  BAIAuditLogNodesFragment$data,
  BAIAuditLogNodesFragment$key,
} from '../../__generated__/BAIAuditLogNodesFragment.graphql';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  formatCompactDuration,
  parseTimedelta,
} from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIId from '../BAIId';
import BAIText from '../BAIText';
import {
  BAIColumnsType,
  BAIColumnType,
  BAITable,
  BAITableProps,
} from '../Table';
import useConnectedBAIClient from '../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { graphql, useFragment } from 'react-relay';

export type AuditLogNodeInList = NonNullable<
  BAIAuditLogNodesFragment$data[number]
>;

const availableAuditLogSorterKeys = [
  'createdAt',
  'actionName',
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
  const baiClient = useConnectedBAIClient();
  const isClientIpSupported =
    baiClient.isManagerVersionCompatibleWith('26.9.0');

  const auditLogs = useFragment<BAIAuditLogNodesFragment$key>(
    graphql`
      fragment BAIAuditLogNodesFragment on AuditLogV2 @relay(plural: true) {
        id
        createdAt
        actionName
        operation
        status
        description
        duration
        requestId
        actionId
        entityType
        targetEntityId
        triggeredBy
        clientIp @since(version: "26.9.0")
        user {
          id
          entityId
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
        key: 'actionName',
        title: t('comp:BAIAuditLogNodes.Action'),
        dataIndex: 'actionName',
        sorter: isEnableSorter('actionName'),
        onCell: () => ({ style: { maxWidth: 300 } }),
        render: (__, record) =>
          record.actionName ? (
            <BAIText ellipsis={{ tooltip: true }} style={{ width: '100%' }}>
              {t(`comp:BAIAuditLogNodes.ActionName_${record.actionName}`, {
                defaultValue: record.actionName,
              })}
            </BAIText>
          ) : (
            '-'
          ),
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
        title: t('comp:BAIAuditLogNodes.Result'),
        dataIndex: 'status',
        sorter: isEnableSorter('status'),
        render: (__, record) => {
          const resultLabels: Record<string, string> = {
            SUCCESS: t('comp:BAIAuditLogNodes.ResultSuccess'),
            ERROR: t('comp:BAIAuditLogNodes.ResultFailed'),
            DENIED: t('comp:BAIAuditLogNodes.ResultDenied'),
            UNKNOWN: t('comp:BAIAuditLogNodes.ResultUnknown'),
            RUNNING: t('comp:BAIAuditLogNodes.ResultRunning'),
          };
          return (
            <BAIText type={record.status === 'ERROR' ? 'danger' : undefined}>
              {resultLabels[record.status] ?? record.status}
            </BAIText>
          );
        },
      },
      {
        key: 'description',
        title: t('comp:BAIAuditLogNodes.Description'),
        dataIndex: 'description',
        onCell: () => ({ style: { maxWidth: 400 } }),
        render: (__, record) =>
          (record.status === 'ERROR' || record.status === 'DENIED') &&
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
        render: (__, record) => {
          if (!record.duration) return '-';
          const ms = parseTimedelta(record.duration);
          return ms === null ? record.duration : formatCompactDuration(ms);
        },
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
          const email = record.user.basicInfo?.email;
          return email ? (
            <>
              {email} &nbsp; (<BAIId uuid={record.user.entityId} />)
            </>
          ) : (
            <BAIId uuid={record.user.entityId} />
          );
        },
      },
      isClientIpSupported
        ? {
            key: 'clientIp',
            title: t('comp:BAIAuditLogNodes.ClientIp'),
            dataIndex: 'clientIp',
            render: (__, record) => record.clientIp || '-',
          }
        : undefined,
      {
        key: 'entityType',
        title: t('comp:BAIAuditLogNodes.EntityType'),
        dataIndex: 'entityType',
        defaultHidden: true,
        render: (__, record) => record.entityType || '-',
      },
      {
        key: 'targetEntityId',
        title: t('comp:BAIAuditLogNodes.EntityId'),
        defaultHidden: true,
        render: (__, record) =>
          record.targetEntityId ? <BAIId uuid={record.targetEntityId} /> : '-',
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
      scroll={{ x: 'max-content' }}
      resizable
      rowKey="id"
      size="small"
      dataSource={filterOutNullAndUndefined(auditLogs)}
      columns={allColumns}
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
