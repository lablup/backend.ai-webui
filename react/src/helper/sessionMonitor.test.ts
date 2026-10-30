import {
  buildSessionMonitorDefaultCondition,
  getNearestIdleCheck,
  pickDueAlerts,
  rankSessions,
  readAlertedRecords,
  summarizeSessions,
  sumOccupiedSlots,
  toSessionMonitorEntry,
  type SessionMonitorEntry,
} from './sessionMonitor';
import { describe, expect, it } from 'vitest';

const NOW = 1_700_000_000_000;

const entry = (
  overrides: Partial<SessionMonitorEntry> & { id: string },
): SessionMonitorEntry => ({
  name: overrides.id,
  userId: null,
  status: 'RUNNING',
  createdAt: '2026-01-01T00:00:00Z',
  nearest: null,
  deadline: null,
  ...overrides,
});

describe('getNearestIdleCheck', () => {
  it('picks the check with the least remaining seconds', () => {
    expect(
      getNearestIdleCheck({
        session_lifetime: {
          remaining: 7200,
          remaining_time_type: 'expire_after',
          extra: null,
        },
        utilization: {
          remaining: 540,
          remaining_time_type: 'expire_after',
          extra: null,
        },
      }),
    ).toEqual({
      key: 'utilization',
      remaining: 540,
      remainingTimeType: 'expire_after',
    });
  });

  it('does not treat a grace period as a deadline', () => {
    expect(
      getNearestIdleCheck({
        utilization: {
          remaining: 540,
          remaining_time_type: 'grace_period',
          extra: null,
        },
      }),
    ).toBeNull();
  });

  it('ignores checks without a remaining time', () => {
    expect(
      getNearestIdleCheck({
        session_lifetime: {
          remaining: null,
          remaining_time_type: 'expire_after',
          extra: null,
        },
      }),
    ).toBeNull();
    expect(getNearestIdleCheck(undefined)).toBeNull();
  });
});

describe('toSessionMonitorEntry', () => {
  it('anchors the deadline to the fetch time', () => {
    const result = toSessionMonitorEntry(
      { id: 's1', name: 'train', status: 'RUNNING', user_id: 'u1' },
      {
        utilization: {
          remaining: 60,
          remaining_time_type: 'expire_after',
          extra: null,
        },
      },
      NOW,
    );
    expect(result.deadline).toBe(NOW + 60_000);
    expect(result.nearest?.key).toBe('utilization');
    expect(result.userId).toBe('u1');
  });
});

describe('rankSessions', () => {
  it('orders by soonest deadline, then newest session', () => {
    const ranked = rankSessions([
      entry({ id: 'old', createdAt: '2026-01-01T00:00:00Z' }),
      entry({ id: 'later', deadline: NOW + 5000 }),
      entry({ id: 'new', createdAt: '2026-02-01T00:00:00Z' }),
      entry({ id: 'soon', deadline: NOW + 1000 }),
    ]);
    expect(ranked.map((e) => e.id)).toEqual(['soon', 'later', 'new', 'old']);
  });
});

describe('summarizeSessions', () => {
  it('finds the nearest deadline and the sessions needing attention', () => {
    const summary = summarizeSessions(
      [
        entry({ id: 'a', deadline: NOW + 5 * 60_000 }),
        entry({ id: 'b', deadline: NOW + 5 * 3600_000 }),
        entry({ id: 'c', status: 'PENDING' }),
      ],
      120,
      NOW,
    );
    expect(summary.total).toBe(120);
    expect(summary.attentionCount).toBe(1);
    expect(summary.nearest?.id).toBe('a');
    expect(summary.allocated).toBeNull();
    expect(summary.starting).toBeNull();
    expect(summary.errors).toBeNull();
  });

  it('carries the server-side counts the chip asked for', () => {
    const summary = summarizeSessions([], 7, NOW, null, {
      starting: 2,
      errors: 1,
    });
    expect(summary.starting).toBe(2);
    expect(summary.errors).toBe(1);
  });
});

describe('buildSessionMonitorDefaultCondition', () => {
  it('starts an admin from their own unfinished sessions', () => {
    expect(
      buildSessionMonitorDefaultCondition({
        userId: 'u1',
        isDomainAdmin: true,
      }),
    ).toBe('user_id == "u1" & status != "TERMINATED" & status != "CANCELLED"');
  });

  it('leaves the owner out where the user scope already holds it', () => {
    expect(
      buildSessionMonitorDefaultCondition({
        userId: 'u1',
        isDomainAdmin: false,
      }),
    ).toBe('status != "TERMINATED" & status != "CANCELLED"');
  });
});

describe('sumOccupiedSlots', () => {
  it('adds slots across sessions and skips unreadable ones', () => {
    expect(
      sumOccupiedSlots([
        '{"cpu": "4", "mem": "1073741824", "cuda.shares": "0.5"}',
        '{"cpu": 2, "cuda.shares": "1"}',
        'not json',
        null,
      ]),
    ).toEqual({ cpu: 6, mem: 1073741824, 'cuda.shares': 1.5 });
  });
});

describe('pickDueAlerts', () => {
  it('raises the tightest crossed threshold once and records every crossed one', () => {
    const entries = [entry({ id: 's1', deadline: NOW + 5 * 60_000 })];
    const first = pickDueAlerts(entries, {}, NOW);
    expect(first.due).toEqual([{ entry: entries[0], thresholdSec: 600 }]);
    expect(Object.keys(first.alerted).sort()).toEqual(['s1:1800', 's1:600']);

    const second = pickDueAlerts(entries, first.alerted, NOW + 1000);
    expect(second.due).toEqual([]);
  });

  it('raises the looser threshold first, then the tighter one later', () => {
    const far = [entry({ id: 's1', deadline: NOW + 20 * 60_000 })];
    const first = pickDueAlerts(far, {}, NOW);
    expect(first.due.map((d) => d.thresholdSec)).toEqual([1800]);

    const near = [entry({ id: 's1', deadline: NOW + 20 * 60_000 })];
    const later = pickDueAlerts(near, first.alerted, NOW + 12 * 60_000);
    expect(later.due.map((d) => d.thresholdSec)).toEqual([600]);
  });

  it('skips sessions that are not running or have no deadline', () => {
    const result = pickDueAlerts(
      [
        entry({ id: 'pending', status: 'PENDING', deadline: NOW + 1000 }),
        entry({ id: 'free' }),
      ],
      {},
      NOW,
    );
    expect(result.due).toEqual([]);
  });
});

describe('readAlertedRecords', () => {
  it('drops records older than a day and tolerates bad storage', () => {
    const storage = {
      getItem: () =>
        JSON.stringify({
          fresh: NOW - 1000,
          stale: NOW - 2 * 24 * 3600_000,
          bogus: 'x',
        }),
    };
    expect(readAlertedRecords(storage, NOW)).toEqual({ fresh: NOW - 1000 });
    expect(readAlertedRecords({ getItem: () => '{not json' }, NOW)).toEqual({});
    expect(readAlertedRecords(undefined, NOW)).toEqual({});
  });
});
