import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIEntityLabelSettingModalFragment$data = {
    readonly edges: ReadonlyArray<{
        readonly node: {
            readonly fieldId: string;
            readonly key: string;
            readonly value: string;
        };
    }>;
    readonly " $fragmentType": "BAIEntityLabelSettingModalFragment";
};
export type BAIEntityLabelSettingModalFragment$key = {
    readonly " $data"?: BAIEntityLabelSettingModalFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIEntityLabelSettingModalFragment">;
};
declare const node: ReaderFragment;
export default node;
