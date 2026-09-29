import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type ImageV2Status = "ALIVE" | "DELETED" | "%future added value";
export type ImageV2Type = "COMPUTE" | "SERVICE" | "SYSTEM" | "%future added value";
export type ImageV2Filter = {
    AND?: ReadonlyArray<ImageV2Filter> | null | undefined;
    NOT?: ReadonlyArray<ImageV2Filter> | null | undefined;
    OR?: ReadonlyArray<ImageV2Filter> | null | undefined;
    accelerators?: StringFilter | null | undefined;
    alias?: ImageAliasNestedFilter | null | undefined;
    architecture?: StringFilter | null | undefined;
    configDigest?: StringFilter | null | undefined;
    createdAt?: DateTimeFilter | null | undefined;
    id?: UUIDFilter | null | undefined;
    image?: StringFilter | null | undefined;
    isLocal?: boolean | null | undefined;
    lastUsed?: DateTimeFilter | null | undefined;
    name?: StringFilter | null | undefined;
    project?: StringFilter | null | undefined;
    registry?: StringFilter | null | undefined;
    registryId?: UUIDFilter | null | undefined;
    sizeBytes?: IntFilter | null | undefined;
    status?: ImageV2StatusFilter | null | undefined;
    tag?: StringFilter | null | undefined;
    type?: ImageV2TypeFilter | null | undefined;
};
export type ImageV2StatusFilter = {
    equals?: ImageV2Status | null | undefined;
    in?: ReadonlyArray<ImageV2Status> | null | undefined;
    notEquals?: ImageV2Status | null | undefined;
    notIn?: ReadonlyArray<ImageV2Status> | null | undefined;
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
export type UUIDFilter = {
    equals?: string | null | undefined;
    in?: ReadonlyArray<string> | null | undefined;
    notEquals?: string | null | undefined;
    notIn?: ReadonlyArray<string> | null | undefined;
};
export type IntFilter = {
    equals?: number | null | undefined;
    greaterThan?: number | null | undefined;
    greaterThanOrEqual?: number | null | undefined;
    lessThan?: number | null | undefined;
    lessThanOrEqual?: number | null | undefined;
    notEquals?: number | null | undefined;
};
export type ImageV2TypeFilter = {
    equals?: ImageV2Type | null | undefined;
    in?: ReadonlyArray<ImageV2Type> | null | undefined;
    notEquals?: ImageV2Type | null | undefined;
    notIn?: ReadonlyArray<ImageV2Type> | null | undefined;
};
export type DateTimeFilter = {
    after?: string | null | undefined;
    before?: string | null | undefined;
    equals?: string | null | undefined;
    notEquals?: string | null | undefined;
};
export type ImageAliasNestedFilter = {
    alias?: StringFilter | null | undefined;
};
export type BAIAdminImageSelectPaginatedQuery$variables = {
    filter?: ImageV2Filter | null | undefined;
    limit: number;
    offset: number;
};
export type BAIAdminImageSelectPaginatedQuery$data = {
    readonly adminImagesV2: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly identity: {
                    readonly architecture: string;
                    readonly canonicalName: string;
                };
                readonly " $fragmentSpreads": FragmentRefs<"BAIImageNodeSimpleTagV2Fragment">;
            };
        }>;
    } | null | undefined;
};
export type BAIAdminImageSelectPaginatedQuery = {
    response: BAIAdminImageSelectPaginatedQuery$data;
    variables: BAIAdminImageSelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
