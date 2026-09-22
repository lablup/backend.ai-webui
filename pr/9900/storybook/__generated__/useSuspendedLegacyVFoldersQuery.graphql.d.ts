import { ConcreteRequest } from 'relay-runtime';
export type useSuspendedLegacyVFoldersQuery$variables = {
    filter?: string | null | undefined;
    first?: number | null | undefined;
    scopeId?: any | null | undefined;
};
export type useSuspendedLegacyVFoldersQuery$data = {
    readonly vfolder_nodes: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly cloneable: boolean | null | undefined;
                readonly created_at: string | null | undefined;
                readonly creator: string | null | undefined;
                readonly cur_size: any | null | undefined;
                readonly group: string | null | undefined;
                readonly group_name: string | null | undefined;
                readonly host: string | null | undefined;
                readonly max_files: number | null | undefined;
                readonly max_size: any | null | undefined;
                readonly name: string | null | undefined;
                readonly ownership_type: string | null | undefined;
                readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
                readonly quota_scope_id: string | null | undefined;
                readonly row_id: string | null | undefined;
                readonly status: string | null | undefined;
                readonly usage_mode: string | null | undefined;
                readonly user: string | null | undefined;
                readonly user_email: string | null | undefined;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
};
export type useSuspendedLegacyVFoldersQuery = {
    response: useSuspendedLegacyVFoldersQuery$data;
    variables: useSuspendedLegacyVFoldersQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
