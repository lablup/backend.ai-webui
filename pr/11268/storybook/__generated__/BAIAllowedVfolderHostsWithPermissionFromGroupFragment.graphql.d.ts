import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIAllowedVfolderHostsWithPermissionFromGroupFragment$data = {
    readonly allowed_vfolder_hosts: string | null | undefined;
    readonly " $fragmentType": "BAIAllowedVfolderHostsWithPermissionFromGroupFragment";
};
export type BAIAllowedVfolderHostsWithPermissionFromGroupFragment$key = {
    readonly " $data"?: BAIAllowedVfolderHostsWithPermissionFromGroupFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIAllowedVfolderHostsWithPermissionFromGroupFragment">;
};
declare const node: ReaderFragment;
export default node;
