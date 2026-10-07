import { ConcreteRequest } from 'relay-runtime';
export type VFolderMountPermission = "NONE" | "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type VFolderOperationStatus = "CLONING" | "DELETE_COMPLETE" | "DELETE_ERROR" | "DELETE_ONGOING" | "DELETE_PENDING" | "READY" | "%future added value";
export type VFolderOwnershipType = "GROUP" | "USER" | "%future added value";
export type VFolderUsageMode = "DATA" | "GENERAL" | "MODEL" | "%future added value";
export type useSuspendedMyVFoldersQuery$variables = {
    limit: number;
    offset: number;
};
export type useSuspendedMyVFoldersQuery$data = {
    readonly myVfolders: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly accessControl: {
                    readonly ownershipType: VFolderOwnershipType;
                    readonly permission: VFolderMountPermission;
                };
                readonly host: string;
                readonly id: string;
                readonly metadata: {
                    readonly cloneable: boolean;
                    readonly createdAt: string;
                    readonly name: string;
                    readonly quotaScopeId: string | null | undefined;
                    readonly usageMode: VFolderUsageMode;
                };
                readonly ownership: {
                    readonly creatorEmail: string | null | undefined;
                    readonly projectId: string | null | undefined;
                    readonly userId: string | null | undefined;
                };
                readonly status: VFolderOperationStatus;
            };
        }>;
    } | null | undefined;
};
export type useSuspendedMyVFoldersQuery = {
    response: useSuspendedMyVFoldersQuery$data;
    variables: useSuspendedMyVFoldersQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
