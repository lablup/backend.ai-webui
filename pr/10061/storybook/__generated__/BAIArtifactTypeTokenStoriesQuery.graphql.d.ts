import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIArtifactTypeTokenStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactTypeTokenStoriesQuery$data = {
    readonly artifact: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTypeTokenFragment">;
    } | null | undefined;
};
export type BAIArtifactTypeTokenStoriesQuery = {
    response: BAIArtifactTypeTokenStoriesQuery$data;
    variables: BAIArtifactTypeTokenStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
