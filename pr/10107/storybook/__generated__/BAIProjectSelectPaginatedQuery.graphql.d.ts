import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectSelectPaginatedQuery$variables = {
    filter?: string | null | undefined;
    limit: number;
    offset: number;
};
export type BAIProjectSelectPaginatedQuery$data = {
    readonly group_nodes: {
        readonly count: number | null | undefined;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly name: string | null | undefined;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
};
export type BAIProjectSelectPaginatedQuery = {
    response: BAIProjectSelectPaginatedQuery$data;
    variables: BAIProjectSelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
