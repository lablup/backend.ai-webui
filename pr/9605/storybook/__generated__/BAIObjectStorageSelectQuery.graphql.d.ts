import { ConcreteRequest } from 'relay-runtime';
export type BAIObjectStorageSelectQuery$variables = {
    limit: number;
    offset: number;
};
export type BAIObjectStorageSelectQuery$data = {
    readonly objectStorages: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly name: string;
            };
        }>;
    } | null | undefined;
};
export type BAIObjectStorageSelectQuery = {
    response: BAIObjectStorageSelectQuery$data;
    variables: BAIObjectStorageSelectQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
