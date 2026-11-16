import { ConcreteRequest } from 'relay-runtime';
export type GroupInput = {
    allowed_vfolder_hosts?: string | null | undefined;
    container_registry?: string | null | undefined;
    description?: string | null | undefined;
    domain_name: string;
    integration_id?: string | null | undefined;
    is_active?: boolean | null | undefined;
    resource_policy?: string | null | undefined;
    total_resource_slots?: string | null | undefined;
    type?: string | null | undefined;
};
export type BAIProjectSettingModalCreateMutation$variables = {
    name: string;
    props: GroupInput;
};
export type BAIProjectSettingModalCreateMutation$data = {
    readonly create_group: {
        readonly group: {
            readonly id: string | null | undefined;
        } | null | undefined;
        readonly msg: string | null | undefined;
        readonly ok: boolean | null | undefined;
    } | null | undefined;
};
export type BAIProjectSettingModalCreateMutation = {
    response: BAIProjectSettingModalCreateMutation$data;
    variables: BAIProjectSettingModalCreateMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
