import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
export type BAIRouteSchedulingHistoryNodeTableFragment$data = ReadonlyArray<{
    readonly attempts: number;
    readonly category: string;
    readonly createdAt: string;
    readonly errorCode: string | null | undefined;
    readonly fromStatus: string | null | undefined;
    readonly id: string;
    readonly message: string | null | undefined;
    readonly phase: string;
    readonly result: SchedulingResult;
    readonly toStatus: string | null | undefined;
    readonly updatedAt: string;
    readonly " $fragmentType": "BAIRouteSchedulingHistoryNodeTableFragment";
}>;
export type BAIRouteSchedulingHistoryNodeTableFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIRouteSchedulingHistoryNodeTableFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIRouteSchedulingHistoryNodeTableFragment">;
}>;
declare const node: ReaderFragment;
export default node;
