import { ConcreteRequest } from 'relay-runtime';
export type BAIUserSelectPaginatedQuery$variables = {
    filter?: string | null | undefined;
    limit: number;
    offset: number;
    order?: string | null | undefined;
};
export type BAIUserSelectPaginatedQuery$data = {
    readonly user_nodes: {
        readonly count: number | null | undefined;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly email: string | null | undefined;
                readonly full_name: string | null | undefined;
                readonly id: string;
                readonly role: string | null | undefined;
                readonly status: string | null | undefined;
                readonly username: string | null | undefined;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
};
export type BAIUserSelectPaginatedQuery = {
    response: BAIUserSelectPaginatedQuery$data;
    variables: BAIUserSelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
