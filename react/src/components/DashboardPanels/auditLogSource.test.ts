/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  CLUSTER_AUDIT_SCOPE,
  isClusterAuditScope,
} from './cards/AuditLogPanel';
import { resourceRegistry } from './resourceRegistry';

describe('audit log source variables', () => {
  const base = {
    limit: 10,
    offset: 0,
    domainId: 'd-1',
    domainName: 'default',
    ownerId: null,
    projectId: null,
  };
  const build = resourceRegistry.auditLog.buildVariables;

  it('reads the scope the page resolved, as given', () => {
    const auditScope = { triggeredUser: [{ value: 'u-1' }] };
    expect(build({ ...base, ownerId: 'u-1', auditScope }).scope).toBe(
      auditScope,
    );
  });

  it('refuses to build a read without a resolved scope', () => {
    expect(() => build({ ...base, projectId: 'p-1' })).toThrow();
    expect(() => build({ ...base, auditScope: null })).toThrow();
  });

  it('passes a V2 filter through and orders newest first by default', () => {
    const filter = { status: { notIn: ['SUCCESS'] } };
    const variables = build({
      ...base,
      filter,
      auditScope: CLUSTER_AUDIT_SCOPE,
    });
    expect(variables.filter).toBe(filter);
    expect(variables.orderBy).toEqual([
      { field: 'CREATED_AT', direction: 'DESC' },
    ]);
  });
});

describe('isClusterAuditScope', () => {
  it('marks only the empty scope as the cluster read', () => {
    expect(isClusterAuditScope(CLUSTER_AUDIT_SCOPE)).toBe(true);
    expect(isClusterAuditScope({ entity: [], triggeredUser: [] })).toBe(true);
    expect(isClusterAuditScope({ triggeredUser: [{ value: 'u-1' }] })).toBe(
      false,
    );
    expect(
      isClusterAuditScope({
        entity: [{ entityType: 'project', entityId: 'p-1' }],
      }),
    ).toBe(false);
    expect(isClusterAuditScope(null)).toBe(false);
  });
});
