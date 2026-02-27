import {
  BAISessionHistorySubStepNodesFragment$data,
  BAISessionHistorySubStepNodesFragment$key,
} from '../../__generated__/BAISessionHistorySubStepNodesFragment.graphql';
import { filterOutEmpty, filterOutNullAndUndefined } from '../../helper';
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
import duration from 'dayjs/plugin/duration';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

dayjs.extend(duration);

export type SubStepInList = NonNullable<
  BAISessionHistorySubStepNodesFragment$data[number]
>;

const availableSubStepSorterKeys = [] as const;

export const availableSubStepSorterValues = [] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableSubStepSorterKeys, key);
};

export interface BAISessionHistorySubStepNodesProps extends Omit<
  BAITableProps<SubStepInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  subStepsFrgmt: BAISessionHistorySubStepNodesFragment$key;
  customizeColumns?: (
    baseColumns: BAIColumnsType<SubStepInList>,
  ) => BAIColumnsType<SubStepInList>;
  disableSorter?: boolean;
}

const BAISessionHistorySubStepNodes = ({
  subStepsFrgmt,
  customizeColumns,
  disableSorter,
  ...tableProps
}: BAISessionHistorySubStepNodesProps) => {
  'use memo';
  const { t } = useTranslation();

  const subSteps = useFragment<BAISessionHistorySubStepNodesFragment$key>(
    graphql`
      fragment BAISessionHistorySubStepNodesFragment on SubStepResultGQL
      @relay(plural: true) {
        step
        result
        errorCode
        message
        startedAt
        endedAt
      }
    `,
    subStepsFrgmt,
  );

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<SubStepInList>>([
      {
        key: 'step',
        title: t('comp:SessionHistorySubStepNodes.Step'),
        dataIndex: 'step',
        fixed: 'left',
        sorter: isEnableSorter('step'),
      },
      {
        key: 'result',
        title: t('comp:SessionHistorySubStepNodes.Result'),
        dataIndex: 'result',
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
        key: 'message',
        title: t('comp:SessionHistorySubStepNodes.Message'),
        dataIndex: 'message',
        onCell: () => ({ style: { maxWidth: 300 } }),
        render: (__, record) =>
          record.message ? (
            <BAIText ellipsis title={record.message} style={{ width: '100%' }}>
              {record.message}
            </BAIText>
          ) : (
            '-'
          ),
        sorter: isEnableSorter('message'),
      },
      {
        key: 'errorCode',
        title: t('comp:SessionHistorySubStepNodes.ErrorCode'),
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
        key: 'startedAt',
        title: t('comp:SessionHistorySubStepNodes.StartedAt'),
        dataIndex: 'startedAt',
        render: (__, record) =>
          record.startedAt ? dayjs(record.startedAt).format('lll') : '-',
        sorter: isEnableSorter('startedAt'),
      },
      {
        key: 'endedAt',
        title: t('comp:SessionHistorySubStepNodes.EndedAt'),
        dataIndex: 'endedAt',
        render: (__, record) =>
          record.endedAt ? dayjs(record.endedAt).format('lll') : '-',
        sorter: isEnableSorter('endedAt'),
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
      rowKey="step"
      size="small"
      dataSource={filterOutNullAndUndefined(subSteps)}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
      {...tableProps}
    />
  );
};

export default BAISessionHistorySubStepNodes;
