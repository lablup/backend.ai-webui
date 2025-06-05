import { useVirtualFolderNodePathFragment$key } from '../__generated__/useVirtualFolderNodePathFragment.graphql';
import { toLocalId } from '../helper';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useFragment } from 'react-relay';

export const useVirtualFolderPath = (
  vfolderNodeFrgmt: useVirtualFolderNodePathFragment$key,
) => {
  const vfolderNode = useFragment(
    graphql`
      fragment useVirtualFolderNodePathFragment on VirtualFolderNode {
        id
        host
        quota_scope_id
        user
        user_email
        group
        group_name
        creator
        usage_mode
        permission
        ownership_type
        max_files
        max_size
        created_at
        last_used
        num_files
        cur_size
        cloneable
        status
        permissions @since(version: "24.09.0")
      }
    `,
    vfolderNodeFrgmt,
  );

  const [quotaScopeType, quotaScopeIdWithoutType] = _.split(
    vfolderNode?.quota_scope_id,
    ':',
  );
  const vfolderId = toLocalId(vfolderNode?.id);
  const vfolderIdPrefix1 = vfolderId.slice(0, 2);
  const vfolderIdPrefix2 = vfolderId.slice(2, 4);
  const vfolderIdRest = [vfolderId.slice(4)];
  const vfolderPath = `${quotaScopeIdWithoutType}/${vfolderIdPrefix1}/${vfolderIdPrefix2}/${vfolderIdRest}`;

  return {
    quotaScopeType,
    quotaScopeIdWithoutType,
    vfolderId,
    vfolderIdPrefix1,
    vfolderIdPrefix2,
    vfolderIdRest,
    vfolderPath,
  };
};
