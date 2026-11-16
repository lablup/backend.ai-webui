import { ConcreteRequest } from 'relay-runtime';
export type UpsertEntityLabelInput = {
    key: string;
    target: EntityTarget;
    value: string;
};
export type EntityTarget = {
    entityId: string;
    entityType: string;
};
export type BAIEntityLabelSettingModalUpsertMutation$variables = {
    input: UpsertEntityLabelInput;
};
export type BAIEntityLabelSettingModalUpsertMutation$data = {
    readonly upsertEntityLabel: {
        readonly label: {
            readonly id: string;
            readonly key: string;
            readonly value: string;
        };
    } | null | undefined;
};
export type BAIEntityLabelSettingModalUpsertMutation = {
    response: BAIEntityLabelSettingModalUpsertMutation$data;
    variables: BAIEntityLabelSettingModalUpsertMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
