import { ConcreteRequest } from 'relay-runtime';
export type ArtifactAvailability = "ALIVE" | "DELETED" | "%future added value";
export type RestoreArtifactsInput = {
    artifactIds: ReadonlyArray<string>;
};
export type BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation$variables = {
    input: RestoreArtifactsInput;
};
export type BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation$data = {
    readonly restoreArtifacts: {
        readonly artifacts: ReadonlyArray<{
            readonly availability: ArtifactAvailability;
            readonly id: string;
        }>;
    } | null | undefined;
};
export type BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation = {
    response: BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation$data;
    variables: BAIActivateArtifactsModalArtifactsFragmentRestoreArtifactsMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
