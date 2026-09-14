import { ConcreteRequest } from 'relay-runtime';
export type BAIStorageProxySelectQuery$variables = {
    limit: number;
};
export type BAIStorageProxySelectQuery$data = {
    readonly storage_volume_list: {
        readonly items: ReadonlyArray<{
            readonly proxy: string | null | undefined;
        } | null | undefined>;
    } | null | undefined;
};
export type BAIStorageProxySelectQuery = {
    response: BAIStorageProxySelectQuery$data;
    variables: BAIStorageProxySelectQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
