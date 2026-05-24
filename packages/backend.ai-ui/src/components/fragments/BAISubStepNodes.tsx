import {
  BAISubStepNodesFragment$data,
  BAISubStepNodesFragment$key,
} from '../../__generated__/BAISubStepNodesFragment.graphql';
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
import { theme } from 'antd';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

dayjs.extend(duration);

export type SubStepInList = NonNullable<BAISubStepNodesFragment$data[number]>;

const availableSubStepSorterKeys = [] as const;

export const availableSubStepSorterValues = [] as const;

const FAILURE_RESULTS: ReadonlyArray<SchedulingResult> = [
  'FAILURE',
  'EXPIRED',
  'GIVE_UP',
];

const isEnableSorter = (key: string) => {
  return _.includes(availableSubStepSorterKeys, key);
};

export interface BAISubStepNodesProps extends Omit<
  BAITableProps<SubStepInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  subStepsFrgmt: BAISubStepNodesFragment$key;
  customizeColumns?: (
    baseColumns: BAIColumnsType<SubStepInList>,
  ) => BAIColumnsType<SubStepInList>;
  disableSorter?: boolean;
}

const BAISubStepNodes = ({
  subStepsFrgmt,
  customizeColumns,
  disableSorter,
  ...tableProps
}: BAISubStepNodesProps) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const subSteps = useFragment<BAISubStepNodesFragment$key>(
    graphql`
      fragment BAISubStepNodesFragment on SubStepResultGQL
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
        title: t('comp:BAISubStepNodes.Step'),
        dataIndex: 'step',
        fixed: 'left',
        sorter: isEnableSorter('step'),
        render: (_value, record) => {
          const result =
            record.result && record.result !== '%future added value'
              ? (record.result as SchedulingResult)
              : null;
          const isFailure = result != null && FAILURE_RESULTS.includes(result);
          return (
            <span style={isFailure ? { color: token.colorError } : undefined}>
              {record.step}
            </span>
          );
        },
      },
      {
        key: 'result',
        title: t('comp:BAISubStepNodes.Result'),
        dataIndex: 'result',
        onCell: () => ({ style: { minWidth: 100 } }),
        render: (_value, record) => {
          const result =
            record.result && record.result !== '%future added value'
              ? (record.result as SchedulingResult)
              : null;
          const isFailure = result != null && FAILURE_RESULTS.includes(result);
          return (
            <BAISchedulingResultBadge
              result={result}
              style={{
                color: isFailure ? token.colorError : undefined,
              }}
            />
          );
        },
        sorter: isEnableSorter('result'),
      },
      {
        key: 'message',
        title: t('comp:BAISubStepNodes.Message'),
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
      {
        key: 'errorCode',
        title: t('comp:BAISubStepNodes.ErrorCode'),
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
        title: t('comp:BAISubStepNodes.StartedAt'),
        dataIndex: 'startedAt',
        render: (__, record) =>
          record.startedAt ? dayjs(record.startedAt).format('ll LTS') : '-',
        sorter: isEnableSorter('startedAt'),
      },
      {
        key: 'endedAt',
        title: t('comp:BAISubStepNodes.EndedAt'),
        dataIndex: 'endedAt',
        render: (__, record) =>
          record.endedAt ? dayjs(record.endedAt).format('ll LTS') : '-',
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
      dataSource={filterOutNullAndUndefined(subSteps).reverse()}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
      {...tableProps}
    />
  );
};

export default BAISubStepNodes;
