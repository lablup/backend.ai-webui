import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type BAIImportArtifactModalArtifactRevisionFragment$data = ReadonlyArray<{
    readonly id: string;
    readonly size: any | null | undefined;
    readonly status: ArtifactStatus;
    readonly version: string;
    readonly " $fragmentType": "BAIImportArtifactModalArtifactRevisionFragment";
}>;
export type BAIImportArtifactModalArtifactRevisionFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIImportArtifactModalArtifactRevisionFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIImportArtifactModalArtifactRevisionFragment">;
}>;
declare const node: ReaderFragment;
export default node;
