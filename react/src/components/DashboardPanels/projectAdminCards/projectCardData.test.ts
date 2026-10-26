/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  adminProjectId,
  legacySessionIdFilter,
  pendingReason,
  projectAuditScope,
} from './projectCardData';

const DOMAIN = { id: 'd-1', name: 'default' };

describe('adminProjectId', () => {
  it('reads the project admin page project and nothing elsewhere', () => {
    expect(
      adminProjectId({ kind: 'projects', projectIds: ['p1'], domain: DOMAIN }),
    ).toBe('p1');
    expect(
      adminProjectId({ kind: 'projects', projectIds: [], domain: DOMAIN }),
    ).toBeNull();
    expect(
      adminProjectId({ kind: 'projects', projectIds: 'all', domain: DOMAIN }),
    ).toBeNull();
    expect(adminProjectId({ kind: 'mine', projectId: 'p1' })).toBeNull();
  });
});

describe('projectAuditScope', () => {
  it('scopes the audit log to the project entity', () => {
    expect(projectAuditScope('p1')).toEqual({
      entity: [{ entityType: 'project', entityId: 'p1' }],
    });
  });
});

describe('legacySessionIdFilter', () => {
  it('quotes every id in one `in` clause', () => {
    expect(legacySessionIdFilter(['a', 'b'])).toBe('id in ["a", "b"]');
  });
});

describe('pendingReason', () => {
  it('prefers the failed predicates, then the scheduler message, then status_info', () => {
    expect(
      pendingReason(
        'pending',
        JSON.stringify({
          scheduler: {
            msg: 'ignored',
            failed_predicates: [
              { name: 'reserved_time', msg: 'too early' },
              { name: 'concurrency' },
            ],
          },
        }),
      ),
    ).toBe('reserved_time: too early; concurrency');
    expect(
      pendingReason(null, JSON.stringify({ scheduler: { msg: 'No agent' } })),
    ).toBe('No agent');
    expect(pendingReason(' predicate-checks-failed ', null)).toBe(
      'predicate-checks-failed',
    );
  });

  it('returns null for nothing and survives malformed JSON', () => {
    expect(pendingReason(null, null)).toBeNull();
    expect(pendingReason('', '{not json')).toBeNull();
  });
});
