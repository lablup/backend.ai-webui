import { BAIDeploymentSchedulingHistoryTableFragment$key } from '../../__generated__/BAIDeploymentSchedulingHistoryTableFragment.graphql';
import { SchedulingHistoryExpandMode } from '../../hooks/useSchedulingHistoryExpandable';
import { BAIDeploymentSchedulingHistoryNodesProps } from './BAIDeploymentSchedulingHistoryNodes';
export interface BAIDeploymentSchedulingHistoryTableProps extends Omit<BAIDeploymentSchedulingHistoryNodesProps, 'schedulingHistoryFrgmt' | 'expandable'> {
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
declare const BAIDeploymentSchedulingHistoryTable: ({ schedulingHistoryFrgmt, expandMode, onExpandModeChange, ...rest }: BAIDeploymentSchedulingHistoryTableProps) => import("react").JSX.Element;
export default BAIDeploymentSchedulingHistoryTable;
