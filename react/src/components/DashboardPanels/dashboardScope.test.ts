/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  resolveDashboardScope,
  cardResourceGroup,
  defaultResourceGroupOf,
  resourceGroupScopeOf,
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

describe('cardResourceGroup', () => {
  const allowed = { names: ['cuda-ent', 'default'], isComplete: true };

  it('uses the card setting while the project may use it', () => {
    expect(cardResourceGroup(['default'], allowed)).toBe('default');
    expect(cardResourceGroup(['default', 'cuda-ent'], allowed)).toBe('default');
  });

  it('defaults to the first allowed group without a setting', () => {
    expect(cardResourceGroup(undefined, allowed)).toBe('cuda-ent');
    expect(cardResourceGroup([], allowed)).toBe('cuda-ent');
  });

  it('falls back to the default when the project may no longer use the setting', () => {
    expect(cardResourceGroup(['removed'], allowed)).toBe('cuda-ent');
  });

  it('keeps a setting it cannot check against a truncated list', () => {
    expect(
      cardResourceGroup(['beyond-page'], { ...allowed, isComplete: false }),
    ).toBe('beyond-page');
  });

  it('reads no group when the project may use none', () => {
    expect(
      cardResourceGroup(undefined, { names: [], isComplete: true }),
    ).toBeNull();
    expect(cardResourceGroup(['gone'], { names: [], isComplete: true })).toBe(
      null,
    );
  });
});

describe('defaultResourceGroupOf', () => {
  it('is the first allowed group, in the order given', () => {
    expect(
      defaultResourceGroupOf({ names: ['b', 'a'], isComplete: true }),
    ).toBe('b');
    expect(defaultResourceGroupOf({ names: [], isComplete: true })).toBeNull();
  });
});

describe('resourceGroupScopeOf', () => {
  it('lists the page project groups with its domain ones, never another project', () => {
    expect(
      resourceGroupScopeOf({ kind: 'mine', projectId: 'p-url' }, 'current'),
    ).toEqual({
      domain: [{ value: 'current' }],
      project: [{ value: 'p-url' }],
    });
    expect(
      resourceGroupScopeOf(
        {
          kind: 'projects',
          projectIds: ['p-url'],
          domain: DOMAIN,
        },
        'current',
      ),
    ).toEqual({
      domain: [{ value: 'domain-uuid' }],
      project: [{ value: 'p-url' }],
    });
    expect(
      resourceGroupScopeOf({ kind: 'mine', projectId: null }, 'current'),
    ).toEqual({ project: [] });
  });

  it('lists the domain groups on the superadmin page', () => {
    expect(
      resourceGroupScopeOf(
        {
          kind: 'projects',
          projectIds: 'all',
          domain: DOMAIN,
        },
        'current',
      ),
    ).toEqual({ domain: [{ value: DOMAIN.id }] });
  });
});
