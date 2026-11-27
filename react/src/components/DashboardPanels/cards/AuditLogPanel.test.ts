/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { successFailureVariables } from '../countAliases';
import { windowRange } from '../timeRange';
import {
  auditColumnOrder,
  auditOutcomeFilter,
  hasLiveCounts,
} from './AuditLogPanel';
import { describe, expect, it } from 'vitest';

describe('audit log card', () => {
  it('puts the client IP after Triggered By, or after the action on My Activity', () => {
    expect(auditColumnOrder(false)).toEqual([
      'createdAt',
      'actionName',
      'status',
      'description',
      'triggeredBy',
      'clientIp',
      'entityType',
    ]);
    const mine = auditColumnOrder(true);
    expect(mine).not.toContain('triggeredBy');
    expect(mine.indexOf('clientIp')).toBe(mine.indexOf('actionName') + 1);
  });

  it('has no live count to send for a past fixed range, and some for a relative one', () => {
    const NOW = Date.UTC(2026, 9, 26, 12, 7, 0);
    const past = successFailureVariables(
      auditOutcomeFilter,
      windowRange({
        after: '2026-10-20T00:00:00.000Z',
        before: '2026-10-21T00:00:00.000Z',
      }),
      NOW,
    );
    expect(hasLiveCounts(past.live)).toBe(false);
    expect(
      hasLiveCounts(
        successFailureVariables(auditOutcomeFilter, 'now-24h', NOW).live,
      ),
    ).toBe(true);
  });
});
