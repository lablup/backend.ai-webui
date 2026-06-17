import {
  BAIDeploymentSchedulingHistoryNodesFragment$data,
  BAIDeploymentSchedulingHistoryNodesFragment$key,
} from '../../__generated__/BAIDeploymentSchedulingHistoryNodesFragment.graphql';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  newLineToBrElement,
} from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAISchedulingResultBadge, {
  SchedulingResult,
} from '../BAISchedulingResultBadge';
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

export type DeploymentSchedulingHistoryNodeInList = NonNullable<
  BAIDeploymentSchedulingHistoryNodesFragment$data[number]
>;

const availableHistorySorterKeys = [] as const;

export const availableDeploymentHistorySorterValues = [
  ...availableHistorySorterKeys,
  ...availableHistorySorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableHistorySorterKeys, key);
};

export interface BAIDeploymentSchedulingHistoryNodesProps extends Omit<
  BAITableProps<DeploymentSchedulingHistoryNodeInList>,
  'dataSource' | 'onChangeOrder' | 'columns'
> {
  schedulingHistoryFrgmt: BAIDeploymentSchedulingHistoryNodesFragment$key;
  disableSorter?: boolean;
  customizeColumns?: (
    baseColumns: BAIColumnsType<DeploymentSchedulingHistoryNodeInList>,
  ) => BAIColumnsType<DeploymentSchedulingHistoryNodeInList>;
  onChangeOrder?: (
    order: (typeof availableDeploymentHistorySorterValues)[number] | null,
  ) => void;
}

const BAIDeploymentSchedulingHistoryNodes = ({
  schedulingHistoryFrgmt,
  disableSorter,
  customizeColumns,
  onChangeOrder,
  ...tableProps
}: BAIDeploymentSchedulingHistoryNodesProps) => {
  'use memo';
  const { t } = useBAIi18n();

  const histories =
    useFragment<BAIDeploymentSchedulingHistoryNodesFragment$key>(
      graphql`
        fragment BAIDeploymentSchedulingHistoryNodesFragment on DeploymentHistory
        @relay(plural: true) {
          id
          category
          phase
          fromStatus
          toStatus
          result
          errorCode
          message
          attempts
          createdAt
          updatedAt
        }
      `,
      schedulingHistoryFrgmt,
    );

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<DeploymentSchedulingHistoryNodeInList>>([
      {
        dataIndex: 'updatedAt',
        title: t('comp:BAIDeploymentSchedulingHistoryNodes.UpdatedAt'),
        key: 'updatedAt',
        render: (value) => <span>{dayjs(value).format('ll LTS')}</span>,
        sorter: isEnableSorter('updated_at'),
      },
      {
        dataIndex: 'createdAt',
        title: t('comp:BAIDeploymentSchedulingHistoryNodes.CreatedAt'),
        key: 'createdAt',
        render: (value) => <span>{dayjs(value).format('ll LTS')}</span>,
        sorter: isEnableSorter('created_at'),
      },
      {
        dataIndex: 'phase',
        title: t('comp:BAIDeploymentSchedulingHistoryNodes.Phase'),
        key: 'phase',
        sorter: isEnableSorter('phase'),
      },
      {
        dataIndex: 'result',
        title: t('comp:BAIDeploymentSchedulingHistoryNodes.Result'),
        key: 'result',
        render: (_value, record) => {
          const result =
            record.result && record.result !== '%future added value'
              ? (record.result as SchedulingResult)
              : null;
          return <BAISchedulingResultBadge result={result} />;
        },
        sorter: isEnableSorter('result'),
      },
      {
        dataIndex: 'category',
        title: t('comp:BAIDeploymentSchedulingHistoryNodes.Category'),
        key: 'category',
        sorter: isEnableSorter('category'),
      },
      {
        key: 'fromStatus',
        title: t('comp:BAIDeploymentSchedulingHistoryNodes.From'),
        dataIndex: 'fromStatus',
        sorter: isEnableSorter('from_status'),
      },
      {
        key: 'toStatus',
        title: t('comp:BAIDeploymentSchedulingHistoryNodes.To'),
        dataIndex: 'toStatus',
        sorter: isEnableSorter('to_status'),
      },
      {
        dataIndex: 'attempts',
        title: t('comp:BAIDeploymentSchedulingHistoryNodes.Attempts'),
        key: 'attempts',
        sorter: isEnableSorter('attempts'),
      },
      {
        key: 'errorCode',
        title: t('comp:BAIDeploymentSchedulingHistoryNodes.ErrorCode'),
        dataIndex: 'errorCode',
        render: (__, record) =>
          record.errorCode ? (
            <BAIText monospace>{record.errorCode}</BAIText>
          ) : (
            '-'
          ),
        sorter: isEnableSorter('errorCode'),
      },
      {
        key: 'message',
        title: t('comp:BAIDeploymentSchedulingHistoryNodes.Message'),
        dataIndex: 'message',
        onCell: () => ({ style: { maxWidth: 500 } }),
        render: (__, record) =>
          record.message ? (
            <BAIText title={record.message} style={{ width: '100%' }}>
              {newLineToBrElement(record.message)}
            </BAIText>
          ) : (
            '-'
          ),
        sorter: isEnableSorter('message'),
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
      rowKey={'id'}
      dataSource={filterOutNullAndUndefined(histories)}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableDeploymentHistorySorterValues)[number]) ||
            null,
        );
      }}
      {...tableProps}
    />
  );
};

export default BAIDeploymentSchedulingHistoryNodes;
