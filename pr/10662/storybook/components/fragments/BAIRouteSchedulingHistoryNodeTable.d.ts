import { BAIRouteSchedulingHistoryNodeTableFragment$data, BAIRouteSchedulingHistoryNodeTableFragment$key } from '../../__generated__/BAIRouteSchedulingHistoryNodeTableFragment.graphql';
import { BAIColumnsType, BAITableProps } from '../Table';
export type RouteSchedulingHistoryNodeInList = NonNullable<BAIRouteSchedulingHistoryNodeTableFragment$data[number]>;
export declare const availableRouteHistorySorterValues: readonly never[];
export interface BAIRouteSchedulingHistoryNodesProps extends Omit<BAITableProps<RouteSchedulingHistoryNodeInList>, 'dataSource' | 'onChangeOrder' | 'columns'> {
    schedulingHistoryFrgmt: BAIRouteSchedulingHistoryNodeTableFragment$key;
    disableSorter?: boolean;
    customizeColumns?: (baseColumns: BAIColumnsType<RouteSchedulingHistoryNodeInList>) => BAIColumnsType<RouteSchedulingHistoryNodeInList>;
    onChangeOrder?: (order: (typeof availableRouteHistorySorterValues)[number] | null) => void;
}
declare const BAIRouteSchedulingHistoryNodeTable: ({ schedulingHistoryFrgmt, disableSorter, customizeColumns, onChangeOrder, ...tableProps }: BAIRouteSchedulingHistoryNodesProps) => import("react").JSX.Element;
export default BAIRouteSchedulingHistoryNodeTable;
