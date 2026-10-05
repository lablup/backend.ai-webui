import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAISessionTypeTokenStoriesQuery$variables = Record<PropertyKey, never>;
export type BAISessionTypeTokenStoriesQuery$data = {
    readonly compute_session_node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAISessionTypeTokenFragment">;
    } | null | undefined;
};
export type BAISessionTypeTokenStoriesQuery = {
    response: BAISessionTypeTokenStoriesQuery$data;
    variables: BAISessionTypeTokenStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
