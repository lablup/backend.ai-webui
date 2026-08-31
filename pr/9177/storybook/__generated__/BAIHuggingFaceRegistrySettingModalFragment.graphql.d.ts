import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIHuggingFaceRegistrySettingModalFragment$data = {
    readonly id: string;
    readonly token: string | null | undefined;
    readonly " $fragmentType": "BAIHuggingFaceRegistrySettingModalFragment";
};
export type BAIHuggingFaceRegistrySettingModalFragment$key = {
    readonly " $data"?: BAIHuggingFaceRegistrySettingModalFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIHuggingFaceRegistrySettingModalFragment">;
};
declare const node: ReaderFragment;
export default node;
