import { ConcreteRequest } from 'relay-runtime';
export type BAIAllowedVfolderHostsWithPermissionQuery$variables = Record<PropertyKey, never>;
export type BAIAllowedVfolderHostsWithPermissionQuery$data = {
    readonly vfolder_host_permissions: {
        readonly vfolder_host_permission_list: ReadonlyArray<string | null | undefined> | null | undefined;
    } | null | undefined;
};
export type BAIAllowedVfolderHostsWithPermissionQuery = {
    response: BAIAllowedVfolderHostsWithPermissionQuery$data;
    variables: BAIAllowedVfolderHostsWithPermissionQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
