import { ConcreteRequest } from 'relay-runtime';
export type ArtifactAvailability = "ALIVE" | "DELETED" | "%future added value";
export type DeleteArtifactsInput = {
    artifactIds: ReadonlyArray<string>;
};
export type BAIDeactivateArtifactsModalDeleteArtifactsMutation$variables = {
    input: DeleteArtifactsInput;
};
export type BAIDeactivateArtifactsModalDeleteArtifactsMutation$data = {
    readonly deleteArtifacts: {
        readonly artifacts: ReadonlyArray<{
            readonly availability: ArtifactAvailability;
            readonly id: string;
        }>;
    } | null | undefined;
};
export type BAIDeactivateArtifactsModalDeleteArtifactsMutation = {
    response: BAIDeactivateArtifactsModalDeleteArtifactsMutation$data;
    variables: BAIDeactivateArtifactsModalDeleteArtifactsMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
