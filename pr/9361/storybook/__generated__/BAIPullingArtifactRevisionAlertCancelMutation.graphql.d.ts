import { ConcreteRequest } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type CancelArtifactInput = {
    artifactRevisionId: string;
};
export type BAIPullingArtifactRevisionAlertCancelMutation$variables = {
    input: CancelArtifactInput;
};
export type BAIPullingArtifactRevisionAlertCancelMutation$data = {
    readonly cancelImportArtifact: {
        readonly artifactRevision: {
            readonly id: string;
            readonly status: ArtifactStatus;
        };
    } | null | undefined;
};
export type BAIPullingArtifactRevisionAlertCancelMutation = {
    response: BAIPullingArtifactRevisionAlertCancelMutation$data;
    variables: BAIPullingArtifactRevisionAlertCancelMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
