/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentLanguage } from '../components/DefaultProviders';
import { useWebUILocation } from './index';
import { useCurrentMenuKey } from './useRouteScope';

// Languages the hosted user manual (https://webui.docs.backend.ai) is
// published in. Any other WebUI locale falls back to English.
const DOCS_LANGUAGES = ['en', 'ko', 'ja', 'th'];

// Maps the first path segment of the current route to the matching page in
// the hosted user manual. Since the multi-version migration (FR-2729) the
// manual is a flat, versioned static site served as
// `https://webui.docs.backend.ai/{version}/{lang}/{page}.html`, so the values
// below are flat `*.html` page slugs (optionally with an in-page anchor).
// Admin / project-admin routes point to their dedicated admin manual sections
// (`admin_menu.html`, `project_admin.html`) rather than the general-user page.
// Keep the keys in sync with the route segments in `routes.tsx`; unmapped
// routes fall back to the per-language index page.
const URLMatchingTable: Record<string, string> = {
  // General user pages
  '': 'dashboard.html',
  start: 'start.html',
  dashboard: 'dashboard.html',
  summary: 'dashboard.html', // legacy → /dashboard
  session: 'sessions_all.html',
  job: 'sessions_all.html', // legacy → /session
  deployments: 'deployment.html',
  serving: 'deployment.html', // legacy → /deployments
  service: 'deployment.html', // legacy → /deployments
  'model-store': 'deployment.html#deployment-model-store',
  import: 'start.html', // legacy → /start
  github: 'start.html', // legacy → /start
  chat: 'chat.html',
  data: 'vfolder.html',
  'my-environment': 'my_environments.html',
  'agent-summary': 'agent_summary.html',
  statistics: 'statistics.html',
  usersettings: 'user_settings.html',
  // Admin pages → dedicated admin manual sections (not the general-user pages).
  // The admin-scoped Users / Projects / Data / Sessions / Deployments pages are
  // documented under `project_admin.html`; infrastructure / admin-only features
  // live under `admin_menu.html`.
  'admin-dashboard': 'dashboard.html',
  'admin-session': 'project_admin.html#project_admin-sessions',
  'admin-deployments': 'project_admin.html#project_admin-deployments',
  'admin-serving': 'project_admin.html#project_admin-deployments', // legacy → /admin-deployments
  'admin-data': 'project_admin.html#project_admin-data',
  credential: 'project_admin.html#project_admin-users',
  environment: 'admin_menu.html#admin_menu-manage-images',
  scheduler: 'admin_menu.html#admin_menu-fair-share-scheduler',
  agent: 'admin_menu.html#admin_menu-manage-agent-nodes',
  'resource-policy': 'admin_menu.html#admin_menu-manage-resource-policies',
  'storage-settings': 'admin_menu.html#admin_menu-storages',
  settings: 'admin_menu.html#admin_menu-system-settings',
  maintenance: 'admin_menu.html#admin_menu-server-management',
  diagnostics: 'admin_menu.html#admin_menu-diagnostics',
  branding: 'admin_menu.html#admin_menu-branding',
  information: 'admin_menu.html#admin_menu-detailed-information',
  rbac: 'rbac_management.html',
  project: 'project_admin.html',
  // Project-admin pages → project_admin manual sections
  'project-admin-users': 'project_admin.html#project_admin-users',
  'project-data': 'project_admin.html#project_admin-data',
  'project-admin-session': 'project_admin.html#project_admin-sessions',
  'project-admin-deployments': 'project_admin.html#project_admin-deployments',
};

// Tab-level overrides. Many pages carry the active tab in the URL as
// `?tab=<key>`; where a tab maps to a more specific manual section than the
// page default, list it here as `route → { tabKey → page#anchor }`. Keep the
// tab keys in sync with each page's `Tabs` `items[].key` / `?tab=` values.
// Pages whose tab has no distinct manual section are omitted and fall back to
// the page-level mapping above.
const TabMatchingTable: Record<string, Record<string, string>> = {
  agent: {
    agents: 'admin_menu.html#admin_menu-manage-agent-nodes',
    storages: 'admin_menu.html#admin_menu-storages',
    resourceGroup: 'admin_menu.html#admin_menu-manage-resource-group',
  },
  environment: {
    image: 'admin_menu.html#admin_menu-manage-images',
    preset: 'admin_menu.html#admin_menu-manage-resource-preset',
    registry: 'admin_menu.html#admin_menu-manage-docker-registry',
  },
  usersettings: {
    general: 'user_settings.html#user_settings-general-tab',
    logs: 'user_settings.html#user_settings-logs-tab',
  },
  'resource-policy': {
    keypair: 'admin_menu.html#admin_menu-keypair-resource-policy',
    user: 'admin_menu.html#admin_menu-user-resource-policy',
    project: 'admin_menu.html#admin_menu-project-resource-policy',
  },
  'admin-deployments': {
    // Main list follows the page-level project_admin mapping; the
    // admin-only sub-tabs are documented only under admin_menu.
    deployments: 'project_admin.html#project_admin-deployments',
    'model-store-management':
      'admin_menu.html#admin_menu-admin-model-store-management',
    'prometheus-preset': 'admin_menu.html#admin_menu-prometheus-query-presets',
    'deployment-presets': 'admin_menu.html#admin_menu-deployment-presets',
  },
  credential: {
    users: 'project_admin.html#project_admin-users',
    // Keypairs/credentials tab is documented only under admin_menu.
    credentials: 'admin_menu.html#admin_menu-manage-user39s-keypairs',
  },
  statistics: {
    'allocation-history': 'statistics.html#statistics-allocation-history',
    'user-session-history': 'statistics.html#statistics-user-session-history',
  },
};

/** The hosted manual page for the current route (and `?tab=` when it has one). */
export const useHelpURL = (): string => {
  'use memo';

  const [lang] = useCurrentLanguage();
  const location = useWebUILocation();

  const docsLang = DOCS_LANGUAGES.includes(lang) ? lang : 'en';
  // The manual is a versioned static site (FR-2729): a prerelease build has no
  // numbered docs site yet, so it tracks the `next` channel that every commit
  // rebuilds; a stable release uses its own `major.minor`.
  const rawVersion = globalThis.packageVersion ?? '';
  const docsVersion = rawVersion.includes('-')
    ? 'next'
    : rawVersion.split('.').slice(0, 2).filter(Boolean).join('.') || 'next';
  const manualURL = `https://webui.docs.backend.ai/${docsVersion}/${docsLang}/`;

  // Scope-aware menu key (route handle): under `/admin/<feature>` and
  // `/project/:name/<feature>` the first pathname segment is the scope prefix,
  // so the lookup uses the matched route's menu key, not the pathname.
  const matchingKey = useCurrentMenuKey() || '';
  const activeTab = new URLSearchParams(location.search).get('tab');
  const tabTarget = activeTab
    ? TabMatchingTable[matchingKey]?.[activeTab]
    : undefined;

  return manualURL + (tabTarget ?? URLMatchingTable[matchingKey] ?? '');
};

/** Opens the current page's manual in a new tab. */
export const useOpenHelp = (): (() => void) => {
  'use memo';

  const url = useHelpURL();
  return () => {
    window.open(url, '_blank', 'noopener noreferrer');
  };
};
