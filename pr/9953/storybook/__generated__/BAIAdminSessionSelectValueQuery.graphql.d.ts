import { ConcreteRequest } from 'relay-runtime';
export type SessionV2NetworkType = "HOST" | "PERSISTENT" | "VOLATILE" | "%future added value";
export type SessionV2Result = "FAILURE" | "SUCCESS" | "UNDEFINED" | "%future added value";
export type SessionV2Status = "CANCELLED" | "CREATING" | "DEPRIORITIZING" | "PENDING" | "PREEMPTED" | "PREPARED" | "PREPARING" | "RESCHEDULING" | "RESERVED" | "RUNNING" | "SCHEDULED" | "TERMINATED" | "TERMINATING" | "%future added value";
export type SessionV2Type = "BATCH" | "INFERENCE" | "INTERACTIVE" | "SYSTEM" | "%future added value";
export type SessionV2Filter = {
    AND?: ReadonlyArray<SessionV2Filter> | null | undefined;
    NOT?: ReadonlyArray<SessionV2Filter> | null | undefined;
    OR?: ReadonlyArray<SessionV2Filter> | null | undefined;
    accessKey?: StringFilter | null | undefined;
    batchTimeout?: IntFilter | null | undefined;
    clusterSize?: IntFilter | null | undefined;
    creationId?: StringFilter | null | undefined;
    domainName?: StringFilter | null | undefined;
    id?: UUIDFilter | null | undefined;
    isPreemptible?: boolean | null | undefined;
    jobPriority?: IntFilter | null | undefined;
    labels?: EntityLabelNestedFilter | null | undefined;
    name?: StringFilter | null | undefined;
    networkId?: StringFilter | null | undefined;
    networkType?: SessionV2NetworkTypeFilter | null | undefined;
    priority?: IntFilter | null | undefined;
    projectId?: UUIDFilter | null | undefined;
    replicaId?: UUIDFilter | null | undefined;
    resourceGroupName?: StringFilter | null | undefined;
    result?: SessionV2ResultFilter | null | undefined;
    sessionType?: SessionV2TypeFilter | null | undefined;
    startsAt?: DateTimeFilter | null | undefined;
    status?: SessionV2StatusFilter | null | undefined;
    tag?: StringFilter | null | undefined;
    terminatedAt?: DateTimeFilter | null | undefined;
    tier?: IntFilter | null | undefined;
    useHostNetwork?: boolean | null | undefined;
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
    key?: StringFilter | null | undefined;
    value?: StringFilter | null | undefined;
};
export type SessionV2TypeFilter = {
    equals?: SessionV2Type | null | undefined;
    in?: ReadonlyArray<SessionV2Type> | null | undefined;
    notEquals?: SessionV2Type | null | undefined;
    notIn?: ReadonlyArray<SessionV2Type> | null | undefined;
};
export type IntFilter = {
    equals?: number | null | undefined;
    greaterThan?: number | null | undefined;
    greaterThanOrEqual?: number | null | undefined;
    lessThan?: number | null | undefined;
    lessThanOrEqual?: number | null | undefined;
    notEquals?: number | null | undefined;
};
export type DateTimeFilter = {
    after?: string | null | undefined;
    before?: string | null | undefined;
    equals?: string | null | undefined;
    notEquals?: string | null | undefined;
};
export type SessionV2ResultFilter = {
    equals?: SessionV2Result | null | undefined;
    in?: ReadonlyArray<SessionV2Result> | null | undefined;
    notEquals?: SessionV2Result | null | undefined;
    notIn?: ReadonlyArray<SessionV2Result> | null | undefined;
};
export type SessionV2NetworkTypeFilter = {
    equals?: SessionV2NetworkType | null | undefined;
    in?: ReadonlyArray<SessionV2NetworkType> | null | undefined;
    notEquals?: SessionV2NetworkType | null | undefined;
    notIn?: ReadonlyArray<SessionV2NetworkType> | null | undefined;
};
export type BAIAdminSessionSelectValueQuery$variables = {
    filter?: SessionV2Filter | null | undefined;
    first: number;
    skipSelected: boolean;
};
export type BAIAdminSessionSelectValueQuery$data = {
    readonly adminSessionsV2?: {
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
export type BAIAdminSessionSelectValueQuery = {
    response: BAIAdminSessionSelectValueQuery$data;
    variables: BAIAdminSessionSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
