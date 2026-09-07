import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAISessionAgentIdsStoriesQuery$variables = Record<PropertyKey, never>;
export type BAISessionAgentIdsStoriesQuery$data = {
    readonly compute_session_node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAISessionAgentIdsFragment">;
    } | null | undefined;
};
export type BAISessionAgentIdsStoriesQuery = {
    response: BAISessionAgentIdsStoriesQuery$data;
    variables: BAISessionAgentIdsStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
