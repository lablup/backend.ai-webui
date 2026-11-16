import { ConcreteRequest } from 'relay-runtime';
export type UpdateAllowedResourceGroupsForProjectInput = {
    add?: ReadonlyArray<string> | null | undefined;
    projectId: string;
    remove?: ReadonlyArray<string> | null | undefined;
};
export type BAIProjectSettingModalAllowResourceGroupsMutation$variables = {
    input: UpdateAllowedResourceGroupsForProjectInput;
};
export type BAIProjectSettingModalAllowResourceGroupsMutation$data = {
    readonly adminUpdateAllowedResourceGroupsForProjectV2: {
        readonly items: ReadonlyArray<string>;
    } | null | undefined;
};
export type BAIProjectSettingModalAllowResourceGroupsMutation = {
    response: BAIProjectSettingModalAllowResourceGroupsMutation$data;
    variables: BAIProjectSettingModalAllowResourceGroupsMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
