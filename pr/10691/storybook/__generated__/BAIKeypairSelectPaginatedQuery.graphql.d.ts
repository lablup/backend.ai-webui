import { ConcreteRequest } from 'relay-runtime';
export type BAIKeypairSelectPaginatedQuery$variables = {
    filter?: string | null | undefined;
    limit: number;
    offset: number;
};
export type BAIKeypairSelectPaginatedQuery$data = {
    readonly keypair_list: {
        readonly items: ReadonlyArray<{
            readonly access_key: string | null | undefined;
            readonly is_active: boolean | null | undefined;
            readonly user_id: string | null | undefined;
        } | null | undefined>;
        readonly total_count: number;
    } | null | undefined;
};
export type BAIKeypairSelectPaginatedQuery = {
    response: BAIKeypairSelectPaginatedQuery$data;
    variables: BAIKeypairSelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
