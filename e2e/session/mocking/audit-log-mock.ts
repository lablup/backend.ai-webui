/**
 * Mock response for ScopedAuditLogQuery on the mocked session.
 *
 * Provides three audit log records whose `actionName` values have translations
 * in the BUI locale (create_from_params → "Create session", commit_session →
 * "Commit session", destroy_session → "Terminate session"). The handler applies
 * the `actionName.contains` filter the way the manager does, on the raw name.
 */
export function scopedAuditLogMockResponse(variables: Record<string, any>) {
  const baseDateMs = new Date('2025-06-01T10:00:00Z').getTime();

  const records = [
    {
      actionName: 'create_from_params',
      operation: 'create_from_params',
      status: 'SUCCESS',
      description: '',
      offsetMs: 0,
    },
    {
      actionName: 'commit_session',
      operation: 'commit_session',
      status: 'ERROR',
      description: 'Mock commit failure',
      offsetMs: 60_000,
    },
    {
      actionName: 'destroy_session',
      operation: 'destroy_session',
      status: 'SUCCESS',
      description: '',
      offsetMs: 120_000,
    },
  ].map((record, index) => ({
    __typename: 'AuditLogV2' as const,
    id: btoa(`AuditLogV2:mock-audit-log-00${index + 1}`),
    createdAt: new Date(baseDateMs + record.offsetMs).toISOString(),
    actionName: record.actionName,
    operation: record.operation,
    status: record.status,
    description: record.description,
    duration: '0:00:00.123456',
    requestId: `00000000-0000-4000-8000-00000000010${index + 1}`,
    actionId: `00000000-0000-4000-8000-00000000020${index + 1}`,
    entityType: 'session',
    targetEntityId: 'mock-session-uuid-001',
    triggeredBy: null,
    clientIp: '127.0.0.1',
    user: null,
  }));

  const contains: string | undefined = variables?.filter?.actionName?.contains;
  const filtered = contains
    ? records.filter((record) =>
        record.actionName.toLowerCase().includes(contains.toLowerCase()),
      )
    : records;

  return {
    scopedAuditLogsV2: {
      __typename: 'AuditLogV2Connection',
      count: filtered.length,
      edges: filtered.map((node) => ({
        __typename: 'AuditLogV2Edge',
        node,
      })),
    },
  };
}
