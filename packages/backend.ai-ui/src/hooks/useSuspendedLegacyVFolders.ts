import type { useSuspendedLegacyVFoldersQuery } from '../__generated__/useSuspendedLegacyVFoldersQuery.graphql';
import useConnectedBAIClient from '../components/provider/BAIClientProvider/hooks/useConnectedBAIClient';
import {
  fetchQuery,
  graphql,
  useLazyLoadQuery,
  useRelayEnvironment,
} from 'react-relay';

/** A `vfolder_nodes` row. `id` is the dashed row uuid; `group` is null for a user folder. */
export interface LegacyVFolder {
  name: string;
  id: string;
  host: string;
  status: string;
  usage_mode: string;
  created_at: string;
  /** The caller's mount level: `rw` / `ro` / `none`, or `''` before 26.9.0a1. */
  permission: string;
  /** The owner's uuid for a user folder. */
  user: string | null;
  group: string | null;
  creator: string;
  user_email: string | null;
  group_name: string | null;
  ownership_type: string;
}

export interface LegacyVFolderListOptions {
  /** Scopes the list to a project; the caller's own folders come with it. */
  groupId?: string;
}

const MOUNT_VERBS = [
  ['mount_wd', 'rw'],
  ['mount_rw', 'rw'],
  ['mount_ro', 'ro'],
] as const;

/**
 * The caller's mount level from `vfolder_nodes.permissions` (backend.ai#14679).
 * `null` means the manager predates the field's `@since`, so the level is unknown.
 * The manager clamps these verbs by the folder default even for the owner, so
 * the hook reads an owned folder as `rw` instead, as `resolve_mount_policy` does.
 */
export const mountLevelFromPermissions = (
  permissions: ReadonlyArray<unknown> | null | undefined,
): string => {
  if (!permissions) return '';
  const held = new Set(permissions);
  return MOUNT_VERBS.find(([verb]) => held.has(verb))?.[1] ?? 'none';
};

const isSameUuid = (a: string, b: string | undefined) =>
  !!b &&
  a.replace(/-/g, '').toLowerCase() === b.replace(/-/g, '').toLowerCase();

const PAGE_SIZE = 500;
const ACTIVE_ONLY =
  'status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"';

const folderListQuery = graphql`
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
          user
          user_email
          group
          group_name
          creator
          ownership_type
          permissions @since(version: "26.9.0a1")
        }
      }
    }
  }
`;

/** The caller's folders reachable from `groupId`, for the mount inputs. Suspends. */
export const useSuspendedLegacyVFolders = ({
  groupId,
}: LegacyVFolderListOptions = {}) => {
  'use memo';
  const environment = useRelayEnvironment();
  const { user_uuid: myUserId } = useConnectedBAIClient();
  const variables = {
    scopeId: groupId ? `project:${groupId}` : null,
    filter: ACTIVE_ONLY,
    first: PAGE_SIZE,
  };
  const data = useLazyLoadQuery<useSuspendedLegacyVFoldersQuery>(
    folderListQuery,
    variables,
    { fetchPolicy: 'store-and-network' },
  );

  const folders: Array<LegacyVFolder> = (data.vfolder_nodes?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node) => !!node)
    .map((node) => ({
      name: node.name ?? '',
      id: node.row_id ?? '',
      host: node.host ?? '',
      status: node.status ?? '',
      usage_mode: node.usage_mode ?? '',
      created_at: node.created_at ?? '',
      // TODO(needs-backend): drop the owner rule once BA-8322 makes
      // `permissions` carry the owner's level (keep it for managers without the fix).
      permission:
        node.user && isSameUuid(node.user, myUserId)
          ? 'rw'
          : mountLevelFromPermissions(node.permissions),
      user: node.user ?? null,
      group: node.group ?? null,
      creator: node.creator ?? '',
      user_email: node.user_email ?? null,
      group_name: node.group_name ?? null,
      ownership_type: node.ownership_type ?? '',
    }));

  // Resolves once the store holds the fresh list, so a caller can select a
  // folder it just created.
  const refetch = () =>
    fetchQuery<useSuspendedLegacyVFoldersQuery>(
      environment,
      folderListQuery,
      variables,
      { fetchPolicy: 'network-only' },
    ).toPromise();

  return { folders, refetch };
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
