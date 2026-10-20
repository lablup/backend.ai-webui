import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$data = {
    readonly allowed_vfolder_hosts: string | null | undefined;
    readonly " $fragmentType": "BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment";
};
export type BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$key = {
    readonly " $data"?: BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment">;
};
declare const node: ReaderFragment;
export default node;
