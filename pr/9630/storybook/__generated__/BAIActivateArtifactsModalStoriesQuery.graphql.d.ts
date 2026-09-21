import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIActivateArtifactsModalStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIActivateArtifactsModalStoriesQuery$data = {
    readonly artifacts: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly " $fragmentSpreads": FragmentRefs<"BAIActivateArtifactsModalArtifactsFragment">;
            };
        }>;
    } | null | undefined;
};
export type BAIActivateArtifactsModalStoriesQuery = {
    response: BAIActivateArtifactsModalStoriesQuery$data;
    variables: BAIActivateArtifactsModalStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
