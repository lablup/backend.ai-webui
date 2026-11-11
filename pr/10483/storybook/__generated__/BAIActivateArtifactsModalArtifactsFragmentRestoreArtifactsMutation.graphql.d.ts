import { ConcreteRequest } from 'relay-runtime';
export type ArtifactAvailability = "ALIVE" | "DELETED" | "%future added value";
export type PartialBulkRestoreArtifactsInput = {
    ids: ReadonlyArray<string>;
};
export type BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation$variables = {
    input: PartialBulkRestoreArtifactsInput;
};
export type BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation$data = {
    readonly partialBulkRestoreArtifacts: {
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
export type BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation = {
    response: BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation$data;
    variables: BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
