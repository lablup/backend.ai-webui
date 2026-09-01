import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectSettingModalQuery$variables = Record<PropertyKey, never>;
export type BAIProjectSettingModalQuery$data = {
    readonly vfolder_host_permissions: {
        readonly vfolder_host_permission_list: ReadonlyArray<string | null | undefined> | null | undefined;
    } | null | undefined;
};
export type BAIProjectSettingModalQuery = {
    response: BAIProjectSettingModalQuery$data;
    variables: BAIProjectSettingModalQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
