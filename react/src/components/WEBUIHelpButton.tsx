/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentLanguage } from './DefaultProviders';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, type ButtonProps } from 'antd';
import React from 'react';
import { useLocation } from 'react-router-dom';

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

interface WEBUIHelpButtonProps extends ButtonProps {}
const WEBUIHelpButton: React.FC<WEBUIHelpButtonProps> = ({ ...props }) => {
  'use memo';
  const [lang] = useCurrentLanguage();
  const location = useLocation();

  const docsLang = DOCS_LANGUAGES.includes(lang) ? lang : 'en';
  // The manual is published as a versioned static site (FR-2729): stable
  // releases live under their `major.minor` (e.g. "26.7") and the
  // in-development tip lives under the `next` channel. Map the running WebUI
  // build to the matching docs channel so the "?" opens docs for this build:
  //   - a prerelease build (e.g. "26.5.0-alpha.0") tracks the workspace tip
  //     and there is no numbered docs site for it yet → use `next`;
  //   - a stable release → its `major.minor`.
  // Fall back to `next` when the version is unknown (numbered docs may not
  // exist, but `next` is rebuilt on every commit and always present).
  const rawVersion = globalThis.packageVersion ?? '';
  const docsVersion = rawVersion.includes('-')
    ? 'next'
    : rawVersion.split('.').slice(0, 2).filter(Boolean).join('.') || 'next';
  const manualURL = `https://webui.docs.backend.ai/${docsVersion}/${docsLang}/`;

  const matchingKey = location.pathname.split('/')[1] || '';
  // Prefer a tab-specific manual section when the active tab (`?tab=…`) has
  // one, otherwise use the page-level mapping.
  const activeTab = new URLSearchParams(location.search).get('tab');
  const tabTarget = activeTab
    ? TabMatchingTable[matchingKey]?.[activeTab]
    : undefined;
  const URL = manualURL + (tabTarget ?? URLMatchingTable[matchingKey] ?? '');

  return (
    <Button
      icon={<QuestionCircleOutlined />}
      type="text"
      target="_blank"
      href={URL}
      {...props}
    />
  );
};

export default WEBUIHelpButton;
