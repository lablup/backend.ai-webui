import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
export type BAISchedulingHistoryNodesFragment$data = ReadonlyArray<{
    readonly attempts: number;
    readonly createdAt: string;
    readonly fromStatus: string | null | undefined;
    readonly id: string;
    readonly message: string | null | undefined;
    readonly phase: string;
    readonly result: SchedulingResult;
    readonly toStatus: string | null | undefined;
    readonly updatedAt: string;
    readonly " $fragmentType": "BAISchedulingHistoryNodesFragment";
}>;
export type BAISchedulingHistoryNodesFragment$key = ReadonlyArray<{
    readonly " $data"?: BAISchedulingHistoryNodesFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAISchedulingHistoryNodesFragment">;
}>;
declare const node: ReaderFragment;
export default node;
