import { ConcreteRequest } from 'relay-runtime';
export type ContainerRegistryType = "DOCKER" | "ECR" | "ECR_PUB" | "GITHUB" | "GITLAB" | "HARBOR" | "HARBOR2" | "LOCAL" | "OCP" | "%future added value";
export type ContainerRegistryV2Filter = {
    AND?: ReadonlyArray<ContainerRegistryV2Filter> | null | undefined;
    NOT?: ReadonlyArray<ContainerRegistryV2Filter> | null | undefined;
    OR?: ReadonlyArray<ContainerRegistryV2Filter> | null | undefined;
    entityId?: UUIDFilter | null | undefined;
    isGlobal?: boolean | null | undefined;
    registryName?: StringFilter | null | undefined;
    type?: ContainerRegistryTypeFilter | null | undefined;
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
export type ContainerRegistryTypeFilter = {
    equals?: ContainerRegistryType | null | undefined;
    in_?: ReadonlyArray<ContainerRegistryType> | null | undefined;
    notEquals?: ContainerRegistryType | null | undefined;
    notIn?: ReadonlyArray<ContainerRegistryType> | null | undefined;
};
export type UUIDFilter = {
    equals?: string | null | undefined;
    in?: ReadonlyArray<string> | null | undefined;
    notEquals?: string | null | undefined;
    notIn?: ReadonlyArray<string> | null | undefined;
};
export type BAIAdminContainerRegistrySelectValueQuery$variables = {
    limit: number;
    selectedFilter?: ContainerRegistryV2Filter | null | undefined;
    skipSelected: boolean;
};
export type BAIAdminContainerRegistrySelectValueQuery$data = {
    readonly adminContainerRegistriesV2?: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly entityId: string;
                readonly id: string;
                readonly project: string | null | undefined;
                readonly registryName: string;
            };
        }>;
    } | null | undefined;
};
export type BAIAdminContainerRegistrySelectValueQuery = {
    response: BAIAdminContainerRegistrySelectValueQuery$data;
    variables: BAIAdminContainerRegistrySelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
