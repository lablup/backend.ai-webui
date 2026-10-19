import { ConcreteRequest } from 'relay-runtime';
export type BAIVFolderSelectPaginatedQuery$variables = {
    filter?: string | null | undefined;
    limit: number;
    offset: number;
    permission?: any | null | undefined;
    scopeId?: any | null | undefined;
};
export type BAIVFolderSelectPaginatedQuery$data = {
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
export type BAIVFolderSelectPaginatedQuery = {
    response: BAIVFolderSelectPaginatedQuery$data;
    variables: BAIVFolderSelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
