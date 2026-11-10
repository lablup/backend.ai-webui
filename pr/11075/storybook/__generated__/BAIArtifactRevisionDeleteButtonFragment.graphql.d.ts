import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type BAIArtifactRevisionDeleteButtonFragment$data = ReadonlyArray<{
    readonly status: ArtifactStatus;
    readonly " $fragmentType": "BAIArtifactRevisionDeleteButtonFragment";
}>;
export type BAIArtifactRevisionDeleteButtonFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIArtifactRevisionDeleteButtonFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionDeleteButtonFragment">;
}>;
declare const node: ReaderFragment;
export default node;
