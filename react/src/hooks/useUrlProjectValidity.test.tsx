/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for the shared URL-project validation (FR-3279). `isInvalid` decides
 * whether `PageAccessGuard` bypasses authorization and whether the project
 * subtree renders the merged not-found/no-access state, so each membership
 * combination is pinned here.
 */
import { useUrlProjectValidity } from './useUrlProjectValidity';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseSuspendedBackendaiClient = vi.fn();
const mockUseMatches = vi.fn();

vi.mock('.', () => ({
  useSuspendedBackendaiClient: () => mockUseSuspendedBackendaiClient(),
}));

vi.mock('react-router-dom', () => ({
  useMatches: () => mockUseMatches(),
}));

const clientWith = (groups: string[], groupIds: Record<string, string>) => ({
  groups,
  groupIds,
});

const matchWithProject = (projectName?: string) => [
  { params: {} },
  { params: projectName ? { projectName } : {} },
];

describe('useUrlProjectValidity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is not invalid outside project-scoped URLs (no :projectName param)', () => {
    mockUseSuspendedBackendaiClient.mockReturnValue(
      clientWith(['alpha'], { alpha: 'id-alpha' }),
    );
    mockUseMatches.mockReturnValue(matchWithProject(undefined));

    const { result } = renderHook(() => useUrlProjectValidity());
    expect(result.current.urlProjectName).toBeUndefined();
    expect(result.current.isInvalid).toBe(false);
    expect(result.current.resolvedId).toBeUndefined();
  });

  it('resolves a valid member project (member + id present)', () => {
    mockUseSuspendedBackendaiClient.mockReturnValue(
      clientWith(['alpha', 'beta'], { alpha: 'id-alpha', beta: 'id-beta' }),
    );
    mockUseMatches.mockReturnValue(matchWithProject('beta'));

    const { result } = renderHook(() => useUrlProjectValidity());
    expect(result.current.urlProjectName).toBe('beta');
    expect(result.current.isInvalid).toBe(false);
    expect(result.current.resolvedId).toBe('id-beta');
    expect(result.current.groups).toEqual(['alpha', 'beta']);
  });

  it('is invalid for a project the user is not a member of', () => {
    mockUseSuspendedBackendaiClient.mockReturnValue(
      clientWith(['alpha'], { alpha: 'id-alpha' }),
    );
    mockUseMatches.mockReturnValue(matchWithProject('ghost'));

    const { result } = renderHook(() => useUrlProjectValidity());
    expect(result.current.urlProjectName).toBe('ghost');
    expect(result.current.isInvalid).toBe(true);
  });

  it('is invalid for a member project whose id is missing', () => {
    mockUseSuspendedBackendaiClient.mockReturnValue(clientWith(['alpha'], {}));
    mockUseMatches.mockReturnValue(matchWithProject('alpha'));

    const { result } = renderHook(() => useUrlProjectValidity());
    expect(result.current.urlProjectName).toBe('alpha');
    expect(result.current.isInvalid).toBe(true);
    expect(result.current.resolvedId).toBeUndefined();
  });

  it('reads the DEEPEST match carrying a projectName param', () => {
    mockUseSuspendedBackendaiClient.mockReturnValue(
      clientWith(['outer', 'inner'], { outer: 'id-o', inner: 'id-i' }),
    );
    mockUseMatches.mockReturnValue([
      { params: { projectName: 'outer' } },
      { params: { projectName: 'inner' } },
    ]);

    const { result } = renderHook(() => useUrlProjectValidity());
    expect(result.current.urlProjectName).toBe('inner');
    expect(result.current.resolvedId).toBe('id-i');
  });

  it('tolerates a client without groups/groupIds fields', () => {
    mockUseSuspendedBackendaiClient.mockReturnValue({});
    mockUseMatches.mockReturnValue(matchWithProject('any'));

    const { result } = renderHook(() => useUrlProjectValidity());
    expect(result.current.isInvalid).toBe(true);
    expect(result.current.groups).toEqual([]);
  });
});
