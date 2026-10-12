import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
export type BAIDeploymentSchedulingHistoryNodesFragment$data = ReadonlyArray<{
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
    readonly " $fragmentType": "BAIDeploymentSchedulingHistoryNodesFragment";
}>;
export type BAIDeploymentSchedulingHistoryNodesFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIDeploymentSchedulingHistoryNodesFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentSchedulingHistoryNodesFragment">;
}>;
declare const node: ReaderFragment;
export default node;
