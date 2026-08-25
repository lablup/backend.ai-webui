import { BAISchedulingHistoryTableFragment$key } from '../../__generated__/BAISchedulingHistoryTableFragment.graphql';
import { filterOutNullAndUndefined } from '../../helper';
import {
  SchedulingHistoryExpandMode,
  useSchedulingHistoryExpandable,
} from '../../hooks/useSchedulingHistoryExpandable';
import BAISchedulingHistoryNodes, {
  BAISchedulingHistoryNodesProps,
  SchedulingHistoryNodeInList,
} from './BAISchedulingHistoryNodes';
import BAISubStepNodes, { countExecutedSubSteps } from './BAISubStepNodes';
import { graphql, useFragment } from 'react-relay';

export interface BAISchedulingHistoryTableProps extends Omit<
  BAISchedulingHistoryNodesProps,
  'schedulingHistoryFrgmt' | 'expandable'
> {
  schedulingHistoryFrgmt: BAISchedulingHistoryTableFragment$key;
  expandMode?: SchedulingHistoryExpandMode;
  onExpandModeChange?: (mode: SchedulingHistoryExpandMode) => void;
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
  expandMode,
  onExpandModeChange,
  ...rest
}: BAISchedulingHistoryTableProps) => {
  'use memo';
  const histories = useFragment(
    graphql`
      fragment BAISchedulingHistoryTableFragment on SessionSchedulingHistory
      @relay(plural: true) {
        id
        phase
        result
        subSteps {
          # Read alongside the spread so the table can tell a row that holds
          # only the trailing lifecycle marker from one with real sub-steps.
          step
          ...BAISubStepNodesFragment
        }
        ...BAISchedulingHistoryNodesFragment
      }
    `,
    schedulingHistoryFrgmt,
  );

  const dataSource = filterOutNullAndUndefined(histories);
  const { expandedRowKeys, onExpandedRowsChange, expandColumnTitle } =
    useSchedulingHistoryExpandable(dataSource, {
      mode: expandMode,
      onModeChange: onExpandModeChange,
      isExpandable: (record) =>
        countExecutedSubSteps(record.subSteps ?? [], record.phase) > 0,
    });

  return (
    <BAISchedulingHistoryNodes
      schedulingHistoryFrgmt={histories}
      expandable={{
        columnTitle: expandColumnTitle,
        expandedRowKeys,
        onExpandedRowsChange,
        rowExpandable: (record: SchedulingHistoryNodeInList) =>
          countExecutedSubSteps(
            dataSource.find((h) => h.id === record.id)?.subSteps ?? [],
            record.phase,
          ) > 0,
        expandedRowRender: (record: SchedulingHistoryNodeInList) => (
          <BAISubStepNodes
            subStepsFrgmt={
              dataSource.find((h) => h.id === record.id)?.subSteps ?? []
            }
            parentPhase={record.phase}
          />
        ),
      }}
      {...rest}
    />
  );
};

export default BAISchedulingHistoryTable;
