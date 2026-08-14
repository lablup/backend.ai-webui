/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../../hooks';
import {
  useBAISettingGeneralState,
  useBAISettingUserState,
} from '../../hooks/useBAISetting';
import { useActiveProjectName } from '../../hooks/useRouteScope';
import { useThemeMode } from '../../hooks/useThemeMode';
import {
  getPathFromMenuKey,
  useWebUIMenuItems,
  WebUIMenuItemBase,
} from '../../hooks/useWebUIMenuItems';
import { spotlightFolderCreateOpenAtom } from './spotlightAtoms';
import { useSetAtom } from 'jotai';
import {
  CirclePlay,
  FolderPlus,
  Languages,
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
  /** Palette group (rendered via i18n group headings). */
  kind: 'page' | 'admin-page' | 'action';
  icon?: React.ReactNode;
  /** English aliases matched alongside the locale label (FR-3549). */
  keywords: ReadonlyArray<string>;
  run: () => void;
  /** Menu key for MRU tracking; only page entries derived from the menu have one. */
  menuKey?: string;
  /** Reachable via search only — kept out of the empty-query action list. */
  isHiddenInBootstrap?: boolean;
}

// The `language.*` i18n values are native names in EVERY locale, so English
// names live here as search keywords ('korean' → 한국어 from any UI language).
const LANGUAGE_OPTIONS: ReadonlyArray<{
  value: string;
  englishName: string;
  nativeName: string;
}> = [
  { value: 'en', englishName: 'English', nativeName: 'English' },
  { value: 'ko', englishName: 'Korean', nativeName: '한국어' },
  {
    value: 'pt-BR',
    englishName: 'Brazilian Portuguese',
    nativeName: 'Português (Brasil)',
  },
  {
    value: 'zh-CN',
    englishName: 'Simplified Chinese',
    nativeName: '简体中文',
  },
  {
    value: 'zh-TW',
    englishName: 'Traditional Chinese',
    nativeName: '繁體中文',
  },
  { value: 'fr', englishName: 'French', nativeName: 'Français' },
  { value: 'fi', englishName: 'Finnish', nativeName: 'Suomi' },
  { value: 'de', englishName: 'German', nativeName: 'Deutsch' },
  { value: 'el', englishName: 'Greek', nativeName: 'Ελληνικά' },
  {
    value: 'id',
    englishName: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
  },
  { value: 'it', englishName: 'Italian', nativeName: 'Italiano' },
  { value: 'ja', englishName: 'Japanese', nativeName: '日本語' },
  { value: 'mn', englishName: 'Mongolian', nativeName: 'Монгол' },
  { value: 'pl', englishName: 'Polish', nativeName: 'Polski' },
  { value: 'pt', englishName: 'Portuguese', nativeName: 'Português' },
  { value: 'ru', englishName: 'Russian', nativeName: 'Русский' },
  { value: 'es', englishName: 'Spanish', nativeName: 'Español' },
  { value: 'th', englishName: 'Thai', nativeName: 'ไทย' },
  { value: 'tr', englishName: 'Turkish', nativeName: 'Türkçe' },
  { value: 'vi', englishName: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

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
  const { t, i18n } = useTranslation();
  const { generalMenu, adminMenu } = useWebUIMenuItems();
  const activeProjectName = useActiveProjectName();
  const { themeMode, setThemeMode } = useThemeMode();
  const webuiNavigate = useWebUINavigate();
  const setFolderCreateOpen = useSetAtom(spotlightFolderCreateOpenAtom);
  const [, setSelectedLanguage] = useBAISettingUserState('selected_language');
  const [, setGeneralLanguage] = useBAISettingGeneralState('language');

  const toMenuEntry = (
    item: WebUIMenuItemBase,
    kind: 'page' | 'admin-page',
  ): SpotlightEntry => ({
    id: `page:${item.key}`,
    label: item.labelText,
    kind,
    icon: item.icon,
    keywords: MENU_KEY_ALIASES[item.key] ?? [],
    menuKey: item.key,
    run: () => webuiNavigate(item.to as string),
  });

  // Admin pages get their own kind → own palette group, so identical labels
  // (e.g. general vs admin "Sessions") stay distinguishable.
  const menuEntries: Array<SpotlightEntry> = [
    ...generalMenu
      .filter((item) => item.to && !item.disabled)
      .map((item) => toMenuEntry(item, 'page')),
    ...adminMenu
      .filter((item) => item.to && !item.disabled)
      .map((item) => toMenuEntry(item, 'admin-page')),
  ];

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

  const hasDataMenu = generalMenu.some((item) => item.key === 'data');

  // Mirrors UserSettingsPage's language onChange: persist both settings, then
  // broadcast `langChanged` so DefaultProviders swaps i18n/dayjs/<html lang>.
  const languageActions: Array<SpotlightEntry> = LANGUAGE_OPTIONS.filter(
    ({ value }) => value !== i18n.language,
  ).map(({ value, englishName, nativeName }) => ({
    id: `action:language-${value}`,
    label: `${t('userSettings.Language')}: ${nativeName}`,
    kind: 'action' as const,
    icon: <Languages size="1em" />,
    keywords: ['language', 'lang', value, nativeName, englishName],
    isHiddenInBootstrap: true,
    run: () => {
      setSelectedLanguage(value);
      setGeneralLanguage(value);
      window.dispatchEvent(
        new CustomEvent('langChanged', { detail: { lang: value } }),
      );
    },
  }));

  const actionEntries: Array<SpotlightEntry> = [
    ...(hasDataMenu
      ? [
          {
            id: 'action:create-folder',
            label: t('start.CreateFolder'),
            kind: 'action' as const,
            icon: <FolderPlus size="1em" />,
            keywords: ['create', 'new', 'folder', 'vfolder', 'storage', 'add'],
            run: () => setFolderCreateOpen(true),
          },
        ]
      : []),
    ...themeActions,
    ...languageActions,
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
