import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type RouteHealthStatus = "DEGRADED" | "HEALTHY" | "NOT_CHECKED" | "UNHEALTHY" | "%future added value";
export type RouteStatus = "FAILED_TO_START" | "PROVISIONING" | "RUNNING" | "TERMINATED" | "TERMINATING" | "%future added value";
export type RouteTrafficStatus = "ACTIVE" | "INACTIVE" | "%future added value";
export type BAIRouteNodesFragment$data = ReadonlyArray<{
    readonly createdAt: string | null | undefined;
    readonly errorData: any | null | undefined;
    readonly healthStatus: RouteHealthStatus;
    readonly id: string;
    readonly session: string | null | undefined;
    readonly status: RouteStatus;
    readonly trafficRatio: number;
    readonly trafficStatus: RouteTrafficStatus;
    readonly " $fragmentType": "BAIRouteNodesFragment";
}>;
export type BAIRouteNodesFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIRouteNodesFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIRouteNodesFragment">;
}>;
declare const node: ReaderFragment;
export default node;
