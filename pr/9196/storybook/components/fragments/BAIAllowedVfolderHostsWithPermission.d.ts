import { BAIAllowedVfolderHostsWithPermissionFromGroupFragment$key } from '../../__generated__/BAIAllowedVfolderHostsWithPermissionFromGroupFragment.graphql';
import { BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$key } from '../../__generated__/BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type BAIAllowedVfolderHostsWithPermissionProps = {
    allowedHostPermissionFrgmtFromKeyPair: BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment$key;
    allowedHostPermissionFrgmtFromGroup?: never;
} | {
    allowedHostPermissionFrgmtFromKeyPair?: never;
    allowedHostPermissionFrgmtFromGroup: BAIAllowedVfolderHostsWithPermissionFromGroupFragment$key;
};
declare const BAIAllowedVfolderHostsWithPermission: React.FC<BAIAllowedVfolderHostsWithPermissionProps>;
export default BAIAllowedVfolderHostsWithPermission;
