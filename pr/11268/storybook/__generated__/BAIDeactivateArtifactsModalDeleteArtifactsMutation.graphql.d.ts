import { ConcreteRequest } from 'relay-runtime';
export type ArtifactAvailability = "ALIVE" | "DELETED" | "%future added value";
export type PartialBulkDeleteArtifactsInput = {
    ids: ReadonlyArray<string>;
};
export type BAIDeactivateArtifactsModalDeleteArtifactsMutation$variables = {
    input: PartialBulkDeleteArtifactsInput;
};
export type BAIDeactivateArtifactsModalDeleteArtifactsMutation$data = {
    readonly partialBulkDeleteArtifacts: {
        readonly failed: ReadonlyArray<{
            readonly id: string;
            readonly message: string;
        }>;
        readonly successes: ReadonlyArray<{
            readonly availability: ArtifactAvailability;
            readonly id: string;
        }>;
    };
};
export type BAIDeactivateArtifactsModalDeleteArtifactsMutation = {
    response: BAIDeactivateArtifactsModalDeleteArtifactsMutation$data;
    variables: BAIDeactivateArtifactsModalDeleteArtifactsMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
