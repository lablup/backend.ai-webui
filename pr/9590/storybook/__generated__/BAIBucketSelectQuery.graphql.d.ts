import { ConcreteRequest } from 'relay-runtime';
export type BAIBucketSelectQuery$variables = {
    after?: string | null | undefined;
    before?: string | null | undefined;
    first?: number | null | undefined;
    last?: number | null | undefined;
    limit: number;
    objectStorageId: string;
    offset: number;
};
export type BAIBucketSelectQuery$data = {
    readonly objectStorage: {
        readonly namespaces: {
            readonly count: number;
            readonly edges: ReadonlyArray<{
                readonly node: {
                    readonly id: string;
                    readonly namespace: string;
                };
            }>;
        } | null | undefined;
    } | null | undefined;
};
export type BAIBucketSelectQuery = {
    response: BAIBucketSelectQuery$data;
    variables: BAIBucketSelectQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
