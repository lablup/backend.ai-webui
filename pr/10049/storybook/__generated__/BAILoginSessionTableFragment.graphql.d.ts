import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAILoginSessionTableFragment$data = ReadonlyArray<{
    readonly accessKey: string;
    readonly createdAt: string;
    readonly id: string;
    readonly user: {
        readonly basicInfo: {
            readonly email: string;
        };
        readonly id: string;
    } | null | undefined;
    readonly " $fragmentType": "BAILoginSessionTableFragment";
}>;
export type BAILoginSessionTableFragment$key = ReadonlyArray<{
    readonly " $data"?: BAILoginSessionTableFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAILoginSessionTableFragment">;
}>;
declare const node: ReaderFragment;
export default node;
