import { BAIRouteSchedulingHistoryTableFragment$key } from '../../__generated__/BAIRouteSchedulingHistoryTableFragment.graphql';
import { SchedulingHistoryExpandMode } from '../../hooks/useSchedulingHistoryExpandable';
import { BAIRouteSchedulingHistoryNodesProps } from './BAIRouteSchedulingHistoryNodeTable';
export interface BAIRouteSchedulingHistoryTableProps extends Omit<BAIRouteSchedulingHistoryNodesProps, 'schedulingHistoryFrgmt' | 'expandable'> {
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
declare const BAIRouteSchedulingHistoryTable: ({ schedulingHistoryFrgmt, expandMode, onExpandModeChange, ...rest }: BAIRouteSchedulingHistoryTableProps) => import("react").JSX.Element;
export default BAIRouteSchedulingHistoryTable;
