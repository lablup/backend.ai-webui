/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  resolveDashboardScope,
  resourceGroupRows,
  type ResolveDashboardScopeInput,
} from './dashboardScope';

const DOMAIN = { id: 'domain-uuid', name: 'default' };

const input = (
  overrides: Partial<ResolveDashboardScopeInput>,
): ResolveDashboardScopeInput => ({
  page: 'project',
  urlProjectId: 'p-url',
  currentDomain: DOMAIN,
  ...overrides,
});

describe('resolveDashboardScope', () => {
  it('reads the viewer own data in the page project on the member page', () => {
    expect(resolveDashboardScope(input({}))).toEqual({
      kind: 'mine',
      projectId: 'p-url',
    });
    expect(resolveDashboardScope(input({ urlProjectId: null }))).toEqual({
      kind: 'mine',
      projectId: null,
    });
  });

  it('reads the URL project on the project admin page', () => {
    expect(resolveDashboardScope(input({ page: 'projectAdmin' }))).toEqual({
      kind: 'projects',
      projectIds: ['p-url'],
      domain: DOMAIN,
    });
  });

  it('reads every project of the current domain on the superadmin page', () => {
    expect(
      resolveDashboardScope(input({ page: 'admin', urlProjectId: null })),
    ).toEqual({ kind: 'projects', projectIds: 'all', domain: DOMAIN });
  });
});

describe('resourceGroupRows', () => {
  it('uses the card setting, one row per group', () => {
    expect(resourceGroupRows(['a', 'b', 'a'], 'current')).toEqual(['a', 'b']);
  });

  it('falls back to the header resource group', () => {
    expect(resourceGroupRows(undefined, 'current')).toEqual(['current']);
    expect(resourceGroupRows([], 'current')).toEqual(['current']);
    expect(resourceGroupRows(undefined, null)).toEqual([]);
  });
});
