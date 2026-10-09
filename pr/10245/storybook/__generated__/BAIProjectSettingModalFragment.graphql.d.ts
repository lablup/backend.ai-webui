import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIProjectSettingModalFragment$data = {
    readonly allowed_vfolder_hosts: string | null | undefined;
    readonly container_registry: string | null | undefined;
    readonly description: string | null | undefined;
    readonly domain_name: string | null | undefined;
    readonly id: string;
    readonly integration_id: string | null | undefined;
    readonly is_active: boolean | null | undefined;
    readonly name: string | null | undefined;
    readonly resource_policy: string | null | undefined;
    readonly row_id: string | null | undefined;
    readonly scaling_groups: ReadonlyArray<string | null | undefined> | null | undefined;
    readonly total_resource_slots: string | null | undefined;
    readonly type: string | null | undefined;
    readonly " $fragmentType": "BAIProjectSettingModalFragment";
};
export type BAIProjectSettingModalFragment$key = {
    readonly " $data"?: BAIProjectSettingModalFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIProjectSettingModalFragment">;
};
declare const node: ReaderFragment;
export default node;
