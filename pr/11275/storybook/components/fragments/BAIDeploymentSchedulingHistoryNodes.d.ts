import { BAIDeploymentSchedulingHistoryNodesFragment$data, BAIDeploymentSchedulingHistoryNodesFragment$key } from '../../__generated__/BAIDeploymentSchedulingHistoryNodesFragment.graphql';
import { BAIColumnsType, BAITableProps } from '../Table';
export type DeploymentSchedulingHistoryNodeInList = NonNullable<BAIDeploymentSchedulingHistoryNodesFragment$data[number]>;
export declare const availableDeploymentHistorySorterValues: readonly never[];
export interface BAIDeploymentSchedulingHistoryNodesProps extends Omit<BAITableProps<DeploymentSchedulingHistoryNodeInList>, 'dataSource' | 'onChangeOrder' | 'columns'> {
    schedulingHistoryFrgmt: BAIDeploymentSchedulingHistoryNodesFragment$key;
    disableSorter?: boolean;
    customizeColumns?: (baseColumns: BAIColumnsType<DeploymentSchedulingHistoryNodeInList>) => BAIColumnsType<DeploymentSchedulingHistoryNodeInList>;
    onChangeOrder?: (order: (typeof availableDeploymentHistorySorterValues)[number] | null) => void;
}
declare const BAIDeploymentSchedulingHistoryNodes: ({ schedulingHistoryFrgmt, disableSorter, customizeColumns, onChangeOrder, ...tableProps }: BAIDeploymentSchedulingHistoryNodesProps) => import("react").JSX.Element;
export default BAIDeploymentSchedulingHistoryNodes;
