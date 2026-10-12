import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIArtifactTypeTagStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactTypeTagStoriesQuery$data = {
    readonly artifact: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTypeTagFragment">;
    } | null | undefined;
};
export type BAIArtifactTypeTagStoriesQuery = {
    response: BAIArtifactTypeTagStoriesQuery$data;
    variables: BAIArtifactTypeTagStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
