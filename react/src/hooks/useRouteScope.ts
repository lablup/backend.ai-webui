/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Scope-aware routing primitives.
 *
 * These hooks read the scope / feature key from the DEEPEST `useMatches()`
 * handle (populated by the route generator as `handle.scope` /
 * `handle.menuKey`). When no handle is present (e.g. legacy redirect shims or
 * navigation code that runs before the new subtree is mounted), they fall back
 * to parsing the pathname via `getRouteScopeAndKey`.
 *
 * The point of these primitives is to replace every `location.pathname.split('/')[1]`
 * / `startsWith('/admin-...')` first-segment check with a single, scope-aware
 * source of truth.
 */
import { buildPath, RouteScope, FeatureKey } from '../helper/pathBuilder';
import { useCurrentProjectValue } from './useCurrentProject';
import { useLocation, useMatches } from 'react-router-dom';

/**
 * Shape of the route `handle` attached by the route generator. Optional fields
 * because not every match carries scope metadata (e.g. layout routes).
 */
interface ScopeRouteHandle {
  scope?: RouteScope;
  menuKey?: string;
}

export interface RouteScopeInfo {
  scope: RouteScope;
  featureKey: FeatureKey;
  projectName?: string;
}

/**
 * Parses a pathname into `{scope, featureKey, projectName?}`.
 *
 * Recognizes (in order of specificity):
 *   - `/project/:name/admin/:feature`           -> projectAdmin
 *   - `/project/:name/:feature`                 -> project
 *   - `/admin/:feature`                         -> admin
 *   - legacy unprefixed `/:feature` (and deeper) -> project (default scope)
 *
 * `projectName` is decoded with `decodeURIComponent` so it matches the stored
 * project name exactly. The default scope is `project` (the most common case),
 * matching the historical assumption that the first segment is a project-scoped
 * feature key.
 *
 * This is a pure helper (no React) so it can be used outside of components and
 * unit-tested directly.
 */
export const getRouteScopeAndKey = (pathname: string): RouteScopeInfo => {
  // Strip leading slash and split into non-empty segments.
  const segments = pathname.split('/').filter((s) => s.length > 0);

  if (segments[0] === 'admin') {
    return {
      scope: 'admin',
      featureKey: segments[1] ?? '',
    };
  }

  if (segments[0] === 'project') {
    const projectName = decodeSafe(segments[1] ?? '');
    if (segments[2] === 'admin') {
      return {
        scope: 'projectAdmin',
        featureKey: segments[3] ?? '',
        projectName,
      };
    }
    return {
      scope: 'project',
      featureKey: segments[2] ?? '',
      projectName,
    };
  }

  // Legacy unprefixed path: first segment is the feature key, default scope.
  return {
    scope: 'project',
    featureKey: segments[0] ?? '',
  };
};

const decodeSafe = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    // Malformed URI component — fall back to the raw value rather than throwing.
    return value;
  }
};

/**
 * Rewrites the `:projectName` segment of a project-scoped path to
 * `projectName`, preserving the rest of the path (and any query / hash).
 *
 * Used when reading a stored navigation target (e.g. the sider's
 * `goBackPath`) that was captured under a possibly-different project: if the
 * user switched projects in the meantime, going "back" should land on the
 * CURRENT project, not the stale one baked into the stored path.
 *
 *   rewriteProjectNameInPath('/project/old/session', 'new')
 *     -> '/project/new/session'
 *   rewriteProjectNameInPath('/project/old/admin/data?x=1', 'new')
 *     -> '/project/new/admin/data?x=1'
 *
 * Non-project paths (e.g. `/admin/session`, `/usersettings`) are returned
 * unchanged. When `projectName` is falsy the original path is returned (we
 * cannot synthesize a valid `/project//...` segment).
 */
export const rewriteProjectNameInPath = (
  path: string,
  projectName?: string | null,
): string => {
  if (!projectName) {
    return path;
  }
  // Match a leading `/project/<segment>` and replace only `<segment>`,
  // keeping everything after it (further path, search, hash) intact.
  return path.replace(
    /^\/project\/[^/?#]*/,
    `/project/${encodeURIComponent(projectName)}`,
  );
};

/**
 * Returns the deepest route match handle that carries scope metadata, or
 * `undefined`. We prefer the deepest match so detail/child routes resolve
 * correctly even when parent layout routes also carry handles.
 */
const useDeepestScopeHandle = (): ScopeRouteHandle | undefined => {
  'use memo';
  const matches = useMatches();
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i]?.handle as ScopeRouteHandle | undefined;
    if (handle && (handle.scope || handle.menuKey)) {
      return handle;
    }
  }
  return undefined;
};

/**
 * The current routing scope. Reads the deepest match `handle.scope`; falls back
 * to parsing the pathname. Defaults to `project`.
 */
export const useRouteScope = (): RouteScope => {
  'use memo';
  const handle = useDeepestScopeHandle();
  const location = useLocation();
  if (handle?.scope) {
    return handle.scope;
  }
  return getRouteScopeAndKey(location.pathname).scope;
};

/**
 * The current menu key (legacy hyphenated key, e.g. 'admin-session'). Reads the
 * deepest match `handle.menuKey`; falls back to the pathname-derived feature
 * key. May be `undefined` when nothing matches.
 */
export const useCurrentMenuKey = (): string | undefined => {
  'use memo';
  const handle = useDeepestScopeHandle();
  const location = useLocation();
  if (handle?.menuKey) {
    return handle.menuKey;
  }
  const { featureKey } = getRouteScopeAndKey(location.pathname);
  return featureKey || undefined;
};

/**
 * The active project NAME for the current route. Prefers the `:projectName`
 * param from the URL (via `useMatches`); falls back to the current project atom
 * value. This is the key shim that lets project-dependent hooks/components keep
 * reading the atom while still being URL-accurate on project routes (the layout
 * effect converges the atom to the URL).
 */
export const useActiveProjectName = (): string | undefined => {
  'use memo';
  const matches = useMatches();
  const currentProject = useCurrentProjectValue();

  // Find the deepest match that carries a `projectName` param.
  for (let i = matches.length - 1; i >= 0; i--) {
    const params = matches[i]?.params as
      | Record<string, string | undefined>
      | undefined;
    const name = params?.projectName;
    if (name) {
      return decodeSafe(name);
    }
  }

  return currentProject.name ?? undefined;
};

interface ProjectPathOptions {
  scope?: RouteScope;
}

/**
 * Returns a link builder bound to the current scope / active project. Pass an
 * explicit `scope` to override (e.g. to build an `admin` link from a project
 * page).
 *
 *   const buildLink = useProjectPath();
 *   buildLink('session');                          // current scope + project
 *   buildLink('users', { scope: 'admin' });        // /admin/users
 */
export const useProjectPath = (): ((
  key: FeatureKey,
  opts?: ProjectPathOptions,
) => string) => {
  'use memo';
  const scope = useRouteScope();
  const projectName = useActiveProjectName();

  return (key: FeatureKey, opts?: ProjectPathOptions): string => {
    return buildPath(opts?.scope ?? scope, key, projectName);
  };
};
