import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type BAIArtifactRevisionDownloadButtonFragment$data = ReadonlyArray<{
    readonly status: ArtifactStatus;
    readonly " $fragmentType": "BAIArtifactRevisionDownloadButtonFragment";
}>;
export type BAIArtifactRevisionDownloadButtonFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIArtifactRevisionDownloadButtonFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionDownloadButtonFragment">;
}>;
declare const node: ReaderFragment;
export default node;
