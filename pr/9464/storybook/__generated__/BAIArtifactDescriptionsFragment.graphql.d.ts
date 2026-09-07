import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIArtifactDescriptionsFragment$data = {
    readonly description: string | null | undefined;
    readonly name: string;
    readonly source: {
        readonly name: string | null | undefined;
        readonly url: string | null | undefined;
    };
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTypeTagFragment">;
    readonly " $fragmentType": "BAIArtifactDescriptionsFragment";
};
export type BAIArtifactDescriptionsFragment$key = {
    readonly " $data"?: BAIArtifactDescriptionsFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactDescriptionsFragment">;
};
declare const node: ReaderFragment;
export default node;
