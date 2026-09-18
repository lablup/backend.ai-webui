import { useSuspenseTanQuery } from '../helper/reactQueryAlias';
import { useBAISignedRequestWithPromise } from './useBAISignedRequestWithPromise';

/**
 * A folder as the REST `GET /folders` endpoint returns it. Distinct from the
 * GraphQL `vfolder_nodes` shape: `id` is the 32-hex local id (no dashes) and
 * `group` is the owning project's UUID or `null` for a user folder.
 */
export interface LegacyVFolder {
  name: string;
  id: string;
  quota_scope_id: string;
  host: string;
  status: string;
  usage_mode: string;
  created_at: string;
  is_owner: boolean;
  permission: string;
  user: string | null;
  group: string | null;
  creator: string;
  user_email: string | null;
  group_name: string | null;
  ownership_type: string;
  type: string;
  cloneable: boolean;
  max_files: number;
  max_size: null | number;
  cur_size: number;
}

export interface LegacyVFolderListOptions {
  /** Lists this user's folders instead of the caller's own. */
  ownerEmail?: string;
  /** Scopes the list to a project (`group_id`) server side. */
  groupId?: string;
}

/**
 * The folder list behind `BAIVFolderMountConfigInput`: the caller's folders,
 * or `ownerEmail`'s when a session is launched on someone else's behalf.
 * Suspends. One cache entry per owner and project, so a host deriving
 * something from the same list (auto-mounted names) shares the single fetch.
 */
export const useSuspendedLegacyVFolders = ({
  ownerEmail,
  groupId,
}: LegacyVFolderListOptions = {}) => {
  'use memo';
  const baiRequestWithPromise = useBAISignedRequestWithPromise();

  const { data, refetch, isFetching } = useSuspenseTanQuery<
    Array<LegacyVFolder>
  >({
    queryKey: [
      'BAIVFolderMountConfigInputFolders',
      ownerEmail ?? '',
      groupId ?? '',
    ],
    queryFn: () => {
      const search = new URLSearchParams();
      if (ownerEmail) search.set('owner_user_email', ownerEmail);
      if (groupId) search.set('group_id', groupId);
      const query = search.toString();
      return baiRequestWithPromise({
        method: 'GET',
        url: `/folders${query ? `?${query}` : ''}`,
      }) as Promise<Array<LegacyVFolder>>;
    },
    staleTime: 30 * 1000,
  });

  return { folders: data, refetch, isFetching };
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
