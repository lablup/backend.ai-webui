import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAISessionClusterModeStoriesQuery$variables = Record<PropertyKey, never>;
export type BAISessionClusterModeStoriesQuery$data = {
    readonly compute_session_node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAISessionClusterModeFragment">;
    } | null | undefined;
};
export type BAISessionClusterModeStoriesQuery = {
    response: BAISessionClusterModeStoriesQuery$data;
    variables: BAISessionClusterModeStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
