import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
export type BAIDeploymentSchedulingHistoryTableFragment$data = ReadonlyArray<{
    readonly id: string;
    readonly phase: string;
    readonly result: SchedulingResult;
    readonly subSteps: ReadonlyArray<{
        readonly step: string;
        readonly " $fragmentSpreads": FragmentRefs<"BAISubStepNodesFragment">;
    }>;
    readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentSchedulingHistoryNodesFragment">;
    readonly " $fragmentType": "BAIDeploymentSchedulingHistoryTableFragment";
}>;
export type BAIDeploymentSchedulingHistoryTableFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIDeploymentSchedulingHistoryTableFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentSchedulingHistoryTableFragment">;
}>;
declare const node: ReaderFragment;
export default node;
