/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for the FR-3414 dev-mode straggler guardrail: the pathname matcher
 * that decides whether an ambient `useCurrentProjectValue` read happened
 * under a super-admin-scoped surface. The matcher is imperative
 * (window.location) by design so the hook stays router-independent; these
 * tests pin the exact path shapes it must (and must not) match.
 */
import { SUPER_ADMIN_SCOPED_PATHNAME_REGEX } from './useCurrentProject';
import { describe, expect, it, vi } from 'vitest';

// `useCurrentProject` imports the hooks barrel and the backendai hooks at
// module scope; stub them so importing the module under test stays cheap.
vi.mock('.', () => ({
  useSuspendedBackendaiClient: vi.fn(),
}));
vi.mock('./backendai', () => ({
  useRecentProjectGroup: () => ({ writeRecentProjectGroup: vi.fn() }),
}));

describe('SUPER_ADMIN_SCOPED_PATHNAME_REGEX (FR-3414)', () => {
  it.each([
    // Modern /admin/* shape (routes.tsx `handle.menuKey` pages)
    '/admin/session',
    '/admin/session/some-session-id',
    '/admin/deployments',
    '/admin/deployments/dep-1',
    '/admin/deployments/deployment-presets/new',
    '/admin/data',
    // Legacy first-segment shapes (redirect shims)
    '/admin-session',
    '/admin-deployments',
    '/admin-deployments/dep-1',
    '/admin-serving',
    '/admin-data',
  ])('matches the super-admin-scoped path %s', (pathname) => {
    expect(SUPER_ADMIN_SCOPED_PATHNAME_REGEX.test(pathname)).toBe(true);
  });

  it.each([
    '/',
    '/data',
    '/project/default/data',
    '/project/default/session',
    '/project/default/admin/deployments/dep-1', // project-admin space
    '/admin/users',
    '/admin/dashboard', // out of scope (FR-3407)
    '/admin-dashboard',
    '/admin', // bare admin root redirects; not a scoped surface itself
    '/administrator',
    '/admin-sessionish',
  ])('does not match the non-scoped path %s', (pathname) => {
    expect(SUPER_ADMIN_SCOPED_PATHNAME_REGEX.test(pathname)).toBe(false);
  });
});
