import { BAIRouteSchedulingHistoryTableFragment$key } from '../../__generated__/BAIRouteSchedulingHistoryTableFragment.graphql';
import { filterOutNullAndUndefined } from '../../helper';
import BAIRouteSchedulingHistoryNodeTable, {
  BAIRouteSchedulingHistoryNodesProps,
  RouteSchedulingHistoryNodeInList,
} from './BAIRouteSchedulingHistoryNodeTable';
import BAISubStepNodes from './BAISubStepNodes';
import {
  type SchedulingHistoryExpandMode,
  useSchedulingHistoryExpandable,
} from './useSchedulingHistoryExpandable';
import * as _ from 'lodash-es';
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
        result
        subSteps {
          __typename
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
    });

  return (
    <BAIRouteSchedulingHistoryNodeTable
      schedulingHistoryFrgmt={histories}
      expandable={{
        columnTitle: expandColumnTitle,
        expandedRowKeys,
        onExpandedRowsChange,
        rowExpandable: (record: RouteSchedulingHistoryNodeInList) =>
          !_.isEmpty(record.subSteps),
        expandedRowRender: (record: RouteSchedulingHistoryNodeInList) => (
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

export default BAIRouteSchedulingHistoryTable;
