import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectSettingModalAssociateMutation$variables = {
    scaling_groups: ReadonlyArray<string | null | undefined>;
    user_group: string;
};
export type BAIProjectSettingModalAssociateMutation$data = {
    readonly associate_scaling_groups_with_user_group: {
        readonly msg: string | null | undefined;
        readonly ok: boolean | null | undefined;
    } | null | undefined;
};
export type BAIProjectSettingModalAssociateMutation = {
    response: BAIProjectSettingModalAssociateMutation$data;
    variables: BAIProjectSettingModalAssociateMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
