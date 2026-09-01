/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for the shared URL-project validation (FR-3279, FR-3388). `isInvalid`
 * decides whether `PageAccessGuard` bypasses authorization and whether the
 * project subtree renders the merged not-found/no-access state, so each
 * membership combination is pinned here.
 *
 * Since FR-3388 the membership source is `useAccessibleProjects` (the same
 * GraphQL-backed list the header's `ProjectSelect` renders), not the
 * login-time `baiClient.groups` list — MODEL_STORE projects are therefore
 * valid whenever the selector offers them.
 */
import { useUrlProjectValidity } from './useUrlProjectValidity';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseAccessibleProjects = vi.fn();
const mockUseMatches = vi.fn();

vi.mock('./useAccessibleProjects', () => ({
  useAccessibleProjects: () => mockUseAccessibleProjects(),
}));

vi.mock('react-router-dom', () => ({
  useMatches: () => mockUseMatches(),
}));

const accessible = (projects: { id: string; name: string }[]) => ({
  accessibleProjects: projects,
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
    mockUseAccessibleProjects.mockReturnValue(
      accessible([{ id: 'id-alpha', name: 'alpha' }]),
    );
    mockUseMatches.mockReturnValue(matchWithProject(undefined));

    const { result } = renderHook(() => useUrlProjectValidity());
    expect(result.current.urlProjectName).toBeUndefined();
    expect(result.current.isInvalid).toBe(false);
    expect(result.current.resolvedId).toBeUndefined();
  });

  it('resolves a valid accessible project', () => {
    mockUseAccessibleProjects.mockReturnValue(
      accessible([
        { id: 'id-beta', name: 'beta' },
        { id: 'id-alpha', name: 'alpha' },
      ]),
    );
    mockUseMatches.mockReturnValue(matchWithProject('beta'));

    const { result } = renderHook(() => useUrlProjectValidity());
    expect(result.current.urlProjectName).toBe('beta');
    expect(result.current.isInvalid).toBe(false);
    expect(result.current.resolvedId).toBe('id-beta');
    expect(result.current.groups).toEqual(['alpha', 'beta']);
  });

  it('is invalid for a project the selector does not offer', () => {
    mockUseAccessibleProjects.mockReturnValue(
      accessible([{ id: 'id-alpha', name: 'alpha' }]),
    );
    mockUseMatches.mockReturnValue(matchWithProject('ghost'));

    const { result } = renderHook(() => useUrlProjectValidity());
    expect(result.current.urlProjectName).toBe('ghost');
    expect(result.current.isInvalid).toBe(true);
  });

  it('reads the DEEPEST match carrying a projectName param', () => {
    mockUseAccessibleProjects.mockReturnValue(
      accessible([
        { id: 'id-o', name: 'outer' },
        { id: 'id-i', name: 'inner' },
      ]),
    );
    mockUseMatches.mockReturnValue([
      { params: { projectName: 'outer' } },
      { params: { projectName: 'inner' } },
    ]);

    const { result } = renderHook(() => useUrlProjectValidity());
    expect(result.current.urlProjectName).toBe('inner');
    expect(result.current.resolvedId).toBe('id-i');
  });

  it('tolerates an undefined accessible-project list', () => {
    mockUseAccessibleProjects.mockReturnValue({
      accessibleProjects: undefined,
    });
    mockUseMatches.mockReturnValue(matchWithProject('any'));

    const { result } = renderHook(() => useUrlProjectValidity());
    expect(result.current.isInvalid).toBe(true);
    expect(result.current.groups).toEqual([]);
  });
});
