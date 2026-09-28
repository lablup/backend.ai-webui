import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type PresetTarget = "ARGS" | "ENV" | "%future added value";
export type PresetValueType = "BOOL" | "FLAG" | "FLOAT" | "INT" | "STR" | "%future added value";
export type BAIRuntimeVariantPresetTableFragment$data = ReadonlyArray<{
    readonly category: string | null | undefined;
    readonly createdAt: string;
    readonly description: string | null | undefined;
    readonly displayName: string | null | undefined;
    readonly id: string;
    readonly name: string;
    readonly rank: number;
    readonly required: boolean;
    readonly runtimeVariant: {
        readonly name: string;
    } | null | undefined;
    readonly runtimeVariantId: string;
    readonly targetSpec: {
        readonly defaultValue: string | null | undefined;
        readonly key: string;
        readonly presetTarget: PresetTarget;
        readonly valueType: PresetValueType;
    };
    readonly uiOption: {
        readonly uiType: string;
    } | null | undefined;
    readonly updatedAt: string | null | undefined;
    readonly " $fragmentType": "BAIRuntimeVariantPresetTableFragment";
} | null | undefined>;
export type BAIRuntimeVariantPresetTableFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIRuntimeVariantPresetTableFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIRuntimeVariantPresetTableFragment">;
}>;
declare const node: ReaderFragment;
export default node;
