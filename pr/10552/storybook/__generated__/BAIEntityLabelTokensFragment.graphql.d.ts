import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIEntityLabelTokensFragment$data = {
    readonly edges: ReadonlyArray<{
        readonly node: {
            readonly key: string;
            readonly value: string;
        };
    }>;
    readonly " $fragmentType": "BAIEntityLabelTokensFragment";
};
export type BAIEntityLabelTokensFragment$key = {
    readonly " $data"?: BAIEntityLabelTokensFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIEntityLabelTokensFragment">;
};
declare const node: ReaderFragment;
export default node;
