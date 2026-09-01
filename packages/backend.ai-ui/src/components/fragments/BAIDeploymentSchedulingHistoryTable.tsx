import { BAIDeploymentSchedulingHistoryTableFragment$key } from '../../__generated__/BAIDeploymentSchedulingHistoryTableFragment.graphql';
import { filterOutNullAndUndefined } from '../../helper';
import {
  type SchedulingHistoryExpandMode,
  useSchedulingHistoryExpandable,
} from '../../hooks/useSchedulingHistoryExpandable';
import BAIDeploymentSchedulingHistoryNodes, {
  BAIDeploymentSchedulingHistoryNodesProps,
  DeploymentSchedulingHistoryNodeInList,
} from './BAIDeploymentSchedulingHistoryNodes';
import BAISubStepNodes, { countExecutedSubSteps } from './BAISubStepNodes';
import { graphql, useFragment } from 'react-relay';

export interface BAIDeploymentSchedulingHistoryTableProps extends Omit<
  BAIDeploymentSchedulingHistoryNodesProps,
  'schedulingHistoryFrgmt' | 'expandable'
> {
  schedulingHistoryFrgmt: BAIDeploymentSchedulingHistoryTableFragment$key;
  expandMode?: SchedulingHistoryExpandMode;
  onExpandModeChange?: (mode: SchedulingHistoryExpandMode) => void;
}

/**
 * Thin wrapper around the pure `BAIDeploymentSchedulingHistoryNodes` fragment
 * table that adds the optional expand/collapse-all sub-step feature. It owns
 * its own fragment (selecting the fields the expandable hook needs) and feeds
 * the resolved rows straight through to the nodes component as the nodes
 * fragment ref — valid because this fragment spreads the nodes fragment.
 */
const BAIDeploymentSchedulingHistoryTable = ({
  schedulingHistoryFrgmt,
  expandMode,
  onExpandModeChange,
  ...rest
}: BAIDeploymentSchedulingHistoryTableProps) => {
  'use memo';
  const histories = useFragment(
    graphql`
      fragment BAIDeploymentSchedulingHistoryTableFragment on DeploymentHistory
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
        ...BAIDeploymentSchedulingHistoryNodesFragment
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
    <BAIDeploymentSchedulingHistoryNodes
      schedulingHistoryFrgmt={histories}
      expandable={{
        columnTitle: expandColumnTitle,
        expandedRowKeys,
        onExpandedRowsChange,
        rowExpandable: (record: DeploymentSchedulingHistoryNodeInList) =>
          countExecutedSubSteps(
            dataSource.find((h) => h.id === record.id)?.subSteps ?? [],
            record.phase,
          ) > 0,
        expandedRowRender: (record: DeploymentSchedulingHistoryNodeInList) => (
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

export default BAIDeploymentSchedulingHistoryTable;
