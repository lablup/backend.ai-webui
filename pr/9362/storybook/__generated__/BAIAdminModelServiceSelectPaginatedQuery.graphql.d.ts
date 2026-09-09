import { ConcreteRequest } from 'relay-runtime';
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
export type ReplicaHealthStatus = "DEGRADED" | "HEALTHY" | "NOT_CHECKED" | "UNHEALTHY" | "%future added value";
export type ReplicaStatus = "FAILED_TO_START" | "PROVISIONING" | "RUNNING" | "TERMINATED" | "TERMINATING" | "%future added value";
export type TrafficStatus = "ACTIVE" | "INACTIVE" | "%future added value";
export type DeploymentFilter = {
    AND?: ReadonlyArray<DeploymentFilter> | null | undefined;
    NOT?: ReadonlyArray<DeploymentFilter> | null | undefined;
    OR?: ReadonlyArray<DeploymentFilter> | null | undefined;
    createdAt?: DateTimeFilter | null | undefined;
    createdUserId?: UUIDFilter | null | undefined;
    destroyedAt?: NullableDateTimeFilter | null | undefined;
    domainName?: StringFilter | null | undefined;
    endpointUrl?: StringFilter | null | undefined;
    name?: StringFilter | null | undefined;
    openToPublic?: boolean | null | undefined;
    projectId?: UUIDFilter | null | undefined;
    replicas?: ReplicaNestedFilter | null | undefined;
    resourceGroup?: StringFilter | null | undefined;
    status?: DeploymentStatusFilter | null | undefined;
    tags?: StringFilter | null | undefined;
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
export type DeploymentStatusFilter = {
    equals?: DeploymentStatus | null | undefined;
    in?: ReadonlyArray<DeploymentStatus> | null | undefined;
    notEquals?: DeploymentStatus | null | undefined;
    notIn?: ReadonlyArray<DeploymentStatus> | null | undefined;
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
export type NullableDateTimeFilter = {
    after?: string | null | undefined;
    before?: string | null | undefined;
    equals?: string | null | undefined;
    isNull?: boolean | null | undefined;
    notEquals?: string | null | undefined;
};
export type ReplicaNestedFilter = {
    every?: ReplicaFilter | null | undefined;
    none?: ReplicaFilter | null | undefined;
    some?: ReplicaFilter | null | undefined;
};
export type ReplicaFilter = {
    AND?: ReadonlyArray<ReplicaFilter> | null | undefined;
    NOT?: ReadonlyArray<ReplicaFilter> | null | undefined;
    OR?: ReadonlyArray<ReplicaFilter> | null | undefined;
    healthStatus?: ReplicaHealthStatusFilter | null | undefined;
    status?: ReplicaStatusFilter | null | undefined;
    trafficStatus?: TrafficStatusFilter | null | undefined;
};
export type ReplicaStatusFilter = {
    equals?: ReplicaStatus | null | undefined;
    in?: ReadonlyArray<ReplicaStatus> | null | undefined;
    notEquals?: ReplicaStatus | null | undefined;
    notIn?: ReadonlyArray<ReplicaStatus> | null | undefined;
};
export type ReplicaHealthStatusFilter = {
    equals?: ReplicaHealthStatus | null | undefined;
    in?: ReadonlyArray<ReplicaHealthStatus> | null | undefined;
    notEquals?: ReplicaHealthStatus | null | undefined;
    notIn?: ReadonlyArray<ReplicaHealthStatus> | null | undefined;
};
export type TrafficStatusFilter = {
    equals?: TrafficStatus | null | undefined;
    in?: ReadonlyArray<TrafficStatus> | null | undefined;
    notEquals?: TrafficStatus | null | undefined;
    notIn?: ReadonlyArray<TrafficStatus> | null | undefined;
};
export type BAIAdminModelServiceSelectPaginatedQuery$variables = {
    filter?: DeploymentFilter | null | undefined;
    limit: number;
    offset: number;
};
export type BAIAdminModelServiceSelectPaginatedQuery$data = {
    readonly adminDeployments: {
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
export type BAIAdminModelServiceSelectPaginatedQuery = {
    response: BAIAdminModelServiceSelectPaginatedQuery$data;
    variables: BAIAdminModelServiceSelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
