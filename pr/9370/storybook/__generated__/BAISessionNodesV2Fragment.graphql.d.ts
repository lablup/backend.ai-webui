import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type SessionV2Status = "CANCELLED" | "CREATING" | "DEPRIORITIZING" | "PENDING" | "PREEMPTED" | "PREPARED" | "PREPARING" | "RESCHEDULING" | "RUNNING" | "SCHEDULED" | "TERMINATED" | "TERMINATING" | "%future added value";
export type BAISessionNodesV2Fragment$data = ReadonlyArray<{
    readonly id: string;
    readonly images: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly " $fragmentSpreads": FragmentRefs<"BAIImageNodeSimpleTagV2Fragment">;
            };
        }>;
    } | null | undefined;
    readonly lifecycle: {
        readonly createdAt: string | null | undefined;
        readonly status: SessionV2Status;
        readonly terminatedAt: string | null | undefined;
    };
    readonly metadata: {
        readonly name: string;
        readonly " $fragmentSpreads": FragmentRefs<"BAISessionClusterModeV2Fragment" | "BAISessionTypeTagV2Fragment">;
    };
    readonly project: {
        readonly basicInfo: {
            readonly name: string;
        };
        readonly id: string;
    } | null | undefined;
    readonly resource: {
        readonly allocation: {
            readonly requested: {
                readonly entries: ReadonlyArray<{
                    readonly quantity: any;
                    readonly resourceType: string;
                }>;
            };
            readonly used: {
                readonly entries: ReadonlyArray<{
                    readonly quantity: any;
                    readonly resourceType: string;
                }>;
            } | null | undefined;
        };
        readonly resourceGroupName: string | null | undefined;
    };
    readonly user: {
        readonly basicInfo: {
            readonly email: string;
        };
        readonly id: string;
    } | null | undefined;
    readonly " $fragmentType": "BAISessionNodesV2Fragment";
} | null | undefined>;
export type BAISessionNodesV2Fragment$key = ReadonlyArray<{
    readonly " $data"?: BAISessionNodesV2Fragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAISessionNodesV2Fragment">;
}>;
declare const node: ReaderFragment;
export default node;
