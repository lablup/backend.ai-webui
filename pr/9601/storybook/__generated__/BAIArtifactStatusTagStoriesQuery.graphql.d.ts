import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIArtifactStatusTagStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactStatusTagStoriesQuery$data = {
    readonly artifactRevision: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactStatusTagFragment">;
    } | null | undefined;
};
export type BAIArtifactStatusTagStoriesQuery = {
    response: BAIArtifactStatusTagStoriesQuery$data;
    variables: BAIArtifactStatusTagStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
