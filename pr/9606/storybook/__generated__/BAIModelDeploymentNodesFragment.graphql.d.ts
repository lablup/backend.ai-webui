import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
export type DeploymentStrategyType = "BLUE_GREEN" | "ROLLING" | "%future added value";
export type BAIModelDeploymentNodesFragment$data = ReadonlyArray<{
    readonly currentRevision: {
        readonly id: string;
        readonly modelMountConfig: {
            readonly vfolder: {
                readonly id: string;
                readonly name: string | null | undefined;
            } | null | undefined;
        } | null | undefined;
        readonly revisionNumber: number;
    } | null | undefined;
    readonly currentRevisionId: string | null | undefined;
    readonly defaultDeploymentStrategy: {
        readonly type: DeploymentStrategyType;
    };
    readonly id: string;
    readonly metadata: {
        readonly createdAt: string;
        readonly domainName: string;
        readonly name: string;
        readonly projectId: string;
        readonly projectV2: {
            readonly basicInfo: {
                readonly name: string;
            };
            readonly id: string;
        } | null | undefined;
        readonly resourceGroupName: string;
        readonly status: DeploymentStatus;
        readonly tags: ReadonlyArray<string>;
        readonly updatedAt: string;
        readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentTagChips_metadata">;
    };
    readonly networkAccess: {
        readonly endpointUrl: string | null | undefined;
        readonly openToPublic: boolean;
        readonly preferredDomainName: string | null | undefined;
    };
    readonly replicaState: {
        readonly desiredReplicaCount: number;
    };
    readonly runningReplicas: {
        readonly count: number;
    } | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentOwnerInfo_deployment">;
    readonly " $fragmentType": "BAIModelDeploymentNodesFragment";
}>;
export type BAIModelDeploymentNodesFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIModelDeploymentNodesFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIModelDeploymentNodesFragment">;
}>;
declare const node: ReaderFragment;
export default node;
