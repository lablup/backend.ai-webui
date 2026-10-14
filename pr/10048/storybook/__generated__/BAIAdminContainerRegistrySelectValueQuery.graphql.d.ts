import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminContainerRegistrySelectValueQuery$variables = {
    nodeId: string;
    skipSelected: boolean;
};
export type BAIAdminContainerRegistrySelectValueQuery$data = {
    readonly node?: {
        readonly entityId?: string;
        readonly id?: string;
        readonly project?: string | null | undefined;
        readonly registryName?: string;
    } | null | undefined;
};
export type BAIAdminContainerRegistrySelectValueQuery = {
    response: BAIAdminContainerRegistrySelectValueQuery$data;
    variables: BAIAdminContainerRegistrySelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
