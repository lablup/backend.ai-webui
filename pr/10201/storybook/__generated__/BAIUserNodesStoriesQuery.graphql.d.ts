import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIUserNodesStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIUserNodesStoriesQuery$data = {
    readonly user_nodes: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly " $fragmentSpreads": FragmentRefs<"BAIUserNodesFragment">;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
};
export type BAIUserNodesStoriesQuery = {
    response: BAIUserNodesStoriesQuery$data;
    variables: BAIUserNodesStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
