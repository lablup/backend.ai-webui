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
import BAISubStepNodes from './BAISubStepNodes';
import * as _ from 'lodash-es';
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
        result
        subSteps {
          __typename
        }
        ...BAIDeploymentSchedulingHistoryNodesFragment
      }
    `,
    schedulingHistoryFrgmt,
  );

  const dataSource = filterOutNullAndUndefined(histories);
  const { mode, expandedRowKeys, onExpandedRowsChange, expandColumnTitle } =
    useSchedulingHistoryExpandable(dataSource, {
      mode: expandMode,
      onModeChange: onExpandModeChange,
    });

  return (
    <BAIDeploymentSchedulingHistoryNodes
      schedulingHistoryFrgmt={histories}
      expandable={{
        columnTitle: expandColumnTitle,
        expandedRowKeys,
        onExpandedRowsChange,
        rowExpandable: (record: DeploymentSchedulingHistoryNodeInList) =>
          !_.isEmpty(record.subSteps),
        expandedRowRender: (record: DeploymentSchedulingHistoryNodeInList) => (
          <BAISubStepNodes
            resizable
            subStepsFrgmt={record.subSteps}
            pagination={false}
            errorsOnly={mode === 'errors-only'}
          />
        ),
      }}
      neoHeader={false}
      {...rest}
    />
  );
};

export default BAIDeploymentSchedulingHistoryTable;
