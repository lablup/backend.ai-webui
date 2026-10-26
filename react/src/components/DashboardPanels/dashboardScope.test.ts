/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  isProjectPinned,
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
  adminProjectIds: ['p-url', 'p-a', 'p-b'],
  vars: { project: 'all', rg: 'all' },
  currentDomain: DOMAIN,
  ...overrides,
});

describe('resolveDashboardScope', () => {
  describe('member page', () => {
    it('reads the header project for "all" resource groups', () => {
      expect(resolveDashboardScope(input({}))).toEqual({
        kind: 'mine',
        projectId: 'p-url',
        rgs: 'all',
      });
    });

    it('keeps one or many selected resource groups', () => {
      expect(
        resolveDashboardScope(input({ vars: { project: 'all', rg: ['a'] } })),
      ).toEqual({ kind: 'mine', projectId: 'p-url', rgs: ['a'] });
      expect(
        resolveDashboardScope(
          input({ vars: { project: 'all', rg: ['a', 'b', 'a'] } }),
        ),
      ).toEqual({ kind: 'mine', projectId: 'p-url', rgs: ['a', 'b'] });
    });

    it('ignores project vars and pins', () => {
      expect(
        resolveDashboardScope(
          input({
            vars: { project: ['p-a'], rg: 'all' },
            pinned: { project: ['p-b'] },
          }),
        ),
      ).toEqual({ kind: 'mine', projectId: 'p-url', rgs: 'all' });
    });
  });

  describe('project admin page', () => {
    const page = 'projectAdmin' as const;

    it('starts an unpinned board on the URL project', () => {
      expect(resolveDashboardScope(input({ page }))).toEqual({
        kind: 'projects',
        projectIds: ['p-url'],
        rgs: 'all',
        domain: DOMAIN,
      });
    });

    it('takes one or many chosen projects it administers', () => {
      expect(
        resolveDashboardScope(
          input({ page, vars: { project: ['p-a'], rg: ['x'] } }),
        ),
      ).toMatchObject({ projectIds: ['p-a'], rgs: ['x'] });
      expect(
        resolveDashboardScope(
          input({ page, vars: { project: ['p-a', 'p-b'], rg: 'all' } }),
        ),
      ).toMatchObject({ projectIds: ['p-a', 'p-b'] });
    });

    it('drops projects the viewer does not administer', () => {
      expect(
        resolveDashboardScope(
          input({ page, vars: { project: ['p-a', 'other'], rg: 'all' } }),
        ),
      ).toMatchObject({ projectIds: ['p-a'] });
      expect(
        resolveDashboardScope(
          input({ page, vars: { project: ['other'], rg: 'all' } }),
        ),
      ).toMatchObject({ projectIds: ['p-url'] });
    });

    it('lets the pins win over the chosen projects', () => {
      expect(
        resolveDashboardScope(
          input({
            page,
            vars: { project: ['p-a'], rg: 'all' },
            pinned: { project: ['p-b', 'p-url'] },
          }),
        ),
      ).toMatchObject({ projectIds: ['p-b', 'p-url'] });
    });
  });

  describe('superadmin page', () => {
    const page = 'admin' as const;

    it('reads every project of the current domain for "all"', () => {
      expect(resolveDashboardScope(input({ page }))).toEqual({
        kind: 'projects',
        projectIds: 'all',
        rgs: 'all',
        domain: DOMAIN,
      });
    });

    it('takes one or many chosen projects without an admin check', () => {
      expect(
        resolveDashboardScope(
          input({
            page,
            adminProjectIds: [],
            vars: { project: ['x'], rg: 'all' },
          }),
        ),
      ).toMatchObject({ projectIds: ['x'] });
      expect(
        resolveDashboardScope(
          input({ page, vars: { project: ['x', 'y'], rg: ['a', 'b'] } }),
        ),
      ).toMatchObject({ projectIds: ['x', 'y'], rgs: ['a', 'b'] });
    });

    it('treats an empty list as "all"', () => {
      expect(
        resolveDashboardScope(input({ page, vars: { project: [], rg: [] } })),
      ).toMatchObject({ projectIds: 'all', rgs: 'all' });
    });

    it('lets the pins win over "all" and over chosen projects', () => {
      expect(
        resolveDashboardScope(input({ page, pinned: { project: ['p-b'] } })),
      ).toMatchObject({ projectIds: ['p-b'] });
      expect(
        resolveDashboardScope(
          input({
            page,
            vars: { project: ['x'], rg: 'all' },
            pinned: { project: ['p-b'] },
          }),
        ),
      ).toMatchObject({ projectIds: ['p-b'] });
    });

    it('ignores an empty pin list', () => {
      expect(
        resolveDashboardScope(input({ page, pinned: { project: [] } })),
      ).toMatchObject({ projectIds: 'all' });
    });
  });
});

describe('isProjectPinned', () => {
  it('locks the picker only on admin pages with pins', () => {
    expect(isProjectPinned('admin', { project: ['a'] })).toBe(true);
    expect(isProjectPinned('projectAdmin', { project: ['a'] })).toBe(true);
    expect(isProjectPinned('project', { project: ['a'] })).toBe(false);
    expect(isProjectPinned('admin', { project: [] })).toBe(false);
    expect(isProjectPinned('admin', undefined)).toBe(false);
  });
});

describe('resourceGroupRows', () => {
  it('uses the header resource group for "all"', () => {
    expect(resourceGroupRows('all', 'default')).toEqual(['default']);
    expect(resourceGroupRows('all', null)).toEqual([]);
  });

  it('returns one row per selected resource group', () => {
    expect(resourceGroupRows(['a', 'b'], 'default')).toEqual(['a', 'b']);
  });
});
