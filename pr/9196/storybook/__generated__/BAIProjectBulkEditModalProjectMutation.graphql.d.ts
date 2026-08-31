import { ConcreteRequest } from 'relay-runtime';
export type ModifyGroupInput = {
    allowed_vfolder_hosts?: string | null | undefined;
    container_registry?: string | null | undefined;
    description?: string | null | undefined;
    domain_name?: string | null | undefined;
    integration_id?: string | null | undefined;
    is_active?: boolean | null | undefined;
    name?: string | null | undefined;
    resource_policy?: string | null | undefined;
    total_resource_slots?: string | null | undefined;
    user_update_mode?: string | null | undefined;
    user_uuids?: ReadonlyArray<string | null | undefined> | null | undefined;
};
export type BAIProjectBulkEditModalProjectMutation$variables = {
    gid: string;
    props: ModifyGroupInput;
};
export type BAIProjectBulkEditModalProjectMutation$data = {
    readonly modify_group: {
        readonly ok: boolean | null | undefined;
    } | null | undefined;
};
export type BAIProjectBulkEditModalProjectMutation = {
    response: BAIProjectBulkEditModalProjectMutation$data;
    variables: BAIProjectBulkEditModalProjectMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
