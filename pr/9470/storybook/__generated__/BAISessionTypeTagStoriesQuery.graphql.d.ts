import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAISessionTypeTagStoriesQuery$variables = Record<PropertyKey, never>;
export type BAISessionTypeTagStoriesQuery$data = {
    readonly compute_session_node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAISessionTypeTagFragment">;
    } | null | undefined;
};
export type BAISessionTypeTagStoriesQuery = {
    response: BAISessionTypeTagStoriesQuery$data;
    variables: BAISessionTypeTagStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
