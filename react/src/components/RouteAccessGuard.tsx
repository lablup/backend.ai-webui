/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useRouteAccessDecision } from '../hooks/useRouteAccess';
import { Outlet } from 'react-router-dom';

/**
 * Pathless route element wrapping every MainLayout child route (FR-3383).
 * Enforces the route-handle-declared `access` requirement by throwing the
 * matching `Response` — caught by `RouteErrorBoundary` (the pathless
 * `errorElement` above this route), which renders the shared route-error
 * language inside the shell:
 *
 *   unauthorized -> Response 401 -> ForbiddenPage
 *   blocked      -> Response 404 -> Page404  (blocklisted feature)
 *
 * 'defer' (URL project doesn't resolve) renders the Outlet so
 * `ProjectScopeLayout` can show the merged "not found or no access" state.
 */
const RouteAccessGuard = () => {
  'use memo';
  const decision = useRouteAccessDecision();

  if (decision === 'unauthorized') {
    throw new Response(null, { status: 401 });
  }
  if (decision === 'blocked') {
    throw new Response(null, { status: 404 });
  }

  return <Outlet />;
};

export default RouteAccessGuard;
