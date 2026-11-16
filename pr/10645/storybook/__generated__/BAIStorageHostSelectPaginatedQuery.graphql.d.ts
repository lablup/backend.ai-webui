import { ConcreteRequest } from 'relay-runtime';
export type BAIStorageHostSelectPaginatedQuery$variables = {
    filter?: string | null | undefined;
    limit: number;
    offset: number;
    order?: string | null | undefined;
};
export type BAIStorageHostSelectPaginatedQuery$data = {
    readonly storage_volume_list: {
        readonly items: ReadonlyArray<{
            readonly backend: string | null | undefined;
            readonly id: string | null | undefined;
            readonly path: string | null | undefined;
            readonly proxy: string | null | undefined;
        } | null | undefined>;
        readonly total_count: number;
    } | null | undefined;
};
export type BAIStorageHostSelectPaginatedQuery = {
    response: BAIStorageHostSelectPaginatedQuery$data;
    variables: BAIStorageHostSelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
