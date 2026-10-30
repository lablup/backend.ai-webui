import { ConcreteRequest } from 'relay-runtime';
export type DeploymentRevisionPresetFilter = {
    AND?: ReadonlyArray<DeploymentRevisionPresetFilter> | null | undefined;
    NOT?: ReadonlyArray<DeploymentRevisionPresetFilter> | null | undefined;
    OR?: ReadonlyArray<DeploymentRevisionPresetFilter> | null | undefined;
    entityId?: UUIDFilter | null | undefined;
    id?: UUIDFilter | null | undefined;
    labels?: EntityLabelNestedFilter | null | undefined;
    name?: StringFilter | null | undefined;
    runtimeVariantId?: UUIDFilter | null | undefined;
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
export type ModelCardAvailablePresetsScope = {
    modelCardId: string;
};
export type BAIAvailablePresetSelectCardScopedQuery$variables = {
    filter?: DeploymentRevisionPresetFilter | null | undefined;
    limit: number;
    offset: number;
    scope: ModelCardAvailablePresetsScope;
};
export type BAIAvailablePresetSelectCardScopedQuery$data = {
    readonly modelCardAvailablePresets: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly description: string | null | undefined;
                readonly entityId: string;
                readonly id: string;
                readonly name: string;
                readonly rank: number;
                readonly runtimeVariant: {
                    readonly name: string;
                } | null | undefined;
                readonly runtimeVariantId: string;
            };
        }>;
    } | null | undefined;
};
export type BAIAvailablePresetSelectCardScopedQuery = {
    response: BAIAvailablePresetSelectCardScopedQuery$data;
    variables: BAIAvailablePresetSelectCardScopedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
