import { ConcreteRequest } from 'relay-runtime';
export type KeypairResourcePolicyV2Filter = {
    AND?: ReadonlyArray<KeypairResourcePolicyV2Filter> | null | undefined;
    NOT?: ReadonlyArray<KeypairResourcePolicyV2Filter> | null | undefined;
    OR?: ReadonlyArray<KeypairResourcePolicyV2Filter> | null | undefined;
    createdAt?: DateTimeFilter | null | undefined;
    idleTimeout?: IntFilter | null | undefined;
    keypair?: KeypairResourcePolicyKeypairNestedFilter | null | undefined;
    maxConcurrentSessions?: IntFilter | null | undefined;
    maxConcurrentSftpSessions?: IntFilter | null | undefined;
    maxContainersPerSession?: IntFilter | null | undefined;
    maxPendingSessionCount?: IntFilter | null | undefined;
    maxSessionLifetime?: IntFilter | null | undefined;
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
export type KeypairResourcePolicyKeypairNestedFilter = {
    userId?: UUIDFilter | null | undefined;
};
export type UUIDFilter = {
    equals?: string | null | undefined;
    in?: ReadonlyArray<string> | null | undefined;
    notEquals?: string | null | undefined;
    notIn?: ReadonlyArray<string> | null | undefined;
};
export type BAIAdminKeypairResourcePolicySelectPaginatedQuery$variables = {
    filter?: KeypairResourcePolicyV2Filter | null | undefined;
    limit: number;
    offset: number;
};
export type BAIAdminKeypairResourcePolicySelectPaginatedQuery$data = {
    readonly adminKeypairResourcePoliciesV2: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly name: string;
            };
        }>;
    } | null | undefined;
};
export type BAIAdminKeypairResourcePolicySelectPaginatedQuery = {
    response: BAIAdminKeypairResourcePolicySelectPaginatedQuery$data;
    variables: BAIAdminKeypairResourcePolicySelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
