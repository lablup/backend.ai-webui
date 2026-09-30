import { ConcreteRequest } from 'relay-runtime';
export type ArtifactStatus = "AVAILABLE" | "FAILED" | "NEEDS_APPROVAL" | "PULLED" | "PULLING" | "REJECTED" | "SCANNED" | "VERIFYING" | "%future added value";
export type ImportArtifactsInput = {
    artifactRevisionIds: ReadonlyArray<string>;
    options?: ImportArtifactsOptions | null | undefined;
    vfolderId?: string | null | undefined;
};
export type ImportArtifactsOptions = {
    force?: boolean;
};
export type BAIImportArtifactModalImportArtifactsMutation$variables = {
    connectionIds: ReadonlyArray<string>;
    input: ImportArtifactsInput;
};
export type BAIImportArtifactModalImportArtifactsMutation$data = {
    readonly importArtifacts: {
        readonly artifactRevisions: {
            readonly edges: ReadonlyArray<{
                readonly node: {
                    readonly id: string;
                    readonly status: ArtifactStatus;
                };
            }>;
        };
        readonly tasks: ReadonlyArray<{
            readonly artifactRevision: {
                readonly version: string;
            };
            readonly taskId: string | null | undefined;
        }>;
    } | null | undefined;
};
export type BAIImportArtifactModalImportArtifactsMutation = {
    response: BAIImportArtifactModalImportArtifactsMutation$data;
    variables: BAIImportArtifactModalImportArtifactsMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
