import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
export type BAISubStepNodesFragment$data = ReadonlyArray<{
    readonly endedAt: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly message: string | null | undefined;
    readonly result: SchedulingResult;
    readonly startedAt: string | null | undefined;
    readonly step: string;
    readonly " $fragmentType": "BAISubStepNodesFragment";
}>;
export type BAISubStepNodesFragment$key = ReadonlyArray<{
    readonly " $data"?: BAISubStepNodesFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAISubStepNodesFragment">;
}>;
declare const node: ReaderFragment;
export default node;
