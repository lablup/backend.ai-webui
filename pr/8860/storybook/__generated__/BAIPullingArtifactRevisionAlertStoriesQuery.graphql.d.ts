import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIPullingArtifactRevisionAlertStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIPullingArtifactRevisionAlertStoriesQuery$data = {
    readonly artifactRevision: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIPullingArtifactRevisionAlertFragment">;
    } | null | undefined;
};
export type BAIPullingArtifactRevisionAlertStoriesQuery = {
    response: BAIPullingArtifactRevisionAlertStoriesQuery$data;
    variables: BAIPullingArtifactRevisionAlertStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
