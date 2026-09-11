import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type ArtifactType = "IMAGE" | "MODEL" | "PACKAGE" | "%future added value";
export type BAIArtifactTypeTagFragment$data = {
    readonly type: ArtifactType;
    readonly " $fragmentType": "BAIArtifactTypeTagFragment";
};
export type BAIArtifactTypeTagFragment$key = {
    readonly " $data"?: BAIArtifactTypeTagFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTypeTagFragment">;
};
declare const node: ReaderFragment;
export default node;
