import {
  BAISchedulingHistoryNodesFragment$data,
  BAISchedulingHistoryNodesFragment$key,
} from '../../__generated__/BAISchedulingHistoryNodesFragment.graphql';
import { filterOutEmpty, filterOutNullAndUndefined } from '../../helper';
import BAISchedulingResultBadge, {
  SchedulingResult,
} from '../BAISchedulingResultBadge';
import {
  BAIColumnsType,
  BAIColumnType,
  BAITable,
  BAITableProps,
} from '../Table';
import { BAIColumnGroupType } from '../Table/BAITable';
import BAISessionHistorySubStepNodes from './BAISessionHistorySubStepNodes';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type SchedulingHistoryNodeInList = NonNullable<
  BAISchedulingHistoryNodesFragment$data[number]
>;

const availableHistorySorterKeys = ['created_at', 'updated_at'] as const;

export const availableHistorySorterValues = [
  ...availableHistorySorterKeys,
  ...availableHistorySorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableHistorySorterKeys, key);
};

export interface BAISchedulingHistoryNodesProps extends Omit<
  BAITableProps<SchedulingHistoryNodeInList>,
  'dataSource' | 'onChangeOrder' | 'columns'
> {
  schedulingHistoryFrgmt: BAISchedulingHistoryNodesFragment$key;
  disableSorter?: boolean;
  customizeColumns?: (
    baseColumns: BAIColumnsType<SchedulingHistoryNodeInList>,
  ) => BAIColumnsType<SchedulingHistoryNodeInList>;
  onChangeOrder?: (
    order: (typeof availableHistorySorterValues)[number] | null,
  ) => void;
}

const BAISchedulingHistoryNodes = ({
  schedulingHistoryFrgmt,
  disableSorter,
  customizeColumns,
  onChangeOrder,
  ...tableProps
}: BAISchedulingHistoryNodesProps) => {
  'use memo';
  const { t } = useTranslation();

  const histories = useFragment<BAISchedulingHistoryNodesFragment$key>(
    graphql`
      fragment BAISchedulingHistoryNodesFragment on SessionSchedulingHistory
      @relay(plural: true) {
        id
        sessionId
        attempts
        createdAt
        updatedAt
        fromStatus
        toStatus
        message
        phase
        result
        subSteps {
          ...BAISessionHistorySubStepNodesFragment
        }
      }
    `,
    schedulingHistoryFrgmt,
  );

  const baseColumns = _.map(
    filterOutEmpty<
      | BAIColumnType<SchedulingHistoryNodeInList>
      | BAIColumnGroupType<SchedulingHistoryNodeInList>
    >([
      {
        dataIndex: 'phase',
        title: t('comp:BAISchedulingHistoryNodes.Phase'),
        key: 'phase',
        sorter: isEnableSorter('phase'),
      },
      {
        dataIndex: 'result',
        title: t('comp:BAISchedulingHistoryNodes.Result'),
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
        title: t('comp:BAISchedulingHistoryNodes.StatusTransition'),
        key: 'statusTransition',
        children: [
          {
            key: 'fromStatus',
            title: t('comp:BAISchedulingHistoryNodes.From'),
            dataIndex: 'fromStatus',
            sorter: isEnableSorter('from_status'),
          },
          {
            key: 'toStatus',
            title: t('comp:BAISchedulingHistoryNodes.To'),
            dataIndex: 'toStatus',
            sorter: isEnableSorter('to_status'),
          },
        ],
      },
      {
        dataIndex: 'attempts',
        title: t('comp:BAISchedulingHistoryNodes.Attempts'),
        key: 'attempts',
        sorter: isEnableSorter('attempts'),
      },
      {
        dataIndex: 'updatedAt',
        title: t('comp:BAISchedulingHistoryNodes.UpdatedAt'),
        key: 'updatedAt',
        render: (value) => <span>{dayjs(value).format('ll LT')}</span>,
        sorter: isEnableSorter('updated_at'),
      },
      {
        dataIndex: 'createdAt',
        title: t('comp:BAISchedulingHistoryNodes.CreatedAt'),
        key: 'createdAt',
        render: (value) => <span>{dayjs(value).format('ll LT')}</span>,
        sorter: isEnableSorter('created_at'),
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
          (order as (typeof availableHistorySorterValues)[number]) || null,
        );
      }}
      expandable={{
        rowExpandable: (record) => !_.isEmpty(record.subSteps),
        expandedRowRender: (record) => {
          return (
            <BAISessionHistorySubStepNodes
              resizable
              subStepsFrgmt={record.subSteps}
              pagination={false}
            />
          );
        },
      }}
      {...tableProps}
    ></BAITable>
  );
};

export default BAISchedulingHistoryNodes;
