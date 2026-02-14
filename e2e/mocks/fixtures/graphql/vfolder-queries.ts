/**
 * Mock GraphQL responses for VFolder page Relay queries.
 *
 * VFolderNodeListPage uses:
 * - VFolderNodeListPageQuery (main page query with vfolder_nodes list)
 * - StorageStatusPanelCardQuery (user/project resource policy max vfolder count)
 * - QuotaPerStorageVolumePanelCardUserQuery (current user ID for quota scope)
 * - QuotaPerStorageVolumePanelCardQuery (quota usage/limits per storage volume)
 *
 * Each vfolder_node must include fields for all spread fragments:
 * - VFolderNodesFragment: id, status, name, host, ownership_type, user, group, usage_mode, permissions
 * - EditableVFolderNameFragment: id, name, user, group, status
 * - VFolderNodeIdenticonFragment: id
 * - VFolderPermissionCellFragment: permissions
 * - SharedFolderPermissionInfoModalFragment: id, name, row_id, creator, ownership_type, user_email, permission
 * - DeleteVFolderModalFragment: id, name, permissions
 * - RestoreVFolderModalFragment: id, name
 * - BAIVFolderDeleteButtonFragment: permissions
 * - BAINodeNotificationItemFragment: __typename, status
 */
import type { MockRole } from '../login-responses';

const MOCK_USER_UUID = 'mock-user-uuid-0001';
const MOCK_GROUP_ID = 'mock-group-id-0001';

/** Helper to create a Relay global ID for VirtualFolderNode */
function toGlobalId(localId: string): string {
  return Buffer.from(`VirtualFolderNode:${localId}`).toString('base64');
}

const MOCK_VFOLDERS = [
  {
    localId: 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
    name: 'my-dataset',
    ownership_type: 'user',
    usage_mode: 'general',
    status: 'ready',
    host: 'local:volume1',
    user: MOCK_USER_UUID,
    group: MOCK_GROUP_ID,
    creator: 'user@lablup.com',
    user_email: 'user@lablup.com',
    permission: 'rw',
    permissions: [
      'read_attribute',
      'access_data',
      'update_attribute',
      'delete_vfolder',
    ],
    cur_size: 1048576,
  },
  {
    localId: 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb',
    name: 'shared-models',
    ownership_type: 'group',
    usage_mode: 'model',
    status: 'ready',
    host: 'local:volume1',
    user: MOCK_USER_UUID,
    group: MOCK_GROUP_ID,
    creator: 'admin@lablup.com',
    user_email: 'admin@lablup.com',
    permission: 'ro',
    permissions: ['read_attribute', 'access_data'],
    cur_size: 5242880,
  },
  {
    localId: 'cccccccc-3333-3333-3333-cccccccccccc',
    name: '.automount-config',
    ownership_type: 'user',
    usage_mode: 'general',
    status: 'ready',
    host: 'local:volume1',
    user: MOCK_USER_UUID,
    group: MOCK_GROUP_ID,
    creator: 'user@lablup.com',
    user_email: 'user@lablup.com',
    permission: 'rw',
    permissions: [
      'read_attribute',
      'access_data',
      'update_attribute',
      'delete_vfolder',
    ],
    cur_size: 512,
  },
];

function buildVFolderNode(vf: (typeof MOCK_VFOLDERS)[number]) {
  return {
    id: toGlobalId(vf.localId),
    name: vf.name,
    status: vf.status,
    host: vf.host,
    ownership_type: vf.ownership_type,
    user: vf.user,
    group: vf.group,
    usage_mode: vf.usage_mode,
    permissions: vf.permissions,
    row_id: vf.localId,
    creator: vf.creator,
    user_email: vf.user_email,
    permission: vf.permission,
    cur_size: vf.cur_size,
    // Relay requires __typename for interface/union fragments
    __typename: 'VirtualFolderNode',
    __isNode: 'VirtualFolderNode',
  };
}

/**
 * VFolderNodeListPageQuery response.
 * Returns paginated vfolder_nodes list with active/deleted counts.
 */
export function getVFolderNodeListPageQueryResponse(_role: MockRole = 'user') {
  const nodes = MOCK_VFOLDERS.map(buildVFolderNode);

  return {
    data: {
      vfolder_nodes: {
        edges: nodes.map((node) => ({ node, cursor: node.id })),
        count: nodes.length,
      },
      active: {
        count: nodes.length,
      },
      deleted: {
        count: 0,
      },
    },
  };
}

/**
 * StorageStatusPanelCardQuery response.
 * Returns max vfolder count for user and project resource policies.
 */
export function getStorageStatusPanelCardQueryResponse() {
  return {
    data: {
      user_resource_policy: {
        max_vfolder_count: 10,
      },
      project_resource_policy: {
        max_vfolder_count: 20,
      },
    },
  };
}

/**
 * QuotaPerStorageVolumePanelCardUserQuery response.
 * Returns the current user's Relay global ID.
 */
