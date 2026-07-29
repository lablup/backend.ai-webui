/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentMenuKey } from './useRouteScope';

/**
 * The three super-admin-scoped feature pages of FR-3407: on these routes the
 * header project selector is conceptually irrelevant (the pages operate above
 * project scope), so ambient-project-derived UI (mismatch alerts,
 * session-launch buttons, permission scoping) must not key off it.
 *
 * Exported as a constant so FR-3414 (hiding the header selector on the same
 * routes) reuses the exact same list.
 */
export const SUPER_ADMIN_SCOPED_MENU_KEYS = [
  'admin-session',
  'admin-deployments',
  'admin-data',
] as const;

/**
 * Whether the current route is one of the super-admin-scoped pages
 * (`SUPER_ADMIN_SCOPED_MENU_KEYS`).
 *
 * Implementation: keyed off `useCurrentMenuKey()` — the deepest route
 * `handle.menuKey` (the admin routes carry `menuKey: 'admin-session' |
 * 'admin-deployments' | 'admin-data'`), falling back to the pathname's first
 * segment for legacy unprefixed paths (`/admin-session`, …). This is the
 * modern equivalent of the pathname-first-segment pattern previously used by
 * `ProjectAdminScopeAlert`.
 *
 * Usage contract (ADR-0001): only **pages** and **globally-mounted
 * components** (e.g. the folder-explorer modal, which has no page parent) may
 * call this hook to decide their project context. Converted leaf components
 * must NOT — they receive the decision via their required `project` prop.
 */
export const useIsSuperAdminScopedPage = (): boolean => {
  'use memo';
  const menuKey = useCurrentMenuKey();
  return (SUPER_ADMIN_SCOPED_MENU_KEYS as readonly string[]).includes(
    menuKey ?? '',
  );
};
