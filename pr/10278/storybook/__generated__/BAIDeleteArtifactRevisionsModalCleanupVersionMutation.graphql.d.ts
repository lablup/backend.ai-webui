import { ConcreteRequest } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type CleanupArtifactRevisionsInput = {
    artifactRevisionIds: ReadonlyArray<string>;
};
export type BAIDeleteArtifactRevisionsModalCleanupVersionMutation$variables = {
    input: CleanupArtifactRevisionsInput;
};
export type BAIDeleteArtifactRevisionsModalCleanupVersionMutation$data = {
    readonly cleanupArtifactRevisions: {
        readonly artifactRevisions: {
            readonly edges: ReadonlyArray<{
                readonly node: {
                    readonly status: ArtifactStatus;
                };
            }>;
        };
    } | null | undefined;
};
export type BAIDeleteArtifactRevisionsModalCleanupVersionMutation = {
    response: BAIDeleteArtifactRevisionsModalCleanupVersionMutation$data;
    variables: BAIDeleteArtifactRevisionsModalCleanupVersionMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
