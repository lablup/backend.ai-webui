/**
 * Mock response for SessionSchedulingHistoryModalQuery.
 *
 * Provides five scheduling history records covering the lifecycle:
 *   enqueue → schedule-sessions → check → promote → start
 *
 * The "schedule-sessions" record includes sub-steps so that expand/collapse tests work.
 * The "enqueue" record has an empty subSteps array (no expand icon).
 */
export function schedulingHistoryMockResponse() {
  const baseDateMs = new Date('2025-06-01T10:00:00Z').getTime();

  const records = [
    {
      __typename: 'SessionSchedulingHistory' as const,
      id: btoa('SessionSchedulingHistory:mock-history-001'),
      sessionId: 'mock-session-uuid-001',
      phase: 'enqueue',
      result: 'SUCCESS',
      fromStatus: null,
      toStatus: 'PENDING',
      attempts: 1,
      message: null,
      subSteps: [],
      createdAt: new Date(baseDateMs).toISOString(),
      updatedAt: new Date(baseDateMs + 1000).toISOString(),
    },
    {
      __typename: 'SessionSchedulingHistory' as const,
      id: btoa('SessionSchedulingHistory:mock-history-002'),
      sessionId: 'mock-session-uuid-001',
      phase: 'schedule-sessions',
      result: 'SUCCESS',
      fromStatus: 'PENDING',
      toStatus: 'SCHEDULED',
      attempts: 1,
      message: null,
      subSteps: [
        {
          __typename: 'SubStepResultGQL' as const,
          step: 'FIFOSequencer',
          result: 'SUCCESS',
          errorCode: null,
          message: null,
          startedAt: new Date(baseDateMs + 60_000).toISOString(),
          endedAt: new Date(baseDateMs + 61_000).toISOString(),
        },
      ],
      createdAt: new Date(baseDateMs + 60_000).toISOString(),
      updatedAt: new Date(baseDateMs + 62_000).toISOString(),
    },
    {
      __typename: 'SessionSchedulingHistory' as const,
      id: btoa('SessionSchedulingHistory:mock-history-003'),
      sessionId: 'mock-session-uuid-001',
      phase: 'check',
      result: 'SUCCESS',
      fromStatus: 'SCHEDULED',
      toStatus: 'PREPARING',
      attempts: 1,
      message: null,
      subSteps: [],
      createdAt: new Date(baseDateMs + 120_000).toISOString(),
      updatedAt: new Date(baseDateMs + 121_000).toISOString(),
    },
    {
      __typename: 'SessionSchedulingHistory' as const,
      id: btoa('SessionSchedulingHistory:mock-history-004'),
      sessionId: 'mock-session-uuid-001',
      phase: 'promote',
      result: 'SUCCESS',
      fromStatus: 'PREPARING',
      toStatus: 'RUNNING',
      attempts: 1,
      message: null,
      subSteps: [],
      createdAt: new Date(baseDateMs + 180_000).toISOString(),
      updatedAt: new Date(baseDateMs + 181_000).toISOString(),
    },
    {
      __typename: 'SessionSchedulingHistory' as const,
      id: btoa('SessionSchedulingHistory:mock-history-005'),
      sessionId: 'mock-session-uuid-001',
      phase: 'start',
      result: 'SUCCESS',
      fromStatus: 'RUNNING',
      toStatus: 'RUNNING',
      attempts: 1,
      message: null,
      subSteps: [],
      createdAt: new Date(baseDateMs + 240_000).toISOString(),
      updatedAt: new Date(baseDateMs + 241_000).toISOString(),
    },
  ];

  return {
    sessionScopedSchedulingHistories: {
      __typename: 'SessionSchedulingHistoryConnection',
      edges: records.map((node, idx) => ({
        __typename: 'SessionSchedulingHistoryEdge',
        cursor: btoa(`cursor:${idx}`),
        node,
      })),
      pageInfo: {
        __typename: 'PageInfo',
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      count: records.length,
    },
  };
}
