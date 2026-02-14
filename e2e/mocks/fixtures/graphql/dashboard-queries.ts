/**
 * Mock GraphQL responses for the DashboardPage Relay query.
 *
 * DashboardPageQuery includes:
 * - SessionCountDashboardItemFragment (session counts by type)
 * - RecentlyCreatedSessionFragment (recent running sessions)
 * - TotalResourceWithinResourceGroupFragment (agent resources)
 * - AgentStatsFragment (superadmin only, @since 25.15.0)
 *
 * For user role: session counts + empty recent sessions + agent_summary_list
 * For superadmin: above + agent_nodes + agentStats
 */
import type { MockRole } from '../login-responses';

export function getDashboardQueryResponse(role: MockRole = 'user') {
  const isSuperAdmin = role === 'superadmin';

  const base = {
    myInteractive: { count: 2 },
    myBatch: { count: 1 },
    myInference: { count: 0 },
    myUpload: { count: 0 },
    // RecentlyCreatedSessionFragment - empty session list
    compute_session_nodes: {
      edges: [],
    },
  };

  if (isSuperAdmin) {
    return {
      data: {
        ...base,
        // TotalResourceWithinResourceGroupFragment for superadmin uses agent_nodes
        agent_nodes: {
          edges: [
            {
              node: {
                id: 'QWdlbnROb2RlOm1vY2stYWdlbnQtMQ==',
                status: 'ALIVE',
                available_slots: JSON.stringify({
                  cpu: 8,
                  mem: 34359738368,
                  'cuda.device': 2,
                  'cuda.shares': 4,
                }),
                occupied_slots: JSON.stringify({
                  cpu: 2,
                  mem: 8589934592,
                  'cuda.device': 1,
                  'cuda.shares': 1,
                }),
                scaling_group: 'default',
              },
            },
          ],
          count: 1,
        },
        // AgentStatsFragment (@since 25.15.0)
        agentStats: {
          totalResource: {
            free: JSON.stringify({
              cpu: 6,
              mem: 25769803776,
              'cuda.device': 1,
              'cuda.shares': 3,
            }),
            used: JSON.stringify({
              cpu: 2,
              mem: 8589934592,
              'cuda.device': 1,
              'cuda.shares': 1,
            }),
            capacity: JSON.stringify({
              cpu: 8,
              mem: 34359738368,
              'cuda.device': 2,
              'cuda.shares': 4,
            }),
          },
        },
      },
    };
  }

  // User role: uses agent_summary_list (non-superadmin path)
  return {
    data: {
      ...base,
      agent_summary_list: {
        items: [
          {
            id: 'mock-agent-1',
            status: 'ALIVE',
            available_slots: JSON.stringify({
              cpu: 8,
              mem: 34359738368,
              'cuda.device': 2,
              'cuda.shares': 4,
            }),
            occupied_slots: JSON.stringify({
              cpu: 2,
              mem: 8589934592,
              'cuda.device': 1,
              'cuda.shares': 1,
            }),
            scaling_group: 'default',
          },
        ],
        total_count: 1,
      },
    },
  };
}

/**
 * Response for keypair resource usage query used by MyResource component.
 * This is fetched via the legacy client (not Relay).
 */
export function getKeypairResourcePolicyResponse() {
  return {
    data: {
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
