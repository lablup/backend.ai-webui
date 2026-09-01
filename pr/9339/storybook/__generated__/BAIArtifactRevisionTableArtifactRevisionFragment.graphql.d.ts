import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type BAIArtifactRevisionTableArtifactRevisionFragment$data = ReadonlyArray<{
    readonly id: string;
    readonly size: any | null | undefined;
    readonly status: ArtifactStatus;
    readonly updatedAt: string | null | undefined;
    readonly version: string;
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionDeleteButtonFragment" | "BAIArtifactRevisionDownloadButtonFragment" | "BAIArtifactStatusTagFragment">;
    readonly " $fragmentType": "BAIArtifactRevisionTableArtifactRevisionFragment";
}>;
export type BAIArtifactRevisionTableArtifactRevisionFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIArtifactRevisionTableArtifactRevisionFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionTableArtifactRevisionFragment">;
}>;
declare const node: ReaderFragment;
export default node;
