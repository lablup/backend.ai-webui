import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
export type BAISchedulingHistoryTableFragment$data = ReadonlyArray<{
    readonly id: string;
    readonly phase: string;
    readonly result: SchedulingResult;
    readonly subSteps: ReadonlyArray<{
        readonly step: string;
        readonly " $fragmentSpreads": FragmentRefs<"BAISubStepNodesFragment">;
    }>;
    readonly " $fragmentSpreads": FragmentRefs<"BAISchedulingHistoryNodesFragment">;
    readonly " $fragmentType": "BAISchedulingHistoryTableFragment";
}>;
export type BAISchedulingHistoryTableFragment$key = ReadonlyArray<{
    readonly " $data"?: BAISchedulingHistoryTableFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAISchedulingHistoryTableFragment">;
}>;
declare const node: ReaderFragment;
export default node;
