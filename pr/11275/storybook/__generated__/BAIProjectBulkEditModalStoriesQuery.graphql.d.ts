import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIProjectBulkEditModalStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIProjectBulkEditModalStoriesQuery$data = {
    readonly group_nodes: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly " $fragmentSpreads": FragmentRefs<"BAIProjectBulkEditModalFragment">;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
};
export type BAIProjectBulkEditModalStoriesQuery = {
    response: BAIProjectBulkEditModalStoriesQuery$data;
    variables: BAIProjectBulkEditModalStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
