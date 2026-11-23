import { ConcreteRequest } from 'relay-runtime';
export type RuntimeVariantFilter = {
    AND?: ReadonlyArray<RuntimeVariantFilter> | null | undefined;
    NOT?: ReadonlyArray<RuntimeVariantFilter> | null | undefined;
    OR?: ReadonlyArray<RuntimeVariantFilter> | null | undefined;
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
export type BAIRuntimeVariantSelectPaginatedQuery$variables = {
    filter?: RuntimeVariantFilter | null | undefined;
    limit: number;
    offset: number;
};
export type BAIRuntimeVariantSelectPaginatedQuery$data = {
    readonly runtimeVariants: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly name: string;
                readonly readsVfolderConfigFiles: boolean;
            };
        }>;
    } | null | undefined;
};
export type BAIRuntimeVariantSelectPaginatedQuery = {
    response: BAIRuntimeVariantSelectPaginatedQuery$data;
    variables: BAIRuntimeVariantSelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
