import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIDeactivateArtifactsModalStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIDeactivateArtifactsModalStoriesQuery$data = {
    readonly artifacts: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly " $fragmentSpreads": FragmentRefs<"BAIDeactivateArtifactsModalArtifactsFragment">;
            };
        }>;
    } | null | undefined;
};
export type BAIDeactivateArtifactsModalStoriesQuery = {
    response: BAIDeactivateArtifactsModalStoriesQuery$data;
    variables: BAIDeactivateArtifactsModalStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
