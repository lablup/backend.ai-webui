import { ConcreteRequest } from 'relay-runtime';
export type ProjectTypeV2 = "GENERAL" | "MODEL_STORE" | "%future added value";
export type ProjectV2Filter = {
    AND?: ReadonlyArray<ProjectV2Filter> | null | undefined;
    NOT?: ReadonlyArray<ProjectV2Filter> | null | undefined;
    OR?: ReadonlyArray<ProjectV2Filter> | null | undefined;
    createdAt?: DateTimeFilter | null | undefined;
    domain?: ProjectDomainNestedFilter | null | undefined;
    domainName?: StringFilter | null | undefined;
    id?: UUIDFilter | null | undefined;
    isActive?: boolean | null | undefined;
    modifiedAt?: DateTimeFilter | null | undefined;
    name?: StringFilter | null | undefined;
    type?: ProjectTypeV2EnumFilter | null | undefined;
    user?: ProjectUserNestedFilter | null | undefined;
};
export type UUIDFilter = {
    equals?: string | null | undefined;
    in?: ReadonlyArray<string> | null | undefined;
    notEquals?: string | null | undefined;
    notIn?: ReadonlyArray<string> | null | undefined;
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
export type ProjectTypeV2EnumFilter = {
    equals?: ProjectTypeV2 | null | undefined;
    in_?: ReadonlyArray<ProjectTypeV2> | null | undefined;
    notEquals?: ProjectTypeV2 | null | undefined;
    notIn?: ReadonlyArray<ProjectTypeV2> | null | undefined;
};
export type DateTimeFilter = {
    after?: string | null | undefined;
    before?: string | null | undefined;
    equals?: string | null | undefined;
    notEquals?: string | null | undefined;
};
export type ProjectDomainNestedFilter = {
    isActive?: boolean | null | undefined;
    name?: StringFilter | null | undefined;
};
export type ProjectUserNestedFilter = {
    email?: StringFilter | null | undefined;
    id?: UUIDFilter | null | undefined;
    isActive?: boolean | null | undefined;
    username?: StringFilter | null | undefined;
};
export type BAIAdminProjectSelectPaginatedQuery$variables = {
    filter?: ProjectV2Filter | null | undefined;
    limit: number;
    offset: number;
};
export type BAIAdminProjectSelectPaginatedQuery$data = {
    readonly adminProjectsV2: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly basicInfo: {
                    readonly name: string;
                };
                readonly id: string;
            };
        }>;
    } | null | undefined;
};
export type BAIAdminProjectSelectPaginatedQuery = {
    response: BAIAdminProjectSelectPaginatedQuery$data;
    variables: BAIAdminProjectSelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
