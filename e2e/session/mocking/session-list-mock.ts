/**
 * Mock response for ComputeSessionListPageQuery.
 *
 * Returns a single RUNNING interactive session with all fields that the Relay
 * operation selects (including fragment spreads resolved to their leaf fields).
 */

const MOCK_SESSION_UUID = 'mock-session-uuid-001';
const MOCK_SESSION_GLOBAL_ID = btoa(`ComputeSessionNode:${MOCK_SESSION_UUID}`);
const MOCK_KERNEL_UUID = 'mock-kernel-uuid-001';
const MOCK_KERNEL_GLOBAL_ID = btoa(`KernelNode:${MOCK_KERNEL_UUID}`);
const MOCK_IMAGE_GLOBAL_ID = btoa('ImageNode:mock-image-001');
const MOCK_USER_GLOBAL_ID = btoa('UserNode:mock-user-001');

function createMockSessionNode() {
  return {
    __typename: 'ComputeSessionNode',
    id: MOCK_SESSION_GLOBAL_ID,
    row_id: MOCK_SESSION_UUID,
    name: 'mock-session-for-scheduling-history',
    status: 'RUNNING',
    type: 'interactive',
    agent_ids: ['mock-agent-001'],
    status_info: null,
    status_data: '{}',
    queue_position: null,
    created_at: '2025-06-01T10:00:00+00:00',
    starts_at: null,
    terminated_at: null,
    occupied_slots: '{"cpu": 1, "mem": 1073741824}',
    requested_slots: '{"cpu": 1, "mem": 1073741824}',
    project_id: 'mock-project-id-001',
    user_id: 'mock-user-id-001',
    owner: {
      __typename: 'UserNode',
      email: 'admin@lablup.com',
      id: MOCK_USER_GLOBAL_ID,
    },
    resource_opts: '{}',
    vfolder_mounts: '[]',
    vfolder_nodes: {
      __typename: 'VirtualFolderConnection',
      edges: [],
      count: 0,
    },
    scaling_group: 'default',
    idle_checks: null,
    startup_command: null,
    access_key: 'MOCK_ACCESS_KEY',
    service_ports: '[]',
    commit_status: null,
    priority: 0,
    cluster_mode: 'SINGLE_NODE',
    cluster_size: 1,
    kernel_nodes: {
      __typename: 'KernelConnection',
      edges: [
        {
          __typename: 'KernelEdge',
          node: {
            __typename: 'KernelNode',
            id: MOCK_KERNEL_GLOBAL_ID,
            row_id: MOCK_KERNEL_UUID,
            live_stat: null,
            cluster_role: 'main',
            cluster_hostname: 'main',
            cluster_idx: 0,
            status: 'RUNNING',
            status_info: null,
            agent_id: 'mock-agent-001',
            container_id: 'mock-container-001',
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
  };
}

export function sessionListMockResponse() {
  const sessionNode = createMockSessionNode();

  return {
    computeSessionNodeResult: {
      __typename: 'ComputeSessionConnection',
      edges: [
        {
          __typename: 'ComputeSessionEdge',
          node: sessionNode,
        },
      ],
      count: 1,
    },
    all: { __typename: 'ComputeSessionConnection', count: 1 },
    interactive: { __typename: 'ComputeSessionConnection', count: 1 },
    inference: { __typename: 'ComputeSessionConnection', count: 0 },
    batch: { __typename: 'ComputeSessionConnection', count: 0 },
    system: { __typename: 'ComputeSessionConnection', count: 0 },
  };
}
