import { ConcreteRequest } from 'relay-runtime';
export type PresetTarget = "ARGS" | "ENV" | "%future added value";
export type PresetValueType = "BOOL" | "FLAG" | "FLOAT" | "INT" | "STR" | "%future added value";
export type RuntimeVariantPresetUIType = "CHECKBOX" | "NUMBER_INPUT" | "SELECT" | "SLIDER" | "TEXT_INPUT" | "%future added value";
export type CreateRuntimeVariantPresetInput = {
    category?: string | null | undefined;
    defaultValue?: string | null | undefined;
    description?: string | null | undefined;
    displayName?: string | null | undefined;
    key: string;
    name: string;
    presetTarget: PresetTarget;
    required?: boolean;
    runtimeVariantId: string;
    uiOption?: RuntimeVariantPresetUIOptionInput | null | undefined;
    valueType: PresetValueType;
};
export type RuntimeVariantPresetUIOptionInput = {
    choices?: RuntimeVariantPresetChoiceOptionInput | null | undefined;
    number?: RuntimeVariantPresetNumberOptionInput | null | undefined;
    slider?: RuntimeVariantPresetSliderOptionInput | null | undefined;
    text?: RuntimeVariantPresetTextOptionInput | null | undefined;
    uiType: RuntimeVariantPresetUIType;
};
export type RuntimeVariantPresetSliderOptionInput = {
    max: number;
    min: number;
    step?: number;
};
export type RuntimeVariantPresetNumberOptionInput = {
    max?: number | null | undefined;
    min?: number | null | undefined;
};
export type RuntimeVariantPresetChoiceOptionInput = {
    items: ReadonlyArray<RuntimeVariantPresetChoiceItemInput>;
};
export type RuntimeVariantPresetChoiceItemInput = {
    label: string;
    value: string;
};
export type RuntimeVariantPresetTextOptionInput = {
    placeholder?: string | null | undefined;
};
export type BAIRuntimeVariantPresetSettingModalCreateMutation$variables = {
    input: CreateRuntimeVariantPresetInput;
};
export type BAIRuntimeVariantPresetSettingModalCreateMutation$data = {
    readonly adminCreateRuntimeVariantPreset: {
        readonly preset: {
            readonly category: string | null | undefined;
            readonly createdAt: string;
            readonly description: string | null | undefined;
            readonly displayName: string | null | undefined;
            readonly id: string;
            readonly name: string;
            readonly rank: number;
            readonly required: boolean;
            readonly runtimeVariantId: string;
            readonly targetSpec: {
                readonly defaultValue: string | null | undefined;
                readonly key: string;
                readonly presetTarget: PresetTarget;
                readonly valueType: PresetValueType;
            };
            readonly uiOption: {
                readonly choices: {
                    readonly items: ReadonlyArray<{
                        readonly label: string;
                        readonly value: string;
                    }>;
                } | null | undefined;
                readonly number: {
                    readonly max: number | null | undefined;
                    readonly min: number | null | undefined;
                } | null | undefined;
                readonly slider: {
                    readonly max: number;
                    readonly min: number;
                    readonly step: number;
                } | null | undefined;
                readonly text: {
                    readonly placeholder: string | null | undefined;
                } | null | undefined;
                readonly uiType: string;
            } | null | undefined;
            readonly updatedAt: string | null | undefined;
        };
    } | null | undefined;
};
export type BAIRuntimeVariantPresetSettingModalCreateMutation = {
    response: BAIRuntimeVariantPresetSettingModalCreateMutation$data;
    variables: BAIRuntimeVariantPresetSettingModalCreateMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
