import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type ArtifactAvailability = "ALIVE" | "DELETED" | "%future added value";
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type BAIArtifactTableArtifactFragment$data = ReadonlyArray<{
    readonly availability: ArtifactAvailability;
    readonly description: string | null | undefined;
    readonly id: string;
    readonly latestVersion: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly size: any | null | undefined;
                readonly status: ArtifactStatus;
                readonly version: string;
                readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionDownloadButtonFragment" | "BAIArtifactStatusTagFragment">;
            };
        }>;
    } | null | undefined;
    readonly name: string;
    readonly registry: {
        readonly name: string | null | undefined;
        readonly url: string | null | undefined;
    };
    readonly scannedAt: string;
    readonly source: {
        readonly name: string | null | undefined;
        readonly url: string | null | undefined;
    };
    readonly updatedAt: string;
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTypeTagFragment">;
    readonly " $fragmentType": "BAIArtifactTableArtifactFragment";
}>;
export type BAIArtifactTableArtifactFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIArtifactTableArtifactFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTableArtifactFragment">;
}>;
declare const node: ReaderFragment;
export default node;
