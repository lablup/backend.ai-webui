import { ConcreteRequest } from 'relay-runtime';
export type SessionV2Status = "CANCELLED" | "CREATING" | "DEPRIORITIZING" | "PENDING" | "PREEMPTED" | "PREPARED" | "PREPARING" | "RESCHEDULING" | "RUNNING" | "SCHEDULED" | "TERMINATED" | "TERMINATING" | "%future added value";
export type SessionV2Filter = {
    AND?: ReadonlyArray<SessionV2Filter> | null | undefined;
    NOT?: ReadonlyArray<SessionV2Filter> | null | undefined;
    OR?: ReadonlyArray<SessionV2Filter> | null | undefined;
    domainName?: StringFilter | null | undefined;
    id?: UUIDFilter | null | undefined;
    name?: StringFilter | null | undefined;
    projectId?: UUIDFilter | null | undefined;
    status?: SessionV2StatusFilter | null | undefined;
    userUuid?: UUIDFilter | null | undefined;
};
export type UUIDFilter = {
    equals?: string | null | undefined;
    in?: ReadonlyArray<string> | null | undefined;
    notEquals?: string | null | undefined;
    notIn?: ReadonlyArray<string> | null | undefined;
};
export type SessionV2StatusFilter = {
    equals?: SessionV2Status | null | undefined;
    in?: ReadonlyArray<SessionV2Status> | null | undefined;
    notEquals?: SessionV2Status | null | undefined;
    notIn?: ReadonlyArray<SessionV2Status> | null | undefined;
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
export type BAIAdminSessionSelectPaginatedQuery$variables = {
    filter?: SessionV2Filter | null | undefined;
    limit: number;
    offset: number;
};
export type BAIAdminSessionSelectPaginatedQuery$data = {
    readonly adminSessionsV2: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly metadata: {
                    readonly name: string;
                };
            };
        }>;
    } | null | undefined;
};
export type BAIAdminSessionSelectPaginatedQuery = {
    response: BAIAdminSessionSelectPaginatedQuery$data;
    variables: BAIAdminSessionSelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
