import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type BAIArtifactStatusBadgeFragment$data = {
    readonly status: ArtifactStatus;
    readonly " $fragmentType": "BAIArtifactStatusBadgeFragment";
};
export type BAIArtifactStatusBadgeFragment$key = {
    readonly " $data"?: BAIArtifactStatusBadgeFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactStatusBadgeFragment">;
};
declare const node: ReaderFragment;
export default node;
