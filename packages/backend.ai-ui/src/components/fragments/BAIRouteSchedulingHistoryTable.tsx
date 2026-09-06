import { BAIRouteSchedulingHistoryTableFragment$key } from '../../__generated__/BAIRouteSchedulingHistoryTableFragment.graphql';
import { filterOutNullAndUndefined } from '../../helper';
import {
  type SchedulingHistoryExpandMode,
  useSchedulingHistoryExpandable,
} from '../../hooks/useSchedulingHistoryExpandable';
import BAIRouteSchedulingHistoryNodeTable, {
  BAIRouteSchedulingHistoryNodesProps,
  RouteSchedulingHistoryNodeInList,
} from './BAIRouteSchedulingHistoryNodeTable';
import BAISubStepNodes, { countExecutedSubSteps } from './BAISubStepNodes';
import { graphql, useFragment } from 'react-relay';

export interface BAIRouteSchedulingHistoryTableProps extends Omit<
  BAIRouteSchedulingHistoryNodesProps,
  'schedulingHistoryFrgmt' | 'expandable'
> {
  schedulingHistoryFrgmt: BAIRouteSchedulingHistoryTableFragment$key;
  expandMode?: SchedulingHistoryExpandMode;
  onExpandModeChange?: (mode: SchedulingHistoryExpandMode) => void;
}

/**
 * Thin wrapper around the pure `BAIRouteSchedulingHistoryNodeTable` fragment
 * table that adds the optional expand/collapse-all sub-step feature. It owns
 * its own fragment (selecting the fields the expandable hook needs) and feeds
 * the resolved rows straight through to the nodes component as the nodes
 * fragment ref — valid because this fragment spreads the nodes fragment.
 */
const BAIRouteSchedulingHistoryTable = ({
  schedulingHistoryFrgmt,
  expandMode,
  onExpandModeChange,
  ...rest
}: BAIRouteSchedulingHistoryTableProps) => {
  'use memo';
  const histories = useFragment(
    graphql`
      fragment BAIRouteSchedulingHistoryTableFragment on RouteHistory
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
        ...BAIRouteSchedulingHistoryNodeTableFragment
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
    <BAIRouteSchedulingHistoryNodeTable
      schedulingHistoryFrgmt={histories}
      expandable={{
        columnTitle: expandColumnTitle,
        expandedRowKeys,
        onExpandedRowsChange,
        rowExpandable: (record: RouteSchedulingHistoryNodeInList) =>
          countExecutedSubSteps(
            dataSource.find((h) => h.id === record.id)?.subSteps ?? [],
            record.phase,
          ) > 0,
        expandedRowRender: (record: RouteSchedulingHistoryNodeInList) => (
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

export default BAIRouteSchedulingHistoryTable;
