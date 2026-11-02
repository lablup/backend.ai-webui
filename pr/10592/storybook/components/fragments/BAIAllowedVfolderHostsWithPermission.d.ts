import { BAIAllowedVfolderHostsWithPermissionFromGroupFragment$key } from '../../__generated__/BAIAllowedVfolderHostsWithPermissionFromGroupFragment.graphql';
import { BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$key } from '../../__generated__/BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment.graphql';
import { V2AllowedVfolderHostEntry } from '../../helper';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export type BAIAllowedVfolderHostsWithPermissionProps = {
    allowedHostPermissionFrgmtFromKeyPair: BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$key;
    allowedHostPermissionFrgmtFromGroup?: never;
    allowedVfolderHostEntries?: never;
} | {
    allowedHostPermissionFrgmtFromKeyPair?: never;
    allowedHostPermissionFrgmtFromGroup: BAIAllowedVfolderHostsWithPermissionFromGroupFragment$key;
    allowedVfolderHostEntries?: never;
} | {
    allowedHostPermissionFrgmtFromKeyPair?: never;
    allowedHostPermissionFrgmtFromGroup?: never;
    /**
     * The Strawberry V2 `[VFolderHostPermissionEntry!]` shape, for callers
     * on a V2 node that has no JSONString field to spread a fragment from.
     */
    allowedVfolderHostEntries: ReadonlyArray<V2AllowedVfolderHostEntry>;
};
declare const BAIAllowedVfolderHostsWithPermission: React.FC<BAIAllowedVfolderHostsWithPermissionProps>;
export default BAIAllowedVfolderHostsWithPermission;
