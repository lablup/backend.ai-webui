import { ConcreteRequest } from 'relay-runtime';
export type BAIVFolderNodeSelectPaginatedQuery$variables = {
    filter?: string | null | undefined;
    limit: number;
    offset: number;
    permission?: any | null | undefined;
    scopeId?: any | null | undefined;
};
export type BAIVFolderNodeSelectPaginatedQuery$data = {
    readonly vfolder_nodes: {
        readonly count: number | null | undefined;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly name: string | null | undefined;
                readonly row_id: string | null | undefined;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
};
export type BAIVFolderNodeSelectPaginatedQuery = {
    response: BAIVFolderNodeSelectPaginatedQuery$data;
    variables: BAIVFolderNodeSelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
