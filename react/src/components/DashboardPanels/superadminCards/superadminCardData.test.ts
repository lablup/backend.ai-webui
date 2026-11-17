/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SESSION_STATUSES } from '../sessionFilterProperties';
import { withinWindow } from '../timeRange';
import {
  AUDIT_ENTITY_TYPES,
  LAUNCH_OUTCOME_STATUSES,
  entityTypeFailureFilters,
  groupFailureCauses,
  normalizeFailureMessage,
  launchOutcomeFilter,
  queueWaitStats,
} from './superadminCardData';

describe('entityTypeFailureFilters', () => {
  const window = {
    after: '2026-10-26T00:00:00.000Z',
    before: '2026-10-27T00:00:00.000Z',
  };

  it('counts failures per listed entity type and every other type once', () => {
    const filters = entityTypeFailureFilters(window);
    expect(Object.keys(filters)).toHaveLength(AUDIT_ENTITY_TYPES.length + 1);
    expect(filters.resourceGroup.entityType).toEqual({
      equals: 'resource_group',
    });
    expect(filters.other.entityType).toEqual({
      notIn: [...AUDIT_ENTITY_TYPES],
    });
  });

  it('filters the window as two ANDed bounds and failures as ERROR or DENIED', () => {
    const { session } = entityTypeFailureFilters(window);
    expect(session.AND).toEqual(withinWindow('createdAt', window).AND);
    expect(session.status).toEqual({ in: ['ERROR', 'DENIED'] });
  });
});

describe('launchOutcomeFilter', () => {
  const window = {
    after: '2026-10-26T00:00:00.000Z',
    before: '2026-10-27T00:00:00.000Z',
  };

  it('narrows the window to the outcome statuses', () => {
    expect(launchOutcomeFilter(window, 'pending')).toBe(
      'created_at >= "2026-10-26T00:00:00.000Z" & created_at < "2026-10-27T00:00:00.000Z" & status in ["PENDING","PREEMPTED","RESCHEDULING","RESERVED"]',
    );
  });

  it('puts every legacy session status in exactly one outcome', () => {
    const all = Object.values(LAUNCH_OUTCOME_STATUSES).flat();
    expect(new Set(all).size).toBe(all.length);
    expect([...all].sort()).toEqual([...SESSION_STATUSES].sort());
  });
});

describe('queueWaitStats', () => {
  const at = (seconds: number) =>
    new Date(Date.UTC(2026, 9, 26, 0, 0, seconds)).toISOString();

  it('averages and takes the median of the scheduled sessions only', () => {
    expect(
      queueWaitStats([
        { created_at: at(0), scheduled_at: at(10) },
        { created_at: at(0), scheduled_at: at(20) },
        { created_at: at(0), scheduled_at: at(60) },
        { created_at: at(0), scheduled_at: at(70) },
        { created_at: at(0), scheduled_at: null },
      ]),
    ).toEqual({ sampled: 4, meanMs: 40_000, medianMs: 40_000 });
  });

  it('takes the middle wait of an odd sample', () => {
    expect(
      queueWaitStats([
        { created_at: at(0), scheduled_at: at(5) },
        { created_at: at(0), scheduled_at: at(1) },
        { created_at: at(0), scheduled_at: at(90) },
      ])?.medianMs,
    ).toBe(5_000);
  });

  it('is null when no session was scheduled', () => {
    expect(queueWaitStats([{ created_at: at(0), scheduled_at: null }])).toBe(
      null,
    );
  });
});

describe('groupFailureCauses', () => {
  it('masks ids so one cause about many entities groups as one', () => {
    expect(
      normalizeFailureMessage(
        'Session 3f2b8c1e-1a2b-4c3d-8e9f-0a1b2c3d4e5f not found  (port 30123)',
      ),
    ).toBe('Session <id> not found (port <n>)');
  });

  it('masks times, hex ids and decimals too', () => {
    expect(
      normalizeFailureMessage(
        'container 9f86d081884c7d65 failed at 2026-11-17T10:20:31Z asking 12.5 GiB',
      ),
    ).toBe('container <id> failed at <time> asking <n> GiB');
  });

  it('keeps a long plain number a number, not an id', () => {
    expect(normalizeFailureMessage('requested 10737418240 bytes')).toBe(
      'requested <n> bytes',
    );
  });

  it('groups by action and message, most frequent first, with shares', () => {
    const causes = groupFailureCauses([
      { actionName: 'create', description: 'quota exceeded' },
      { actionName: 'create', description: 'quota exceeded' },
      { actionName: 'create', description: 'image not found' },
      { actionName: 'delete', description: 'quota exceeded' },
    ]);
    expect(
      causes.map(({ actionName, message, count, percent }) => [
        actionName,
        message,
        count,
        percent,
      ]),
    ).toEqual([
      ['create', 'quota exceeded', 2, 50],
      ['create', 'image not found', 1, 25],
      ['delete', 'quota exceeded', 1, 25],
    ]);
  });
});
