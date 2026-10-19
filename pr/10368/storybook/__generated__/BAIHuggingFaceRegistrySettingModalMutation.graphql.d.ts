import { ConcreteRequest } from 'relay-runtime';
export type UpdateHuggingFaceRegistryInput = {
    id: string;
    name?: string | null | undefined;
    token?: string | null | undefined;
    url?: string | null | undefined;
};
export type BAIHuggingFaceRegistrySettingModalMutation$variables = {
    input: UpdateHuggingFaceRegistryInput;
};
export type BAIHuggingFaceRegistrySettingModalMutation$data = {
    readonly updateHuggingfaceRegistry: {
        readonly huggingfaceRegistry: {
            readonly id: string;
            readonly token: string | null | undefined;
        };
    } | null | undefined;
};
export type BAIHuggingFaceRegistrySettingModalMutation = {
    response: BAIHuggingFaceRegistrySettingModalMutation$data;
    variables: BAIHuggingFaceRegistrySettingModalMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
