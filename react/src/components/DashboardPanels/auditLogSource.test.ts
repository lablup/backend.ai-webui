/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
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

  it("reads the viewer's own actions on the member page", () => {
    expect(build({ ...base, ownerId: 'u-1', projectId: 'p-1' }).scope).toEqual({
      triggeredUser: [{ value: 'u-1' }],
    });
  });

  it('reads the project and the entities in it on the project admin page', () => {
    expect(build({ ...base, projectId: 'p-1' }).scope).toEqual({
      entity: [{ entityType: 'project', entityId: 'p-1' }],
    });
  });

  it('uses the resolved domain scope on the superadmin page', () => {
    const auditScope = { entity: [{ entityType: 'domain', entityId: 'd-1' }] };
    expect(build({ ...base, auditScope }).scope).toBe(auditScope);
  });

  it('passes a V2 filter through and orders newest first by default', () => {
    const filter = { status: { notIn: ['SUCCESS'] } };
    const variables = build({ ...base, filter, auditScope: null });
    expect(variables.filter).toBe(filter);
    expect(variables.orderBy).toEqual([
      { field: 'CREATED_AT', direction: 'DESC' },
    ]);
  });
});
