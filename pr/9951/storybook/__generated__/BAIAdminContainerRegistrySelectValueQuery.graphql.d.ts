import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminContainerRegistrySelectValueQuery$variables = {
    first: number;
    selectedFilter?: string | null | undefined;
    skipSelected: boolean;
};
export type BAIAdminContainerRegistrySelectValueQuery$data = {
    readonly container_registry_nodes?: {
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
export type BAIAdminContainerRegistrySelectValueQuery = {
    response: BAIAdminContainerRegistrySelectValueQuery$data;
    variables: BAIAdminContainerRegistrySelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
