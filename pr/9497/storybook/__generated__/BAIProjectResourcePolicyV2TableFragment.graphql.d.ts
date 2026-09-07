import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIProjectResourcePolicyV2TableFragment$data = ReadonlyArray<{
    readonly createdAt: string | null | undefined;
    readonly id: string;
    readonly maxNetworkCount: number;
    readonly maxQuotaScopeSize: {
        readonly expr: string;
    };
    readonly maxVfolderCount: number;
    readonly name: string;
    readonly " $fragmentType": "BAIProjectResourcePolicyV2TableFragment";
}>;
export type BAIProjectResourcePolicyV2TableFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIProjectResourcePolicyV2TableFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIProjectResourcePolicyV2TableFragment">;
}>;
declare const node: ReaderFragment;
export default node;
