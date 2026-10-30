import { ConcreteRequest } from 'relay-runtime';
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type ResourceGroupOrderField = "CREATED_AT" | "IS_ACTIVE" | "NAME" | "%future added value";
export type ResourceGroupScope = {
    domain?: ReadonlyArray<UUIDScope> | null | undefined;
    project?: ReadonlyArray<UUIDScope> | null | undefined;
    user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
    value: string;
};
export type ResourceGroupFilter = {
    AND?: ReadonlyArray<ResourceGroupFilter> | null | undefined;
    NOT?: ReadonlyArray<ResourceGroupFilter> | null | undefined;
    OR?: ReadonlyArray<ResourceGroupFilter> | null | undefined;
    description?: StringFilter | null | undefined;
    entityId?: UUIDFilter | null | undefined;
    isActive?: boolean | null | undefined;
    isDefault?: boolean | null | undefined;
    isPublic?: boolean | null | undefined;
    labels?: EntityLabelNestedFilter | null | undefined;
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
export type EntityLabelNestedFilter = {
    every?: EntityLabelFilter | null | undefined;
    exists?: boolean | null | undefined;
    none?: EntityLabelFilter | null | undefined;
    some?: EntityLabelFilter | null | undefined;
};
export type EntityLabelFilter = {
    AND?: ReadonlyArray<EntityLabelFilter> | null | undefined;
    NOT?: ReadonlyArray<EntityLabelFilter> | null | undefined;
    OR?: ReadonlyArray<EntityLabelFilter> | null | undefined;
    entityId?: UUIDFilter | null | undefined;
    entityType?: StringFilter | null | undefined;
    fieldId?: UUIDFilter | null | undefined;
    key?: StringFilter | null | undefined;
    value?: StringFilter | null | undefined;
};
export type UUIDFilter = {
    equals?: string | null | undefined;
    in?: ReadonlyArray<string> | null | undefined;
    notEquals?: string | null | undefined;
    notIn?: ReadonlyArray<string> | null | undefined;
};
export type ResourceGroupOrderBy = {
    direction?: OrderDirection;
    field: ResourceGroupOrderField;
};
export type BAIScopedResourceGroupSelectPaginatedQuery$variables = {
    filter?: ResourceGroupFilter | null | undefined;
    limit: number;
    offset: number;
    orderBy?: ReadonlyArray<ResourceGroupOrderBy> | null | undefined;
    scope: ResourceGroupScope;
};
export type BAIScopedResourceGroupSelectPaginatedQuery$data = {
    readonly scopedResourceGroups: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly name: string;
            };
        }>;
    } | null | undefined;
};
export type BAIScopedResourceGroupSelectPaginatedQuery = {
    response: BAIScopedResourceGroupSelectPaginatedQuery$data;
    variables: BAIScopedResourceGroupSelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
