/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for the FR-3414 dev-mode straggler guardrail: `useCurrentProjectValue`
 * warns (dev builds only) when the ambient current project is read under a
 * project-agnostic surface.
 *
 * The wiring under test is that the hook consults
 * `PROJECT_AGNOSTIC_PATHNAME_REGEX` — the matcher DERIVED from
 * `PROJECT_AGNOSTIC_MENU_KEYS`, so it cannot drift from the hook that hides
 * the header selector. The exact path shapes that matcher accepts are pinned
 * in `helper/projectAgnosticRoutes.test.tsx`; here we only assert that the
 * hook honours it, imperatively (no router context is mounted).
 */
import { useCurrentProjectValue } from './useCurrentProject';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The hook only needs the client for its suspense gate.
vi.mock('.', () => ({
  useSuspendedBackendaiClient: vi.fn(),
}));
vi.mock('./backendai', () => ({
  useRecentProjectGroup: () => ({ writeRecentProjectGroup: vi.fn() }),
}));

const renderAt = (pathname: string) => {
  window.history.replaceState({}, '', pathname);
  return renderHook(() => useCurrentProjectValue());
};

describe('useCurrentProjectValue dev-mode straggler warning (FR-3414)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    '/admin/session',
    '/admin/users', // `credential` — menu key differs from the path segment
    '/admin/rbac',
    '/credential', // legacy flat shim
    '/scheduler',
    '/admin/environment', // FR-3415: now has in-page project selection
    '/admin/reservoir/artifact-1', // FR-3415: prefix covers the detail child
  ])('warns once when read under the project-agnostic route %s', (pathname) => {
    renderAt(pathname);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(vi.mocked(console.warn).mock.calls[0]?.[0]).toContain('[ADR-0001]');
  });

  it.each([
    '/project/default/session',
    '/admin/dashboard', // the only excluded admin page
  ])('stays silent when read under the project-scoped route %s', (pathname) => {
    renderAt(pathname);
    expect(console.warn).not.toHaveBeenCalled();
  });
});