export function getQuotaPerStorageVolumePanelCardUserQueryResponse() {
  return {
    data: {
      user: {
        id: 'VXNlck5vZGU6bW9jay11c2VyLXV1aWQtMDAwMQ==',
      },
    },
  };
}

/**
 * QuotaPerStorageVolumePanelCardQuery response.
 * Returns quota scope usage/limits for both project and user.
 * When skipQuotaScope is true, these fields are null (skipped by @skip directive).
 */
export function getQuotaPerStorageVolumePanelCardQueryResponse() {
  return {
    data: {
      project_quota_scope: {
        details: {
          usage_bytes: '1073741824',
          hard_limit_bytes: '10737418240',
        },
      },
      user_quota_scope: {
        details: {
          usage_bytes: '536870912',
          hard_limit_bytes: '5368709120',
        },
      },
    },
  };
}

/**
 * FolderExplorerModalQuery response.
 * Returns a single vfolder_node with all fields required by:
 * - FolderExplorerHeaderFragment (id, user, permission, row_id, unmanaged_path, sub-fragments)
 * - VFolderNodeDescriptionFragment (id, host, quota_scope_id, user, user_email, group, group_name,
 *   creator, usage_mode, permission, ownership_type, max_files, max_size, created_at, last_used,
 *   num_files, cur_size, cloneable, status, permissions, unmanaged_path)
 * - VFolderNameTitleNodeFragment (name)
 */
export function getFolderExplorerModalQueryResponse(vfolderGlobalId: string) {
  // FolderExplorerOpener strips hyphens from UUID before calling toGlobalId(),
  // so we must match by both hyphenated and non-hyphenated local IDs.
  const vf =
    MOCK_VFOLDERS.find(
      (v) =>
        toGlobalId(v.localId) === vfolderGlobalId ||
        toGlobalId(v.localId.replaceAll('-', '')) === vfolderGlobalId,
    ) ?? MOCK_VFOLDERS[0];

  return {
    data: {
      vfolder_node: {
        // Use the exact global ID from the query variable so Relay's store
        // normalizes correctly (the UI sends hyphen-stripped UUIDs).
        id: vfolderGlobalId,
        name: vf.name,
        group: vf.group,
        group_name: 'default',
        unmanaged_path: null,
        permissions: vf.permissions,
        host: vf.host,
        user: vf.user,
        user_email: vf.user_email,
        permission: vf.permission,
        row_id: vf.localId,
        status: vf.status,
        // quota_scope_id format: "type:uuid" — used by useVirtualFolderPath to build path.
        // Must not be null; the hook calls .replaceAll('-', '') on the UUID portion.
        quota_scope_id: `user:${MOCK_USER_UUID}`,
        creator: vf.creator,
        usage_mode: vf.usage_mode,
        ownership_type: vf.ownership_type,
        max_files: 0,
        max_size: 0,
        created_at: '2024-06-01T00:00:00+00:00',
        last_used: '2024-06-01T00:00:00+00:00',
        num_files: 3,
        cur_size: vf.cur_size,
        cloneable: false,
        __typename: 'VirtualFolderNode',
      },
    },
  };
}

/**
 * REST response for baiClient.vfolder.list_files() used by FolderExplorerModal.
 * Returns a deterministic set of mock files and directories.
 *
 * VFolderFile type: { name, type: 'FILE'|'DIRECTORY', size, mode, created, modified }
 */
export function getVFolderFilesRestResponse() {
  return {
    items: [
      {
        name: 'models',
        type: 'DIRECTORY',
        size: 0,
        mode: 16877,
        created: '2024-06-01T00:00:00+00:00',
        modified: '2024-06-15T12:00:00+00:00',
      },
      {
        name: 'README.md',
        type: 'FILE',
        size: 2048,
        mode: 33188,
        created: '2024-06-01T00:00:00+00:00',
        modified: '2024-06-10T08:30:00+00:00',
      },
      {
        name: 'config.yaml',
        type: 'FILE',
        size: 512,
        mode: 33188,
        created: '2024-06-02T00:00:00+00:00',
        modified: '2024-06-12T14:00:00+00:00',
      },
      {
        name: 'train.py',
        type: 'FILE',
        size: 8192,
        mode: 33188,
        created: '2024-06-03T00:00:00+00:00',
        modified: '2024-06-20T09:15:00+00:00',
      },
    ],
  };
}

/**
 * REST response for baiClient.vfolder.list() used by StorageStatusPanelCard.
 * Returns array of vfolder objects with is_owner and ownership_type fields
 * that the component uses for counting (created, project, invited).
 */
export function getVFolderListRestResponse() {
  return MOCK_VFOLDERS.map((vf) => ({
    id: vf.localId,
    name: vf.name,
    is_owner: vf.creator === 'user@lablup.com',
    ownership_type: vf.ownership_type,
    status: vf.status,
    host: vf.host,
    usage_mode: vf.usage_mode,
    permission: vf.permission,
    user: vf.user,
    group: vf.group,
    creator: vf.creator,
    created_at: '2024-06-01T00:00:00+00:00',
    cur_size: vf.cur_size,
  }));
}
