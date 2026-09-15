import { ConcreteRequest } from 'relay-runtime';
export type ResourceGroupFilter = {
    AND?: ReadonlyArray<ResourceGroupFilter> | null | undefined;
    NOT?: ReadonlyArray<ResourceGroupFilter> | null | undefined;
    OR?: ReadonlyArray<ResourceGroupFilter> | null | undefined;
    description?: StringFilter | null | undefined;
    isActive?: boolean | null | undefined;
    isDefault?: boolean | null | undefined;
    isPublic?: boolean | null | undefined;
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
export type BAIResourceGroupSelectQuery$variables = {
    filter?: ResourceGroupFilter | null | undefined;
};
export type BAIResourceGroupSelectQuery$data = {
    readonly adminResourceGroups: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly name: string;
            };
        }>;
    } | null | undefined;
};
export type BAIResourceGroupSelectQuery = {
    response: BAIResourceGroupSelectQuery$data;
    variables: BAIResourceGroupSelectQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
