import { ConcreteRequest } from 'relay-runtime';
export type BAIStorageHostSelectValueQuery$variables = {
    filter?: string | null | undefined;
    limit: number;
    offset: number;
    skipSelected: boolean;
};
export type BAIStorageHostSelectValueQuery$data = {
    readonly storage_volume_list?: {
        readonly items: ReadonlyArray<{
            readonly backend: string | null | undefined;
            readonly id: string | null | undefined;
            readonly path: string | null | undefined;
            readonly proxy: string | null | undefined;
        } | null | undefined>;
        readonly total_count: number;
    } | null | undefined;
};
export type BAIStorageHostSelectValueQuery = {
    response: BAIStorageHostSelectValueQuery$data;
    variables: BAIStorageHostSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
