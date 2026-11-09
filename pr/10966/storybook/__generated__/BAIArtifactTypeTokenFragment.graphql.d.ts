import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type ArtifactType = "IMAGE" | "MODEL" | "PACKAGE" | "%future added value";
export type BAIArtifactTypeTokenFragment$data = {
    readonly type: ArtifactType;
    readonly " $fragmentType": "BAIArtifactTypeTokenFragment";
};
export type BAIArtifactTypeTokenFragment$key = {
    readonly " $data"?: BAIArtifactTypeTokenFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTypeTokenFragment">;
};
declare const node: ReaderFragment;
export default node;
