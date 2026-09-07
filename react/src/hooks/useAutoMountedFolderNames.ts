/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useAutoMountedFolderNamesQuery } from '../__generated__/useAutoMountedFolderNamesQuery.graphql';
import * as _ from 'lodash-es';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Names of the ready dotfile folders a session in this project mounts on its
 * own. Same filter VFolderTable and VFolderNodeListPage use. Suspends.
 */
export const useAutoMountedFolderNames = (
  currentProjectId: string,
): Array<string> => {
  'use memo';
  const { vfolder_nodes } = useLazyLoadQuery<useAutoMountedFolderNamesQuery>(
    graphql`
      query useAutoMountedFolderNamesQuery(
        $scopeId: ScopeField
        $filter: String
      ) {
        vfolder_nodes(
          scope_id: $scopeId
          filter: $filter
          first: 100
          permission: "read_attribute"
        ) {
          edges {
            node {
              name
              status
            }
          }
        }
      }
    `,
    {
      scopeId: `project:${currentProjectId}`,
      filter: 'name ilike ".%" & status == "ready"',
    },
  );

  return _.compact(_.map(vfolder_nodes?.edges, (edge) => edge?.node?.name));
};

export default useAutoMountedFolderNames;
