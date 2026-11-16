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
export type UpdateAllowedResourceGroupsForProjectInput = {
    add?: ReadonlyArray<string> | null | undefined;
    projectId: string;
    remove?: ReadonlyArray<string> | null | undefined;
};
export type BAIProjectSettingModalModifyMutation$variables = {
    gid: string;
    isResourceGroupsUnchanged: boolean;
    props: ModifyGroupInput;
    resourceGroupsInput: UpdateAllowedResourceGroupsForProjectInput;
};
export type BAIProjectSettingModalModifyMutation$data = {
    readonly adminUpdateAllowedResourceGroupsForProjectV2?: {
        readonly items: ReadonlyArray<string>;
    } | null | undefined;
    readonly modify_group: {
        readonly group: {
            readonly id: string | null | undefined;
            readonly scaling_groups: ReadonlyArray<string | null | undefined> | null | undefined;
        } | null | undefined;
        readonly msg: string | null | undefined;
        readonly ok: boolean | null | undefined;
    } | null | undefined;
};
export type BAIProjectSettingModalModifyMutation = {
    response: BAIProjectSettingModalModifyMutation$data;
    variables: BAIProjectSettingModalModifyMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
