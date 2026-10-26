import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
export type BAIRouteSchedulingHistoryTableFragment$data = ReadonlyArray<{
    readonly id: string;
    readonly phase: string;
    readonly result: SchedulingResult;
    readonly subSteps: ReadonlyArray<{
        readonly step: string;
        readonly " $fragmentSpreads": FragmentRefs<"BAISubStepNodesFragment">;
    }>;
    readonly " $fragmentSpreads": FragmentRefs<"BAIRouteSchedulingHistoryNodeTableFragment">;
    readonly " $fragmentType": "BAIRouteSchedulingHistoryTableFragment";
}>;
export type BAIRouteSchedulingHistoryTableFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIRouteSchedulingHistoryTableFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIRouteSchedulingHistoryTableFragment">;
}>;
declare const node: ReaderFragment;
export default node;
