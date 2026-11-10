import { ConcreteRequest } from 'relay-runtime';
export type KeypairFilter = {
    AND?: ReadonlyArray<KeypairFilter> | null | undefined;
    NOT?: ReadonlyArray<KeypairFilter> | null | undefined;
    OR?: ReadonlyArray<KeypairFilter> | null | undefined;
    accessKey?: StringFilter | null | undefined;
    createdAt?: DateTimeFilter | null | undefined;
    fieldId?: UUIDFilter | null | undefined;
    isActive?: boolean | null | undefined;
    isAdmin?: boolean | null | undefined;
    isDefault?: boolean | null | undefined;
    lastUsed?: DateTimeFilter | null | undefined;
    resourcePolicy?: StringFilter | null | undefined;
    userId?: UUIDFilter | null | undefined;
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
export type DateTimeFilter = {
    after?: string | null | undefined;
    before?: string | null | undefined;
    equals?: string | null | undefined;
    notEquals?: string | null | undefined;
};
export type BAIKeypairSelectValueQuery$variables = {
    filter?: KeypairFilter | null | undefined;
    limit: number;
    skipSelected: boolean;
};
export type BAIKeypairSelectValueQuery$data = {
    readonly adminKeypairsV2?: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly accessKey: string;
                readonly id: string;
            };
        }>;
    } | null | undefined;
};
export type BAIKeypairSelectValueQuery = {
    response: BAIKeypairSelectValueQuery$data;
    variables: BAIKeypairSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
