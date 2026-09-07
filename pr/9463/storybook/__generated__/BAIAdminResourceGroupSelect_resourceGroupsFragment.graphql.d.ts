import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIAdminResourceGroupSelect_resourceGroupsFragment$data = {
    readonly resourceGroups: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly name: string;
            };
        }>;
    } | null | undefined;
    readonly " $fragmentType": "BAIAdminResourceGroupSelect_resourceGroupsFragment";
};
export type BAIAdminResourceGroupSelect_resourceGroupsFragment$key = {
    readonly " $data"?: BAIAdminResourceGroupSelect_resourceGroupsFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIAdminResourceGroupSelect_resourceGroupsFragment">;
};
declare const node: ReaderFragment;
export default node;
