import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type PresetTarget = "ARGS" | "ENV" | "%future added value";
export type PresetValueType = "BOOL" | "FLAG" | "FLOAT" | "INT" | "STR" | "%future added value";
export type BAIRuntimeVariantPresetSettingModalFragment$data = {
    readonly category: string | null | undefined;
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
    readonly " $fragmentType": "BAIRuntimeVariantPresetSettingModalFragment";
};
export type BAIRuntimeVariantPresetSettingModalFragment$key = {
    readonly " $data"?: BAIRuntimeVariantPresetSettingModalFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIRuntimeVariantPresetSettingModalFragment">;
};
declare const node: ReaderFragment;
export default node;
