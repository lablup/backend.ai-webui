import { ConcreteRequest } from 'relay-runtime';
export type BAIVFolderSelectValueQuery$variables = {
    first: number;
    scopeId?: any | null | undefined;
    selectedFilter?: string | null | undefined;
    skipSelectedVFolder: boolean;
};
export type BAIVFolderSelectValueQuery$data = {
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
export type BAIVFolderSelectValueQuery = {
    response: BAIVFolderSelectValueQuery$data;
    variables: BAIVFolderSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
