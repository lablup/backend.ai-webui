import { ConcreteRequest } from 'relay-runtime';
export type BAIVFolderNodeSelectValueQuery$variables = {
    first: number;
    scopeId?: any | null | undefined;
    selectedFilter?: string | null | undefined;
    skipSelectedVFolder: boolean;
};
export type BAIVFolderNodeSelectValueQuery$data = {
    readonly vfolder_nodes?: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly name: string | null | undefined;
                readonly row_id: string | null | undefined;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
};
export type BAIVFolderNodeSelectValueQuery = {
    response: BAIVFolderNodeSelectValueQuery$data;
    variables: BAIVFolderNodeSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
