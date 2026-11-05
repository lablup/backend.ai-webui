import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIUserResourcePolicyV2TableFragment$data = ReadonlyArray<{
    readonly createdAt: string | null | undefined;
    readonly id: string;
    readonly maxConcurrentLogins: number | null | undefined;
    readonly maxCustomizedImageCount: number;
    readonly maxQuotaScopeSize: {
        readonly expr: string;
    };
    readonly maxSessionCountPerModelSession: number;
    readonly maxVfolderCount: number;
    readonly name: string;
    readonly " $fragmentType": "BAIUserResourcePolicyV2TableFragment";
}>;
export type BAIUserResourcePolicyV2TableFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIUserResourcePolicyV2TableFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIUserResourcePolicyV2TableFragment">;
}>;
declare const node: ReaderFragment;
export default node;
