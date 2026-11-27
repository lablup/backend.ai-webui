/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  cardScopeKind,
  domainOf,
  legacyScopeId,
  resolveCardScope,
} from './cardScope';
import type { DashboardScope } from './types';

const domain = { id: 'domain-uuid', name: 'default' };

describe('resolveCardScope', () => {
  it('reads the member page as the viewer in the page project', () => {
    const scope: DashboardScope = { kind: 'mine', projectId: 'p1' };
    expect(resolveCardScope(scope)).toEqual({ kind: 'mine', projectId: 'p1' });
    expect(cardScopeKind(scope)).toBe('mine');
  });

  it('reads the project admin page as its one project', () => {
    const scope: DashboardScope = {
      kind: 'projects',
      projectIds: ['p1'],
      domain,
    };
    expect(resolveCardScope(scope)).toEqual({
      kind: 'project',
      projectId: 'p1',
    });
    expect(cardScopeKind(scope)).toBe('project');
    expect(domainOf(scope)).toBeNull();
  });

  it('reads the superadmin page as the current domain', () => {
    const scope: DashboardScope = {
      kind: 'projects',
      projectIds: 'all',
      domain,
    };
    expect(resolveCardScope(scope)).toEqual({
      kind: 'domain',
      domainId: 'domain-uuid',
      domainName: 'default',
    });
    expect(cardScopeKind(scope)).toBe('domain');
  });

  it('is null while the page has no project', () => {
    expect(resolveCardScope({ kind: 'mine', projectId: null })).toBeNull();
    expect(
      resolveCardScope({ kind: 'projects', projectIds: [], domain }),
    ).toBeNull();
  });
});

describe('legacyScopeId', () => {
  it('names the project or the domain as the graphene fields expect', () => {
    expect(legacyScopeId({ kind: 'project', projectId: 'p1' })).toBe(
      'project:p1',
    );
    expect(
      legacyScopeId({ kind: 'domain', domainId: 'd', domainName: 'default' }),
    ).toBe('domain:default');
  });
});
