import { ConcreteRequest } from 'relay-runtime';
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type UserStatusV2 = "ACTIVE" | "BEFORE_VERIFICATION" | "DELETED" | "INACTIVE" | "%future added value";
export type UserV2OrderField = "CREATED_AT" | "DOMAIN_NAME" | "EMAIL" | "MODIFIED_AT" | "PROJECT_NAME" | "STATUS" | "USERNAME" | "%future added value";
export type UserV2Filter = {
    AND?: ReadonlyArray<UserV2Filter> | null | undefined;
    NOT?: ReadonlyArray<UserV2Filter> | null | undefined;
    OR?: ReadonlyArray<UserV2Filter> | null | undefined;
    containerGids?: IntArrayFilter | null | undefined;
    containerMainGid?: IntFilter | null | undefined;
    containerUid?: IntFilter | null | undefined;
    createdAt?: DateTimeFilter | null | undefined;
    description?: StringFilter | null | undefined;
    domain?: UserDomainNestedFilter | null | undefined;
    domainName?: StringFilter | null | undefined;
    email?: StringFilter | null | undefined;
    fullName?: StringFilter | null | undefined;
    integrationName?: StringFilter | null | undefined;
    needPasswordChange?: boolean | null | undefined;
    project?: UserProjectNestedFilter | null | undefined;
    resourcePolicy?: StringFilter | null | undefined;
    role?: UserRoleV2EnumFilter | null | undefined;
    status?: UserStatusV2EnumFilter | null | undefined;
    statusInfo?: StringFilter | null | undefined;
    sudoSessionEnabled?: boolean | null | undefined;
    totpActivated?: boolean | null | undefined;
    username?: StringFilter | null | undefined;
    uuid?: UUIDFilter | null | undefined;
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
export type UserStatusV2EnumFilter = {
    equals?: UserStatusV2 | null | undefined;
    in?: ReadonlyArray<UserStatusV2> | null | undefined;
    notEquals?: UserStatusV2 | null | undefined;
    notIn?: ReadonlyArray<UserStatusV2> | null | undefined;
};
export type UserRoleV2EnumFilter = {
    equals?: UserRoleV2 | null | undefined;
    in?: ReadonlyArray<UserRoleV2> | null | undefined;
    notEquals?: UserRoleV2 | null | undefined;
    notIn?: ReadonlyArray<UserRoleV2> | null | undefined;
};
export type IntFilter = {
    equals?: number | null | undefined;
    greaterThan?: number | null | undefined;
    greaterThanOrEqual?: number | null | undefined;
    lessThan?: number | null | undefined;
    lessThanOrEqual?: number | null | undefined;
    notEquals?: number | null | undefined;
};
export type IntArrayFilter = {
    contains?: number | null | undefined;
    containsAll?: ReadonlyArray<number> | null | undefined;
    containsAny?: ReadonlyArray<number> | null | undefined;
};
export type DateTimeFilter = {
    after?: string | null | undefined;
    before?: string | null | undefined;
    equals?: string | null | undefined;
    notEquals?: string | null | undefined;
};
export type UserDomainNestedFilter = {
    isActive?: boolean | null | undefined;
    name?: StringFilter | null | undefined;
};
export type UserProjectNestedFilter = {
    isActive?: boolean | null | undefined;
    name?: StringFilter | null | undefined;
};
export type UserV2OrderBy = {
    direction?: OrderDirection;
    field?: UserV2OrderField;
};
export type BAIAdminUserV2SelectPaginatedQuery$variables = {
    filter?: UserV2Filter | null | undefined;
    limit: number;
    offset: number;
    orderBy?: ReadonlyArray<UserV2OrderBy> | null | undefined;
};
export type BAIAdminUserV2SelectPaginatedQuery$data = {
    readonly adminUsersV2: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly basicInfo: {
                    readonly email: string;
                    readonly fullName: string | null | undefined;
                    readonly username: string | null | undefined;
                };
                readonly id: string;
            };
        }>;
    } | null | undefined;
};
export type BAIAdminUserV2SelectPaginatedQuery = {
    response: BAIAdminUserV2SelectPaginatedQuery$data;
    variables: BAIAdminUserV2SelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
