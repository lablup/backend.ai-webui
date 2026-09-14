import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$data = ReadonlyArray<{
    readonly id: string;
    readonly size: any | null | undefined;
    readonly status: ArtifactStatus;
    readonly version: string;
    readonly " $fragmentType": "BAIDeleteArtifactRevisionsModalArtifactRevisionFragment";
}>;
export type BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIDeleteArtifactRevisionsModalArtifactRevisionFragment">;
}>;
declare const node: ReaderFragment;
export default node;
