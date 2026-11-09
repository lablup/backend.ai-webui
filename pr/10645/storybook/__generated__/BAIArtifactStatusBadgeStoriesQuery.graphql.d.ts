import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIArtifactStatusBadgeStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactStatusBadgeStoriesQuery$data = {
    readonly artifactRevision: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactStatusBadgeFragment">;
    } | null | undefined;
};
export type BAIArtifactStatusBadgeStoriesQuery = {
    response: BAIArtifactStatusBadgeStoriesQuery$data;
    variables: BAIArtifactStatusBadgeStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
