import { BAIRouteNodesFragment$data, BAIRouteNodesFragment$key } from '../../__generated__/BAIRouteNodesFragment.graphql';
import { BAIColumnsType, BAITableProps } from '../Table';
export type RouteNodeInList = NonNullable<BAIRouteNodesFragment$data[number]>;
export declare const availableRouteSorterValues: readonly ["createdAt", "status", "trafficRatio", ...("-status" | "-createdAt" | "-trafficRatio")[]];
export interface BAIRouteNodesProps extends Omit<BAITableProps<RouteNodeInList>, 'dataSource' | 'onChangeOrder' | 'columns'> {
    routesFrgmt: BAIRouteNodesFragment$key;
    customizeColumns?: (baseColumns: BAIColumnsType<RouteNodeInList>) => BAIColumnsType<RouteNodeInList>;
    disableSorter?: boolean;
    onChangeOrder?: (order: (typeof availableRouteSorterValues)[number] | null) => void;
    onClickSessionId?: (sessionId: string) => void;
    onClickErrorData?: (errorData: unknown) => void;
    onClickSchedulingHistory?: (routeId: string) => void;
}
declare const BAIRouteNodes: ({ routesFrgmt, customizeColumns, disableSorter, onChangeOrder, onClickSessionId, onClickErrorData, onClickSchedulingHistory, ...tableProps }: BAIRouteNodesProps) => import("react").JSX.Element;
export default BAIRouteNodes;
