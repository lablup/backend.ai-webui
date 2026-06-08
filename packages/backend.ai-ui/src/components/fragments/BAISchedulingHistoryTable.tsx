import { BAISchedulingHistoryTableFragment$key } from '../../__generated__/BAISchedulingHistoryTableFragment.graphql';
import { filterOutNullAndUndefined } from '../../helper';
import BAISchedulingHistoryNodes, {
  BAISchedulingHistoryNodesProps,
  SchedulingHistoryNodeInList,
} from './BAISchedulingHistoryNodes';
import BAISubStepNodes from './BAISubStepNodes';
import { useSchedulingHistoryExpandable } from './useSchedulingHistoryExpandable';
import * as _ from 'lodash-es';
import { graphql, useFragment } from 'react-relay';

export interface BAISchedulingHistoryTableProps extends Omit<
  BAISchedulingHistoryNodesProps,
  'schedulingHistoryFrgmt' | 'expandable'
> {
  schedulingHistoryFrgmt: BAISchedulingHistoryTableFragment$key;
}

/**
 * Thin wrapper around the pure `BAISchedulingHistoryNodes` fragment table that
 * adds the optional expand/collapse-all sub-step feature. It owns its own
 * fragment (selecting the fields the expandable hook needs) and feeds the
 * resolved rows straight through to the nodes component as the nodes fragment
 * ref — valid because this fragment spreads the nodes fragment.
 */
const BAISchedulingHistoryTable = ({
  schedulingHistoryFrgmt,
  ...rest
}: BAISchedulingHistoryTableProps) => {
  'use memo';
  const histories = useFragment(
    graphql`
      fragment BAISchedulingHistoryTableFragment on SessionSchedulingHistory
      @relay(plural: true) {
        id
        result
        subSteps {
          __typename
        }
        ...BAISchedulingHistoryNodesFragment
      }
    `,
    schedulingHistoryFrgmt,
  );

  const dataSource = filterOutNullAndUndefined(histories);
  const { expandedRowKeys, onExpandedRowsChange, expandColumnTitle } =
    useSchedulingHistoryExpandable(dataSource);

  return (
    <BAISchedulingHistoryNodes
      schedulingHistoryFrgmt={histories}
      expandable={{
        columnTitle: expandColumnTitle,
        expandedRowKeys,
        onExpandedRowsChange,
        rowExpandable: (record: SchedulingHistoryNodeInList) =>
          !_.isEmpty(record.subSteps),
        expandedRowRender: (record: SchedulingHistoryNodeInList) => (
          <BAISubStepNodes
            resizable
            subStepsFrgmt={record.subSteps}
            pagination={false}
          />
        ),
      }}
      {...rest}
    />
  );
};

export default BAISchedulingHistoryTable;
