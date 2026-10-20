import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminContainerRegistrySelectPaginatedQuery$variables = {
    filter?: string | null | undefined;
    limit: number;
    offset: number;
};
export type BAIAdminContainerRegistrySelectPaginatedQuery$data = {
    readonly container_registry_nodes: {
        readonly count: number | null | undefined;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly project: string | null | undefined;
                readonly registry_name: string;
                readonly row_id: string | null | undefined;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
};
export type BAIAdminContainerRegistrySelectPaginatedQuery = {
    response: BAIAdminContainerRegistrySelectPaginatedQuery$data;
    variables: BAIAdminContainerRegistrySelectPaginatedQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
