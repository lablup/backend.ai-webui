/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedAutoMountedFolderNamesQuery } from '../__generated__/useSuspendedAutoMountedFolderNamesQuery.graphql';
import * as _ from 'lodash-es';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Names of the ready dotfile folders a session in this project mounts on its
 * own. Same filter VFolderTable and VFolderNodeListPage use. Suspends.
 */
export const useSuspendedAutoMountedFolderNames = (
  currentProjectId: string,
): Array<string> => {
  'use memo';
  const { vfolder_nodes } =
    useLazyLoadQuery<useSuspendedAutoMountedFolderNamesQuery>(
      graphql`
        query useSuspendedAutoMountedFolderNamesQuery(
          $scopeId: ScopeField
          $filter: String
        ) {
          # first bounds correctness, not just the page size: a name missing from
          # this list is a folder the launcher offers for mounting even though
          # the session already mounts it.
          vfolder_nodes(
            scope_id: $scopeId
            filter: $filter
            first: 100
            permission: "read_attribute"
          ) {
            edges {
              node {
                name
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
