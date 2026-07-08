/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Path-building primitives for the scope-aware routing scheme.
 *
 * The webui routes encode the "scope" (project / project-admin / system-admin)
 * directly in the URL:
 *
 *   - project:      `/project/<projectName>/<featureKey>`
 *   - projectAdmin: `/project/<projectName>/admin/<featureKey>`
 *   - admin:        `/admin/<featureKey>`
 *
 * `buildPath` is the ONLY function that knows this URL structure; everything
 * else (hooks, components, redirects) goes through it so the layout can change
 * in one place.
 *
 * This module is intentionally framework-free (no React / react-router imports)
 * so it can be unit-tested in isolation and reused from non-component code.
 */

/**
 * The three routing scopes. `project` and `projectAdmin` live under the
 * `/project/:projectName` subtree; `admin` is a separate global namespace.
 */
export type RouteScope = 'project' | 'projectAdmin' | 'admin';

/**
 * A scope-relative feature key (the feature portion of a route, e.g.
 * 'session', 'deployments', 'data', 'users'). This is distinct from the legacy
 * "menu key" (e.g. 'admin-session', 'project-data') which encodes the scope in
 * its name.
 */
export type FeatureKey = string;

/**
 * Builds a scope-aware URL path for the given feature key.
 *
 * @param scope        The routing scope.
 * @param key          The scope-relative feature key (e.g. 'session').
 * @param projectName  The project NAME (not UUID). Required for `project` and
 *                     `projectAdmin` scopes; ignored for `admin`.
 *
 * The project name is `encodeURIComponent`-encoded so names with spaces / dots
 * / unicode round-trip safely. If a project name is required but missing, the
 * path is built with an empty segment (callers/layout guards are responsible
 * for never producing such a state at runtime).
 */
export const buildPath = (
  scope: RouteScope,
  key: FeatureKey,
  projectName?: string | null,
): string => {
  switch (scope) {
    case 'admin':
      return `/admin/${key}`;
    case 'projectAdmin':
      return `/project/${encodeURIComponent(projectName ?? '')}/admin/${key}`;
    case 'project':
    default:
      return `/project/${encodeURIComponent(projectName ?? '')}/${key}`;
  }
};

interface ScopeFeature {
  scope: RouteScope;
  featureKey: FeatureKey;
}

/**
 * Bidirectional map from the existing menu key (as defined in
 * `VALID_MENU_KEYS` in `hooks/useWebUIMenuItems.tsx`) to its `{scope,
 * featureKey}` pair.
 *
 * Covers EVERY key in `VALID_MENU_KEYS`, per the confirmed scope decisions:
 *
 * generalMenu  -> project scope at `/project/:name/<feature>`
 * PROJECT_ADMIN_PAGE_KEYS -> projectAdmin at `/project/:name/admin/<feature>`
 * all other adminMenu keys -> admin at `/admin/<feature>`
 *
 * Aliases (`summary`->dashboard, `job`->session) share the same target as
 * their canonical key; the inverse lookup resolves to the canonical key.
 */
export const MENU_KEY_TO_SCOPE_FEATURE: Record<string, ScopeFeature> = {
  // --- generalMenu: project scope ---
  start: { scope: 'project', featureKey: 'start' },
  dashboard: { scope: 'project', featureKey: 'dashboard' },
  summary: { scope: 'project', featureKey: 'dashboard' }, // alias -> dashboard
  session: { scope: 'project', featureKey: 'session' },
  job: { scope: 'project', featureKey: 'session' }, // alias -> session
  deployments: { scope: 'project', featureKey: 'deployments' },
  'model-store': { scope: 'project', featureKey: 'model-store' },
  'ai-agent': { scope: 'project', featureKey: 'ai-agent' },
  chat: { scope: 'project', featureKey: 'chat' },
  data: { scope: 'project', featureKey: 'data' },
  'my-environment': { scope: 'project', featureKey: 'my-environment' },
  'agent-summary': { scope: 'project', featureKey: 'agent-summary' },
  statistics: { scope: 'project', featureKey: 'statistics' },
  // 'pipeline' (FastTrack) is an external window.open link, NOT a route, but it
  // belongs to the project (general) menu, so map it to project scope for
  // completeness / round-trip coverage.
  pipeline: { scope: 'project', featureKey: 'pipeline' },

  // --- PROJECT_ADMIN_PAGE_KEYS: projectAdmin scope ---
  'project-admin-session': { scope: 'projectAdmin', featureKey: 'session' },
  'project-admin-deployments': {
    scope: 'projectAdmin',
    featureKey: 'deployments',
  },
  'project-data': { scope: 'projectAdmin', featureKey: 'data' },
  'project-admin-users': { scope: 'projectAdmin', featureKey: 'users' },

  // --- all other adminMenu (ALL_ADMIN_PAGE_KEYS): global admin scope ---
  'admin-session': { scope: 'admin', featureKey: 'session' },
  'admin-deployments': { scope: 'admin', featureKey: 'deployments' },
  'admin-data': { scope: 'admin', featureKey: 'data' },
  'admin-dashboard': { scope: 'admin', featureKey: 'dashboard' },
  credential: { scope: 'admin', featureKey: 'users' },
  environment: { scope: 'admin', featureKey: 'environment' },
  'resource-policy': { scope: 'admin', featureKey: 'resource-policy' },
  reservoir: { scope: 'admin', featureKey: 'reservoir' },
  scheduler: { scope: 'admin', featureKey: 'scheduler' },
  agent: { scope: 'admin', featureKey: 'agent' },
  project: { scope: 'admin', featureKey: 'project' },
  settings: { scope: 'admin', featureKey: 'settings' },
  maintenance: { scope: 'admin', featureKey: 'maintenance' },
  diagnostics: { scope: 'admin', featureKey: 'diagnostics' },
  rbac: { scope: 'admin', featureKey: 'rbac' },
  branding: { scope: 'admin', featureKey: 'branding' },
  information: { scope: 'admin', featureKey: 'information' },
};
