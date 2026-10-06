import { ConcreteRequest } from 'relay-runtime';
export type BAIEntityLabelSettingModalPurgeMutation$variables = {
    id: string;
};
export type BAIEntityLabelSettingModalPurgeMutation$data = {
    readonly purgeEntityLabel: {
        readonly label: {
            readonly id: string;
        };
    } | null | undefined;
};
export type BAIEntityLabelSettingModalPurgeMutation = {
    response: BAIEntityLabelSettingModalPurgeMutation$data;
    variables: BAIEntityLabelSettingModalPurgeMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
