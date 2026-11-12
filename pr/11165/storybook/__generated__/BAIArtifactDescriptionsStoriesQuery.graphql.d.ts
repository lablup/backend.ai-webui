import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIArtifactDescriptionsStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactDescriptionsStoriesQuery$data = {
    readonly artifact: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactDescriptionsFragment">;
    } | null | undefined;
};
export type BAIArtifactDescriptionsStoriesQuery = {
    response: BAIArtifactDescriptionsStoriesQuery$data;
    variables: BAIArtifactDescriptionsStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
