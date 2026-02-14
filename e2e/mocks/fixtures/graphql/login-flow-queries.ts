/**
 * Mock GraphQL responses for the login flow.
 *
 * After REST login succeeds, `_connectViaGQL()` in backend-ai-login.ts
 * fires 3 sequential GraphQL queries to initialize the client:
 *   1. keypair query  -> get user_id, resource_policy, user UUID
 *   2. user query     -> get user profile (role, groups, etc.)
 *   3. group.list()   -> get all groups for domain filtering
 *
 * Additionally, `scalingGroup.list_available()` and `resourcePreset.check()`
 * are called after login to populate resource presets and scaling groups.
 */
import type { MockRole } from '../login-responses';

const MOCK_USER_UUID = 'mock-user-uuid-0001';
const MOCK_GROUP_ID = 'mock-group-id-0001';

export function getKeypairResponse() {
  return {
    data: {
      keypair: {
        user_id: 'user@lablup.com',
        resource_policy: 'default',
        user: MOCK_USER_UUID,
      },
    },
  };
}

export function getUserResponse(role: MockRole = 'user') {
  return {
    data: {
      user: {
        username: role === 'superadmin' ? 'admin' : 'user',
        email: role === 'superadmin' ? 'admin@lablup.com' : 'user@lablup.com',
        full_name: role === 'superadmin' ? 'Mock Admin' : 'Mock User',
        is_active: true,
        role,
        domain_name: 'default',
        groups: [{ name: 'default', id: MOCK_GROUP_ID }],
        need_password_change: false,
        uuid: MOCK_USER_UUID,
      },
    },
  };
}

export function getGroupListResponse() {
  return {
    data: {
      groups: [
        {
          id: MOCK_GROUP_ID,
          name: 'default',
          description: 'Default group',
          is_active: true,
        },
      ],
    },
  };
}

/**
 * Response for ScalingGroup.list_available() - GraphQL query for scaling_groups.
 * This is called during post-login initialization.
 */
export function getScalingGroupResponse() {
  return {
    data: {
      scaling_groups: [
        {
          name: 'default',
          description: 'Default scaling group',
          is_active: true,
          created_at: '2024-01-01T00:00:00+00:00',
          driver: 'static',
          driver_opts: '{}',
          scheduler: 'fifo',
          scheduler_opts: '{}',
          wsproxy_addr: '',
          is_public: true,
        },
      ],
    },
  };
}

/**
 * Response for user_resource_policy query.
 * This is called during post-login initialization for user resource limits.
 */
export function getUserResourcePolicyResponse() {
  return {
    data: {
      user_resource_policy: {
        max_vfolder_count: 10,
        max_quota_scope_size: -1,
        max_concurrent_sessions: 5,
        max_pending_session_count: 2,
        max_concurrent_sftp_sessions: 3,
        max_pending_session_resource_slots: '{}',
      },
      keypair_resource_policies: [
        {
          name: 'default',
          max_session_lifetime: 0,
          max_concurrent_sessions: 5,
        },
      ],
    },
  };
}

/**
 * Response for VFolder host info queries.
 */
export function getVFolderHostsResponse() {
  return {
    data: {
      allowed_vfolder_hosts: {
        default: ['local:volume1'],
      },
    },
  };
}
