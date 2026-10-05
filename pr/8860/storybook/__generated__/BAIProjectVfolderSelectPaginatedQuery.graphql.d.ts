import { ConcreteRequest } from 'relay-runtime';
export type VFolderOperationStatus = "CLONING" | "DELETE_COMPLETE" | "DELETE_ERROR" | "DELETE_ONGOING" | "DELETE_PENDING" | "READY" | "%future added value";
export type VFolderUsageMode = "DATA" | "GENERAL" | "MODEL" | "%future added value";
export type VFolderFilter = {
    AND?: ReadonlyArray<VFolderFilter> | null | undefined;
    NOT?: ReadonlyArray<VFolderFilter> | null | undefined;
    OR?: ReadonlyArray<VFolderFilter> | null | undefined;
    cloneable?: boolean | null | undefined;
    createdAt?: DateTimeFilter | null | undefined;
    host?: StringFilter | null | undefined;
    name?: StringFilter | null | undefined;
    status?: VFolderOperationStatusFilter | null | undefined;
    usageMode?: VFolderUsageModeFilter | null | undefined;
};
export type StringFilter = {
    contains?: string | null | undefined;
    endsWith?: string | null | undefined;
    equals?: string | null | undefined;
    iContains?: string | null | undefined;
    iEndsWith?: string | null | undefined;
    iEquals?: string | null | undefined;
    iIn?: ReadonlyArray<string> | null | undefined;
    iNotContains?: string | null | undefined;
    iNotEndsWith?: string | null | undefined;
    iNotEquals?: string | null | undefined;
    iNotIn?: ReadonlyArray<string> | null | undefined;
    iNotStartsWith?: string | null | undefined;
    iStartsWith?: string | null | undefined;
    in?: ReadonlyArray<string> | null | undefined;
    notContains?: string | null | undefined;
    notEndsWith?: string | null | undefined;
    notEquals?: string | null | undefined;
    notIn?: ReadonlyArray<string> | null | undefined;
    notStartsWith?: string | null | undefined;
    startsWith?: string | null | undefined;
};
export type VFolderOperationStatusFilter = {
    equals?: VFolderOperationStatus | null | undefined;
    in?: ReadonlyArray<VFolderOperationStatus> | null | undefined;
    notEquals?: VFolderOperationStatus | null | undefined;
    notIn?: ReadonlyArray<VFolderOperationStatus> | null | undefined;
};
export type VFolderUsageModeFilter = {
    equals?: VFolderUsageMode | null | undefined;
    in?: ReadonlyArray<VFolderUsageMode> | null | undefined;
    notEquals?: VFolderUsageMode | null | undefined;
    notIn?: ReadonlyArray<VFolderUsageMode> | null | undefined;
};
export type DateTimeFilter = {
    after?: string | null | undefined;
    before?: string | null | undefined;
    equals?: string | null | undefined;
    notEquals?: string | null | undefined;
};
export type BAIProjectVfolderSelectPaginatedQuery$variables = {
    filter?: VFolderFilter | null | undefined;
    limit: number;
    offset: number;
    projectId: string;
};
export type BAIProjectVfolderSelectPaginatedQuery$data = {
    readonly projectVfolders: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly metadata: {
                    readonly name: string;
                };
            };
        }>;
    } | null | undefined;
};
export type BAIProjectVfolderSelectPaginatedQuery = {
    response: BAIProjectVfolderSelectPaginatedQuery$data;
    variables: BAIProjectVfolderSelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
