import { ConcreteRequest } from 'relay-runtime';
export type UserResourcePolicyV2Filter = {
    AND?: ReadonlyArray<UserResourcePolicyV2Filter> | null | undefined;
    NOT?: ReadonlyArray<UserResourcePolicyV2Filter> | null | undefined;
    OR?: ReadonlyArray<UserResourcePolicyV2Filter> | null | undefined;
    createdAt?: DateTimeFilter | null | undefined;
    maxConcurrentLogins?: IntFilter | null | undefined;
    maxCustomizedImageCount?: IntFilter | null | undefined;
    maxQuotaScopeSize?: IntFilter | null | undefined;
    maxSessionCountPerModelSession?: IntFilter | null | undefined;
    maxVfolderCount?: IntFilter | null | undefined;
    name?: StringFilter | null | undefined;
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
export type DateTimeFilter = {
    after?: string | null | undefined;
    before?: string | null | undefined;
    equals?: string | null | undefined;
    notEquals?: string | null | undefined;
};
export type IntFilter = {
    equals?: number | null | undefined;
    greaterThan?: number | null | undefined;
    greaterThanOrEqual?: number | null | undefined;
    lessThan?: number | null | undefined;
    lessThanOrEqual?: number | null | undefined;
    notEquals?: number | null | undefined;
};
export type BAIAdminUserResourcePolicySelectPaginatedQuery$variables = {
    filter?: UserResourcePolicyV2Filter | null | undefined;
    limit: number;
    offset: number;
};
export type BAIAdminUserResourcePolicySelectPaginatedQuery$data = {
    readonly adminUserResourcePoliciesV2: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly name: string;
            };
        }>;
    } | null | undefined;
};
export type BAIAdminUserResourcePolicySelectPaginatedQuery = {
    response: BAIAdminUserResourcePolicySelectPaginatedQuery$data;
    variables: BAIAdminUserResourcePolicySelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
