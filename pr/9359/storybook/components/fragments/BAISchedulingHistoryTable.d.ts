import { BAISchedulingHistoryTableFragment$key } from '../../__generated__/BAISchedulingHistoryTableFragment.graphql';
import { SchedulingHistoryExpandMode } from '../../hooks/useSchedulingHistoryExpandable';
import { BAISchedulingHistoryNodesProps } from './BAISchedulingHistoryNodes';
export interface BAISchedulingHistoryTableProps extends Omit<BAISchedulingHistoryNodesProps, 'schedulingHistoryFrgmt' | 'expandable'> {
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
declare const BAISchedulingHistoryTable: ({ schedulingHistoryFrgmt, expandMode, onExpandModeChange, ...rest }: BAISchedulingHistoryTableProps) => import("react").JSX.Element;
export default BAISchedulingHistoryTable;
