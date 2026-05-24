import {
  BAIRouteSchedulingHistoryNodeTableFragment$data,
  BAIRouteSchedulingHistoryNodeTableFragment$key,
} from '../../__generated__/BAIRouteSchedulingHistoryNodeTableFragment.graphql';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  newLineToBrElement,
} from '../../helper';
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
import { BAIColumnGroupType } from '../Table/BAITable';
import BAISubStepNodes from './BAISubStepNodes';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type RouteSchedulingHistoryNodeInList = NonNullable<
  BAIRouteSchedulingHistoryNodeTableFragment$data[number]
>;

const availableHistorySorterKeys = [] as const;

export const availableRouteHistorySorterValues = [
  ...availableHistorySorterKeys,
  ...availableHistorySorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableHistorySorterKeys, key);
};

export interface BAIRouteSchedulingHistoryNodesProps extends Omit<
  BAITableProps<RouteSchedulingHistoryNodeInList>,
  'dataSource' | 'onChangeOrder' | 'columns'
> {
  schedulingHistoryFrgmt: BAIRouteSchedulingHistoryNodeTableFragment$key;
  disableSorter?: boolean;
  customizeColumns?: (
    baseColumns: BAIColumnsType<RouteSchedulingHistoryNodeInList>,
  ) => BAIColumnsType<RouteSchedulingHistoryNodeInList>;
  onChangeOrder?: (
    order: (typeof availableRouteHistorySorterValues)[number] | null,
  ) => void;
}

const BAIRouteSchedulingHistoryNodeTable = ({
  schedulingHistoryFrgmt,
  disableSorter,
  customizeColumns,
  onChangeOrder,
  ...tableProps
}: BAIRouteSchedulingHistoryNodesProps) => {
  'use memo';
  const { t } = useTranslation();

  const histories = useFragment<BAIRouteSchedulingHistoryNodeTableFragment$key>(
    graphql`
      fragment BAIRouteSchedulingHistoryNodeTableFragment on RouteHistory
      @relay(plural: true) {
        id
        routeId
        deploymentId
        category
        phase
        fromStatus
        toStatus
        result
        errorCode
        message
        subSteps {
          ...BAISubStepNodesFragment
        }
        attempts
        createdAt
        updatedAt
      }
    `,
    schedulingHistoryFrgmt,
  );

  const baseColumns = _.map(
    filterOutEmpty<
      | BAIColumnType<RouteSchedulingHistoryNodeInList>
      | BAIColumnGroupType<RouteSchedulingHistoryNodeInList>
    >([
      {
        dataIndex: 'updatedAt',
        title: t('comp:BAIRouteSchedulingHistoryNodes.UpdatedAt'),
        key: 'updatedAt',
        render: (value) => <span>{dayjs(value).format('ll LTS')}</span>,
        sorter: isEnableSorter('updated_at'),
      },
      {
        dataIndex: 'createdAt',
        title: t('comp:BAIRouteSchedulingHistoryNodes.CreatedAt'),
        key: 'createdAt',
        render: (value) => <span>{dayjs(value).format('ll LTS')}</span>,
        sorter: isEnableSorter('created_at'),
      },
      {
        dataIndex: 'phase',
        title: t('comp:BAIRouteSchedulingHistoryNodes.Phase'),
        key: 'phase',
        sorter: isEnableSorter('phase'),
      },
      {
        dataIndex: 'result',
        title: t('comp:BAIRouteSchedulingHistoryNodes.Result'),
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
        title: t('comp:BAIRouteSchedulingHistoryNodes.Category'),
        key: 'category',
        sorter: isEnableSorter('category'),
      },
      {
        title: t('comp:BAIRouteSchedulingHistoryNodes.StatusTransition'),
        key: 'statusTransition',
        children: [
          {
            key: 'fromStatus',
            title: t('comp:BAIRouteSchedulingHistoryNodes.From'),
            dataIndex: 'fromStatus',
            sorter: isEnableSorter('from_status'),
          },
          {
            key: 'toStatus',
            title: t('comp:BAIRouteSchedulingHistoryNodes.To'),
            dataIndex: 'toStatus',
            sorter: isEnableSorter('to_status'),
          },
        ],
      },
      {
        dataIndex: 'attempts',
        title: t('comp:BAIRouteSchedulingHistoryNodes.Attempts'),
        key: 'attempts',
        sorter: isEnableSorter('attempts'),
      },
      {
        key: 'errorCode',
        title: t('comp:BAIRouteSchedulingHistoryNodes.ErrorCode'),
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
        title: t('comp:BAIRouteSchedulingHistoryNodes.Message'),
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
          (order as (typeof availableRouteHistorySorterValues)[number]) || null,
        );
      }}
      expandable={{
        rowExpandable: (record) => !_.isEmpty(record.subSteps),
        expandedRowRender: (record) => {
          return (
            <BAISubStepNodes
              resizable
              subStepsFrgmt={record.subSteps}
              pagination={false}
            />
          );
        },
      }}
      {...tableProps}
    />
  );
};

export default BAIRouteSchedulingHistoryNodeTable;
