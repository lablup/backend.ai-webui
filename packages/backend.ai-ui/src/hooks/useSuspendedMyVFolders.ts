import { useSuspendedMyVFoldersQuery } from '../__generated__/useSuspendedMyVFoldersQuery.graphql';
import useConnectedBAIClient from '../components/provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { toLocalId } from '../helper';
import { useSuspenseTanQuery } from '../helper/reactQueryAlias';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';
import type { IEnvironment } from 'relay-runtime';

/**
 * The flat folder row the mount select and `VFolderTable` read, mapped from a
 * `myVfolders` node (the shape `GET /folders` returned): `id` is the 32-hex
 * local id (no dashes) and `group` is the owning project's UUID or `null`.
 */
export interface VFolderListItem {
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

// DELETE_COMPLETE rows are dropped server side; the other deletion states stay
// listed, as `GET /folders` listed them.
const myVfoldersQuery = graphql`
  query useSuspendedMyVFoldersQuery($limit: Int!, $offset: Int!) {
    myVfolders(
      limit: $limit
      offset: $offset
      filter: { status: { notIn: [DELETE_COMPLETE] } }
      orderBy: [{ field: CREATED_AT, direction: DESC }]
    ) {
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
  useSuspendedMyVFoldersQuery['response']['myVfolders']
>['edges'][number]['node'];

const PERMISSION_BY_MOUNT_LEVEL: Record<string, string> = {
  READ_ONLY: 'ro',
  READ_WRITE: 'rw',
  RW_DELETE: 'wd',
  NONE: '',
};

/**
 * A `myVfolders` node as a `VFolderListItem`. `quota` / `usage` are not selected
 * (26.4.4+, and `usage` is a storage-proxy round trip); no consumer reads them.
 */
export const toVFolderListItem = (
  node: MyVfolderNode,
  currentUserId: string,
): VFolderListItem => {
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
    permission: PERMISSION_BY_MOUNT_LEVEL[node.accessControl.permission] ?? '',
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

/** Every page of `myVfolders`. */
const fetchAllMyVfolders = async (
  relayEnv: IEnvironment,
  currentUserId: string,
): Promise<Array<VFolderListItem>> => {
  const folders: Array<VFolderListItem> = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = (
      await fetchQuery<useSuspendedMyVFoldersQuery>(relayEnv, myVfoldersQuery, {
        limit: PAGE_SIZE,
        offset,
      }).toPromise()
    )?.myVfolders;
    const nodes = page?.edges.map((edge) => edge.node) ?? [];
    folders.push(
      ...nodes.map((node) => toVFolderListItem(node, currentUserId)),
    );
    if (nodes.length < PAGE_SIZE || folders.length >= (page?.count ?? 0)) {
      return folders;
    }
  }
};

/**
 * The caller's folder list behind `BAIVFolderMountConfigInput`. Suspends. One
 * cache entry, so a host deriving something from the same list (auto-mounted
 * names) shares the single fetch.
 */
export const useSuspendedMyVFolders = () => {
  'use memo';
  const baiClient = useConnectedBAIClient();
  const relayEnv = useRelayEnvironment();

  const { data, refetch, isFetching } = useSuspenseTanQuery<
    Array<VFolderListItem>
  >({
    queryKey: ['BAIVFolderMountConfigInputFolders'],
    queryFn: () => fetchAllMyVfolders(relayEnv, baiClient.user_uuid),
    staleTime: 30 * 1000,
  });

  return { folders: data, refetch, isFetching };
};

export interface VFolderMountScope {
  currentProjectId?: string;
  /** Hosts granting `mount-in-session`; omitted skips the host gate. */
  mountableHosts?: ReadonlyArray<string>;
}

/**
 * The gate `mount_ids` must pass server side: a host allowing
 * mount-in-session, and a folder of this project or the user's own.
 */
export const isMountableVFolder = (
  folder: VFolderListItem,
  { currentProjectId, mountableHosts }: VFolderMountScope,
): boolean =>
  (!mountableHosts || mountableHosts.includes(folder.host)) &&
  (folder.ownership_type === 'user' ||
    !folder.group ||
    folder.group === currentProjectId);
