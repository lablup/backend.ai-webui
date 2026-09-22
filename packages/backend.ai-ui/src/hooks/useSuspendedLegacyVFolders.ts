import type { useSuspendedLegacyVFoldersQuery } from '../__generated__/useSuspendedLegacyVFoldersQuery.graphql';
import { useCallback, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * A folder as `vfolder_nodes` returns it, reshaped to the field names the
 * mount select and the auto-mount helper already read. `id` is the dashed row
 * uuid and `group` is the owning project's uuid, or `null` for a user folder.
 */
export interface LegacyVFolder {
  name: string;
  id: string;
  quota_scope_id: string;
  host: string;
  status: string;
  usage_mode: string;
  created_at: string;
  permission: string;
  user: string | null;
  group: string | null;
  creator: string;
  user_email: string | null;
  group_name: string | null;
  ownership_type: string;
  cloneable: boolean;
  max_files: number;
  max_size: null | number;
  cur_size: number;
}

export interface LegacyVFolderListOptions {
  /** Scopes the list to a project; the caller's own folders come with it. */
  groupId?: string;
}

/** The mount verbs `permissions` can carry, most permissive first. */
const MOUNT_VERBS = [
  ['mount_wd', 'rw'],
  ['mount_rw', 'rw'],
  ['mount_ro', 'ro'],
] as const;

/**
 * The level the CALLER mounts this folder at. `vfolder_nodes.permissions` is
 * resolved per caller — owner, then their policy row, then the folder default
 * (backend.ai#14679) — so a folder they cannot mount carries no mount verb at
 * all. `wd` folds into `rw`, the vocabulary the select renders.
 */
export const mountLevelFromPermissions = (
  permissions: ReadonlyArray<unknown> | null | undefined,
): string => {
  const held = new Set(permissions ?? []);
  return MOUNT_VERBS.find(([verb]) => held.has(verb))?.[1] ?? 'none';
};

// `vfolder_nodes` pages and the select needs the whole set at once, so it asks
// for one page big enough to hold a project's folders. Deleted rows are
// filtered server side to keep that budget for mountable ones.
const PAGE_SIZE = 500;
const ACTIVE_ONLY =
  'status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"';

/**
 * The folder list behind `BAIVFolderMountConfigInput`, and the auto-mount
 * helper reading the same rows. Always the caller's own reachable folders:
 * `vfolder_nodes` takes no owner, so a session launched for somebody else no
 * longer lists that person's folders (FR-4045). Suspends.
 */
export const useSuspendedLegacyVFolders = ({
  groupId,
}: LegacyVFolderListOptions = {}) => {
  'use memo';
  const [fetchKey, setFetchKey] = useState(0);

  const data = useLazyLoadQuery<useSuspendedLegacyVFoldersQuery>(
    graphql`
      query useSuspendedLegacyVFoldersQuery(
        $scopeId: ScopeField
        $filter: String
        $first: Int
      ) {
        vfolder_nodes(
          scope_id: $scopeId
          filter: $filter
          first: $first
          offset: 0
        ) {
          edges {
            node {
              row_id
              name
              host
              status
              usage_mode
              created_at
              quota_scope_id
              user
              user_email
              group
              group_name
              creator
              ownership_type
              cloneable
              max_files
              max_size
              cur_size
              permissions
            }
          }
        }
      }
    `,
    {
      scopeId: groupId ? `project:${groupId}` : null,
      filter: ACTIVE_ONLY,
      first: PAGE_SIZE,
    },
    { fetchKey, fetchPolicy: 'store-and-network' },
  );

  const folders: Array<LegacyVFolder> = (data.vfolder_nodes?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node) => !!node)
    .map((node) => ({
      name: node.name ?? '',
      id: node.row_id ?? '',
      quota_scope_id: node.quota_scope_id ?? '',
      host: node.host ?? '',
      status: node.status ?? '',
      usage_mode: node.usage_mode ?? '',
      created_at: node.created_at ?? '',
      permission: mountLevelFromPermissions(node.permissions),
      user: node.user ?? null,
      group: node.group ?? null,
      creator: node.creator ?? '',
      user_email: node.user_email ?? null,
      group_name: node.group_name ?? null,
      ownership_type: node.ownership_type ?? '',
      cloneable: node.cloneable ?? false,
      max_files: node.max_files ?? 0,
      max_size: node.max_size ?? null,
      cur_size: node.cur_size ?? 0,
    }));

  const refetch = useCallback(async () => {
    setFetchKey((key) => key + 1);
  }, []);

  return { folders, refetch, isFetching: false };
};

export interface LegacyVFolderMountScope {
  currentProjectId?: string;
  /** Hosts granting `mount-in-session`; omitted skips the host gate. */
  mountableHosts?: ReadonlyArray<string>;
}

/**
 * The gate `mount_ids` must pass server side: a host allowing
 * mount-in-session, and a folder of this project or the user's own.
 */
export const isMountableLegacyVFolder = (
  folder: LegacyVFolder,
  { currentProjectId, mountableHosts }: LegacyVFolderMountScope,
): boolean =>
  (!mountableHosts || mountableHosts.includes(folder.host)) &&
  (folder.ownership_type === 'user' ||
    !folder.group ||
    folder.group === currentProjectId);
