import { BAISchedulingHistoryNodesFragment$data, BAISchedulingHistoryNodesFragment$key } from '../../__generated__/BAISchedulingHistoryNodesFragment.graphql';
import { BAITableProps, BAIColumnsType } from '../Table';
export type SchedulingHistoryNodeInList = NonNullable<BAISchedulingHistoryNodesFragment$data[number]>;
export declare const availableHistorySorterValues: readonly never[];
export interface BAISchedulingHistoryNodesProps extends Omit<BAITableProps<SchedulingHistoryNodeInList>, 'dataSource' | 'onChangeOrder' | 'columns'> {
    schedulingHistoryFrgmt: BAISchedulingHistoryNodesFragment$key;
    disableSorter?: boolean;
    customizeColumns?: (baseColumns: BAIColumnsType<SchedulingHistoryNodeInList>) => BAIColumnsType<SchedulingHistoryNodeInList>;
    onChangeOrder?: (order: (typeof availableHistorySorterValues)[number] | null) => void;
}
declare const BAISchedulingHistoryNodes: ({ schedulingHistoryFrgmt, disableSorter, customizeColumns, onChangeOrder, ...tableProps }: BAISchedulingHistoryNodesProps) => import("react").JSX.Element;
export default BAISchedulingHistoryNodes;
