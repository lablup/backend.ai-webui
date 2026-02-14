/**
 * Mock responses for Backend.AI server info endpoints.
 *
 * These fixtures simulate version and resource configuration endpoints:
 * GET /func/  (root)           -> server version info (via newPublicRequest)
 * GET /func/config/resource-slots -> available resource slot types
 * GET /func/totp               -> TOTP support check
 */
import type { MockRole } from './login-responses';

/**
 * Server version response for GET /.
 * The manager version controls feature flags via `isManagerVersionCompatibleWith()`.
 *
 * - 24.12.0: Supports agent_nodes, idle_checks, image node fields
 * - 25.15.0+: Supports agent-stats (AgentStatsFragment @since 25.15.0)
 *
 * For 'user' role we use 24.12.0 (no agent-stats panel).
 * For 'superadmin' role we use 25.15.0 (agent-stats panel visible).
 */
export function getServerVersionResponse(role: MockRole = 'user') {
  const managerVersion = role === 'superadmin' ? '25.15.0' : '24.12.0';
  return {
    manager: managerVersion,
    version: 'v8.20250101',
    status: 'running',
  };
}

/**
 * Resource slots configuration.
 * Defines available accelerator types for the cluster.
 */
export const resourceSlotsResponse = {
  cpu: 'count',
  mem: 'bytes',
  'cuda.device': 'count',
  'cuda.shares': 'count',
};
