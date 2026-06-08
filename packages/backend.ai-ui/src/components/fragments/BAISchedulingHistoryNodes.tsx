import {
  BAISchedulingHistoryNodesFragment$data,
  BAISchedulingHistoryNodesFragment$key,
} from '../../__generated__/BAISchedulingHistoryNodesFragment.graphql';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  newLineToBrElement,
} from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { SchedulingResult } from '../BAISchedulingResultBadge';
import BAISchedulingResultCell from '../BAISchedulingResultCell';
import BAIText from '../BAIText';
import {
  BAIColumnsType,
  BAIColumnType,
  BAITable,
  BAITableProps,
} from '../Table';
import { BAIColumnGroupType } from '../Table/BAITable';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { graphql, useFragment } from 'react-relay';

export type SchedulingHistoryNodeInList = NonNullable<
  BAISchedulingHistoryNodesFragment$data[number]
>;

const availableHistorySorterKeys = [] as const;

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
  const { t } = useBAIi18n();

  const histories = useFragment<BAISchedulingHistoryNodesFragment$key>(
    graphql`
      fragment BAISchedulingHistoryNodesFragment on SessionSchedulingHistory
      @relay(plural: true) {
        id
        attempts
        createdAt
        updatedAt
        fromStatus
        toStatus
        message
        phase
        result
        subSteps {
          ...BAISubStepNodesFragment
          step
          result
          errorCode
          message
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
        dataIndex: 'updatedAt',
        title: t('comp:BAISchedulingHistoryNodes.UpdatedAt'),
        key: 'updatedAt',
        render: (value) => <span>{dayjs(value).format('ll LTS')}</span>,
        sorter: isEnableSorter('updated_at'),
      },
      {
        dataIndex: 'createdAt',
        title: t('comp:BAISchedulingHistoryNodes.CreatedAt'),
        key: 'createdAt',
        render: (value) => <span>{dayjs(value).format('ll LTS')}</span>,
        sorter: isEnableSorter('created_at'),
      },
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
          return (
            <BAISchedulingResultCell
              result={result}
              subSteps={record.subSteps}
            />
          );
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
        key: 'message',
        title: t('comp:BAISchedulingHistoryNodes.Message'),
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

  const dataSource = filterOutNullAndUndefined(histories);

  return (
    <BAITable
      // Spread caller props first so the component's fixed props (`rowKey`,
      // `dataSource`, `columns`, …) below stay authoritative. Optional features
      // such as `expandable` are supplied by callers and flow through here.
      {...tableProps}
      rowKey={'id'}
      dataSource={dataSource}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableHistorySorterValues)[number]) || null,
        );
      }}
    ></BAITable>
  );
};

export default BAISchedulingHistoryNodes;
