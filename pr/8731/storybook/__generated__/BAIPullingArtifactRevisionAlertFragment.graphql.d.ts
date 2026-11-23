import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type BAIPullingArtifactRevisionAlertFragment$data = {
    readonly id: string;
    readonly status: ArtifactStatus;
    readonly version: string;
    readonly " $fragmentType": "BAIPullingArtifactRevisionAlertFragment";
};
export type BAIPullingArtifactRevisionAlertFragment$key = {
    readonly " $data"?: BAIPullingArtifactRevisionAlertFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIPullingArtifactRevisionAlertFragment">;
};
declare const node: ReaderFragment;
export default node;
