import { ConcreteRequest } from 'relay-runtime';
export type DeploymentRevisionPresetFilter = {
    AND?: ReadonlyArray<DeploymentRevisionPresetFilter> | null | undefined;
    NOT?: ReadonlyArray<DeploymentRevisionPresetFilter> | null | undefined;
    OR?: ReadonlyArray<DeploymentRevisionPresetFilter> | null | undefined;
    id?: UUIDFilter | null | undefined;
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
export type BAIAvailablePresetSelectPaginatedQuery$variables = {
    filter?: DeploymentRevisionPresetFilter | null | undefined;
    limit: number;
    offset: number;
};
export type BAIAvailablePresetSelectPaginatedQuery$data = {
    readonly deploymentRevisionPresets: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly description: string | null | undefined;
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
export type BAIAvailablePresetSelectPaginatedQuery = {
    response: BAIAvailablePresetSelectPaginatedQuery$data;
    variables: BAIAvailablePresetSelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
