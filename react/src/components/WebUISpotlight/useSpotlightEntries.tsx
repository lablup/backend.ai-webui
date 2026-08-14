/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../../hooks';
import { useActiveProjectName } from '../../hooks/useRouteScope';
import { useThemeMode } from '../../hooks/useThemeMode';
import {
  getPathFromMenuKey,
  useWebUIMenuItems,
} from '../../hooks/useWebUIMenuItems';
import {
  CirclePlay,
  LogOut,
  MonitorCog,
  Moon,
  Settings,
  Sun,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface SpotlightEntry {
  id: string;
  label: string;
  /** Palette group: 'page' | 'action' (rendered via i18n group headings). */
  kind: 'page' | 'action';
  icon?: React.ReactNode;
  /** English aliases matched alongside the locale label (FR-3549). */
  keywords: ReadonlyArray<string>;
  run: () => void;
  /** Menu key for MRU tracking; only page entries derived from the menu have one. */
  menuKey?: string;
}

// English aliases per menu key. Locale labels come from the menu itself, so
// this dictionary stays locale-independent (FR-3550).
const MENU_KEY_ALIASES: Record<string, ReadonlyArray<string>> = {
  start: ['home', 'start'],
  dashboard: ['dashboard', 'overview', 'summary'],
  session: ['sessions', 'compute', 'jupyter', 'notebook', 'terminal'],
  deployments: ['serving', 'endpoints', 'model service', 'deployments'],
  'model-store': ['models', 'model store', 'hub'],
  chat: ['chat', 'playground', 'llm'],
  'ai-agent': ['ai agents', 'agents'],
  data: ['storage', 'folders', 'vfolder', 'files', 'data', 'upload'],
  'my-environment': ['images', 'environments', 'my environment'],
  'agent-summary': ['agents', 'nodes', 'workers'],
  statistics: ['statistics', 'usage', 'metrics'],
  pipeline: ['pipelines', 'fasttrack', 'mlops'],
  'admin-session': ['sessions', 'admin sessions'],
  credential: ['users', 'keypairs', 'credentials', 'policies'],
  environment: ['images', 'environments', 'registries'],
  scheduler: ['scheduler', 'queue', 'scheduling'],
  'resource-policy': ['resource policies', 'quota', 'limits'],
  reservoir: ['reservoir', 'artifacts', 'registry'],
  'admin-deployments': ['serving', 'deployments', 'presets'],
  'admin-dashboard': ['admin dashboard', 'cluster overview'],
  'admin-data': ['storage', 'folders', 'admin data'],
  agent: ['resources', 'agents', 'storage hosts', 'nodes'],
  project: ['projects', 'groups'],
  settings: ['settings', 'configurations'],
  maintenance: ['maintenance', 'update', 'recalculate'],
  diagnostics: ['diagnostics', 'health'],
  branding: ['branding', 'logo', 'theme customization'],
  rbac: ['rbac', 'roles', 'permissions'],
  information: ['information', 'about', 'version', 'license'],
};

/**
 * Builds the Spotlight index. Pages derive from `useWebUIMenuItems` (already
 * role/blocklist/plugin-filtered), so no permission logic is re-implemented
 * here; deep pages gate on their parent menu key's presence (FR-3550).
 */
export const useSpotlightEntries = () => {
  'use memo';
  const { t } = useTranslation();
  const { generalMenu, adminMenu } = useWebUIMenuItems();
  const activeProjectName = useActiveProjectName();
  const { themeMode, setThemeMode } = useThemeMode();
  const webuiNavigate = useWebUINavigate();

  const menuEntries: Array<SpotlightEntry> = [...generalMenu, ...adminMenu]
    .filter((item) => item.to && !item.disabled)
    .map((item) => ({
      id: `page:${item.key}`,
      label: item.labelText,
      kind: 'page' as const,
      icon: item.icon,
      keywords: MENU_KEY_ALIASES[item.key] ?? [],
      menuKey: item.key,
      run: () => webuiNavigate(item.to as string),
    }));

  const hasSessionMenu = generalMenu.some((item) => item.key === 'session');

  const deepPageEntries: Array<SpotlightEntry> = [
    ...(hasSessionMenu
      ? [
          {
            id: 'page:session-start',
            label: t('session.launcher.StartNewSession'),
            kind: 'page' as const,
            icon: <CirclePlay size="1em" />,
            keywords: ['start', 'new', 'launch', 'run', 'create', 'jupyter'],
            run: () =>
              webuiNavigate(
                `${getPathFromMenuKey('session', activeProjectName)}/start`,
              ),
          },
        ]
      : []),
    {
      id: 'page:usersettings',
      label: t('webui.menu.Settings&Logs'),
      kind: 'page' as const,
      icon: <Settings size="1em" />,
      keywords: ['user settings', 'preferences', 'logs', 'shortcuts'],
      run: () => webuiNavigate('/usersettings'),
    },
  ];

  const themeActions: Array<SpotlightEntry> = (
    [
      {
        mode: 'dark',
        label: t('spotlight.SwitchToDarkTheme'),
        icon: <Moon size="1em" />,
        keywords: ['dark', 'theme', 'mode', 'appearance', 'night'],
      },
      {
        mode: 'light',
        label: t('spotlight.SwitchToLightTheme'),
        icon: <Sun size="1em" />,
        keywords: ['light', 'theme', 'mode', 'appearance', 'day'],
      },
      {
        mode: 'system',
        label: t('spotlight.UseSystemTheme'),
        icon: <MonitorCog size="1em" />,
        keywords: ['system', 'theme', 'mode', 'appearance', 'auto'],
      },
    ] as const
  )
    .filter(({ mode }) => mode !== themeMode)
    .map(({ mode, label, icon, keywords }) => ({
      id: `action:theme-${mode}`,
      label,
      kind: 'action' as const,
      icon,
      keywords,
      run: () => setThemeMode(mode),
    }));

  const actionEntries: Array<SpotlightEntry> = [
    ...themeActions,
    {
      id: 'action:logout',
      label: t('webui.menu.LogOut'),
      kind: 'action',
      icon: <LogOut size="1em" />,
      keywords: ['logout', 'log out', 'sign out', 'exit'],
      run: () => {
        document.dispatchEvent(new CustomEvent('backend-ai-logout'));
      },
    },
  ];

  return {
    entries: [...menuEntries, ...deepPageEntries, ...actionEntries],
  };
};
