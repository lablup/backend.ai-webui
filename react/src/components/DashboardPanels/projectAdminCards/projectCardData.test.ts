/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { adminProjectId, projectAuditScope } from './projectCardData';

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
