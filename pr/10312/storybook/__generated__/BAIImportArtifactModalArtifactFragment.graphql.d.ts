import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIImportArtifactModalArtifactFragment$data = {
    readonly id: string;
    readonly name: string;
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactDescriptionsFragment">;
    readonly " $fragmentType": "BAIImportArtifactModalArtifactFragment";
};
export type BAIImportArtifactModalArtifactFragment$key = {
    readonly " $data"?: BAIImportArtifactModalArtifactFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIImportArtifactModalArtifactFragment">;
};
declare const node: ReaderFragment;
export default node;
