import { useSuspendedLegacyVFoldersQuery } from '../__generated__/useSuspendedLegacyVFoldersQuery.graphql';
import useConnectedBAIClient from '../components/provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { toLocalId } from '../helper';
import { useSuspenseTanQuery } from '../helper/reactQueryAlias';
import { useBAISignedRequestWithPromise } from './useBAISignedRequestWithPromise';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';
import type { IEnvironment } from 'relay-runtime';

/**
 * A folder as the REST `GET /folders` endpoint returns it, which the V2
 * `myVfolders` rows are mapped onto: `id` is the 32-hex local id (no dashes)
 * and `group` is the owning project's UUID or `null` for a user folder.
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
  /** Scopes the REST list to a project (`group_id`) server side. */
  groupId?: string;
}

const myVfoldersQuery = graphql`
  query useSuspendedLegacyVFoldersQuery($limit: Int!, $offset: Int!) {
    myVfolders(
      limit: $limit
      offset: $offset
      orderBy: [{ field: CREATED_AT, direction: DESC }]
    ) @since(version: "26.4.2") {
      count
      edges {
        node {
          id
          status
          host
          metadata {
            name
            usageMode
            quotaScopeId
            createdAt
            cloneable
          }
          accessControl {
            permission
            ownershipType
          }
          ownership {
            userId
            projectId
            creatorEmail
          }
        }
      }
    }
  }
`;

export type MyVfolderNode = NonNullable<
  useSuspendedLegacyVFoldersQuery['response']['myVfolders']
>['edges'][number]['node'];

const REST_PERMISSION_BY_MOUNT_LEVEL: Record<string, string> = {
  READ_ONLY: 'ro',
  READ_WRITE: 'rw',
  RW_DELETE: 'wd',
  NONE: '',
};

/**
 * A `myVfolders` row in the REST row shape. `quota` / `usage` are not selected
 * (26.4.4+, and `usage` is a storage-proxy round trip); no consumer reads them.
 */
export const toLegacyVFolder = (
  node: MyVfolderNode,
  currentUserId: string,
): LegacyVFolder => {
  const ownershipType = node.accessControl.ownershipType.toLowerCase();
  return {
    name: node.metadata.name,
    id: toLocalId(node.id).replace(/-/g, ''),
    quota_scope_id: node.metadata.quotaScopeId ?? '',
    host: node.host,
    status: node.status.toLowerCase().replace(/_/g, '-'),
    usage_mode: node.metadata.usageMode.toLowerCase(),
    created_at: node.metadata.createdAt,
    is_owner:
      ownershipType === 'user' && node.ownership.userId === currentUserId,
    permission:
      REST_PERMISSION_BY_MOUNT_LEVEL[node.accessControl.permission] ?? '',
    user: node.ownership.userId ?? null,
    group: node.ownership.projectId ?? null,
    creator: node.ownership.creatorEmail ?? '',
    user_email: null,
    group_name: null,
    ownership_type: ownershipType,
    type: ownershipType,
    cloneable: node.metadata.cloneable,
    max_files: 0,
    max_size: null,
    cur_size: 0,
  };
};

const PAGE_SIZE = 100;

/** Every page of `myVfolders`, so the list matches what `GET /folders` returned. */
const fetchAllMyVfolders = async (
  relayEnv: IEnvironment,
  currentUserId: string,
): Promise<Array<LegacyVFolder>> => {
  const folders: Array<LegacyVFolder> = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = (
      await fetchQuery<useSuspendedLegacyVFoldersQuery>(
        relayEnv,
        myVfoldersQuery,
        { limit: PAGE_SIZE, offset },
      ).toPromise()
    )?.myVfolders;
    const nodes = page?.edges.map((edge) => edge.node) ?? [];
    folders.push(...nodes.map((node) => toLegacyVFolder(node, currentUserId)));
    if (nodes.length < PAGE_SIZE || folders.length >= (page?.count ?? 0)) {
      return folders;
    }
  }
};

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
  const baiClient = useConnectedBAIClient();
  const relayEnv = useRelayEnvironment();
  const baiRequestWithPromise = useBAISignedRequestWithPromise();
  // `myVfolders` is the caller's own reach, so a list on someone else's
  // behalf stays on REST, which takes `owner_user_email`.
  const readsV2 = !ownerEmail && baiClient.supports('vfolder-v2');

  const { data, refetch, isFetching } = useSuspenseTanQuery<
    Array<LegacyVFolder>
  >({
    queryKey: [
      'BAIVFolderMountConfigInputFolders',
      readsV2 ? 'v2' : 'rest',
      ownerEmail ?? '',
      readsV2 ? '' : (groupId ?? ''),
    ],
    queryFn: () => {
      if (readsV2) {
        return fetchAllMyVfolders(relayEnv, baiClient.user_uuid);
      }
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
