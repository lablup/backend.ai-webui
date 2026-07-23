/**
 * Mock responses for session detail queries.
 *
 * SessionDetailContentLegacyQuery — returns the legacy compute_session with group_id.
 * SessionDetailContentQuery — returns the full ComputeSessionNode via compute_session_node.
 */

const MOCK_SESSION_UUID = 'mock-session-uuid-001';
const MOCK_SESSION_GLOBAL_ID = btoa(`ComputeSessionNode:${MOCK_SESSION_UUID}`);
const MOCK_KERNEL_UUID = 'mock-kernel-uuid-001';
const MOCK_KERNEL_GLOBAL_ID = btoa(`KernelNode:${MOCK_KERNEL_UUID}`);
const MOCK_IMAGE_GLOBAL_ID = btoa('ImageNode:mock-image-001');
const MOCK_USER_GLOBAL_ID = btoa('UserNode:mock-user-001');

export function sessionDetailLegacyMockResponse(
  _variables: Record<string, any>,
) {
  return {
    legacy_session: {
      __typename: 'ComputeSession',
      group_id: 'mock-project-id-001',
      id: MOCK_SESSION_UUID,
    },
  };
}

export function sessionDetailMockResponse(_variables: Record<string, any>) {
  return {
    internalLoadedSession: {
      __typename: 'ComputeSessionNode',
      id: MOCK_SESSION_GLOBAL_ID,
      row_id: MOCK_SESSION_UUID,
      name: 'mock-session-for-scheduling-history',
      project_id: 'mock-project-id-001',
      user_id: 'mock-user-id-001',
      owner: {
        __typename: 'UserNode',
        email: 'admin@lablup.com',
        id: MOCK_USER_GLOBAL_ID,
      },
      resource_opts: '{}',
      status: 'RUNNING',
      status_info: null,
      status_data: '{}',
      vfolder_mounts: '[]',
      vfolder_nodes: {
        __typename: 'VirtualFolderConnection',
        edges: [],
        count: 0,
      },
      created_at: '2025-06-01T10:00:00+00:00',
      terminated_at: null,
      scaling_group: 'default',
      agent_ids: ['mock-agent-001'],
      requested_slots: '{"cpu": 1, "mem": 1073741824}',
      idle_checks: null,
      type: 'interactive',
      startup_command: null,
      kernel_nodes: {
        __typename: 'KernelConnection',
        edges: [
          {
            __typename: 'KernelEdge',
            node: {
              __typename: 'KernelNode',
              id: MOCK_KERNEL_GLOBAL_ID,
              row_id: MOCK_KERNEL_UUID,
              cluster_hostname: 'main',
              cluster_idx: 0,
              cluster_role: 'main',
              status: 'RUNNING',
              status_info: null,
              agent_id: 'mock-agent-001',
              container_id: 'mock-container-001',
              live_stat: null,
              image: {
                __typename: 'ImageNode',
                id: MOCK_IMAGE_GLOBAL_ID,
                base_image_name: 'python',
                version: '3.11',
                architecture: 'x86_64',
                name: 'cr.backend.ai/stable/python',
                tags: [
                  {
                    __typename: 'KVPair',
                    key: 'runtime',
                    value: 'python',
                  },
                ],
                labels: [
                  {
                    __typename: 'KVPair',
                    key: 'ai.backend.runtime-type',
                    value: 'python',
                  },
                ],
                registry: 'cr.backend.ai',
                namespace: 'stable',
                tag: '3.11-ubuntu22.04',
              },
            },
          },
        ],
      },
      queue_position: null,
      access_key: 'MOCK_ACCESS_KEY',
      service_ports: '[]',
      commit_status: null,
      priority: 0,
      starts_at: null,
      occupied_slots: '{"cpu": 1, "mem": 1073741824}',
      cluster_mode: 'SINGLE_NODE',
      cluster_size: 1,
    },
  };
}
