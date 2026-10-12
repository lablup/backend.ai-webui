import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type BAIArtifactStatusTagFragment$data = {
    readonly status: ArtifactStatus;
    readonly " $fragmentType": "BAIArtifactStatusTagFragment";
};
export type BAIArtifactStatusTagFragment$key = {
    readonly " $data"?: BAIArtifactStatusTagFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactStatusTagFragment">;
};
declare const node: ReaderFragment;
export default node;
