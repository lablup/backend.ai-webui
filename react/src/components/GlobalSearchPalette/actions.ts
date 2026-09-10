/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { buildPath } from '../../helper/pathBuilder';
import {
  CREATE_ACTION_PARAM,
  CREATE_ACTION_VALUE,
} from '../../hooks/useCreateActionArrival';
import { SETTING_ARRIVAL_PARAM } from '../../hooks/useSettingArrival';
import type { PaletteActionContext, SearchContext } from './types';
import {
  Bell,
  BookOpen,
  FolderPlus,
  Languages,
  Moon,
  PanelLeft,
  Play,
  Rocket,
  Settings,
  Sun,
  SunMoon,
  Workflow,
} from 'lucide-react';
import type { ComponentType } from 'react';

/** Trailing palette groups, in the order they are shown. */
export type PaletteActionGroup = 'create' | 'appearance' | 'panels';

export interface PaletteAction {
  id: string;
  labelKey: string;
  icon: ComponentType<{ size?: string | number }>;
  group: PaletteActionGroup;
  /** Sidebar page the action acts on; it inherits that page's visibility. */
  menuKey?: string;
  /** Literal terms matched verbatim, in English (the always-searched locale). */
  keywords?: Array<string>;
  gate?: (ctx: SearchContext) => boolean;
  run: (ctx: PaletteActionContext) => void | Promise<void>;
}

/** The one URL-openable modal convention in the app (`credentials?action=add`). */
const OPEN_CREATE_SEARCH = `${CREATE_ACTION_PARAM}=${CREATE_ACTION_VALUE}`;

const userSettingsTarget = (settingKey?: string) => ({
  pathname: '/usersettings',
  search: settingKey
    ? new URLSearchParams({
        tab: 'general',
        [SETTING_ARRIVAL_PARAM]: settingKey,
      }).toString()
    : '',
});

/**
 * The v1 action catalogue. Static by construction: other pages are not mounted
 * when the palette opens, so nothing can register itself at mount time.
 */
export const PALETTE_ACTIONS: ReadonlyArray<PaletteAction> = [
  {
    id: 'action:start-session',
    labelKey: 'session.launcher.StartNewSession',
    icon: Play,
    group: 'create',
    menuKey: 'session',
    keywords: ['session', 'launch', 'new'],
    run: (ctx) =>
      ctx.navigate(`${buildPath('project', 'session', ctx.projectName)}/start`),
  },
  {
    id: 'action:create-folder',
    labelKey: 'data.CreateFolder',
    icon: FolderPlus,
    group: 'create',
    menuKey: 'data',
    keywords: ['folder', 'vfolder', 'storage', 'data'],
    run: (ctx) =>
      ctx.navigate({
        pathname: buildPath('project', 'data', ctx.projectName),
        search: OPEN_CREATE_SEARCH,
      }),
  },
  {
    id: 'action:create-deployment',
    labelKey: 'deployment.CreateDeployment',
    icon: Rocket,
    group: 'create',
    menuKey: 'deployments',
    keywords: ['deployment', 'serving', 'model', 'inference'],
    run: (ctx) =>
      ctx.navigate({
        pathname: buildPath('project', 'deployments', ctx.projectName),
        search: OPEN_CREATE_SEARCH,
      }),
  },
  {
    id: 'action:open-fasttrack',
    labelKey: 'webui.menu.FastTrack',
    icon: Workflow,
    group: 'create',
    menuKey: 'pipeline',
    keywords: ['fasttrack', 'pipeline', 'mlops'],
    gate: (ctx) => !!ctx.config.fasttrackEndpoint,
    run: (ctx) => {
      if (ctx.config.fasttrackEndpoint) {
        window.open(
          ctx.config.fasttrackEndpoint,
          '_blank',
          'noopener noreferrer',
        );
      }
    },
  },
  {
    id: 'action:theme-light',
    labelKey: 'webui.search.action.SwitchToLightMode',
    icon: Sun,
    group: 'appearance',
    keywords: ['theme', 'light', 'mode', 'appearance'],
    run: (ctx) => ctx.setThemeMode('light'),
  },
  {
    id: 'action:theme-dark',
    labelKey: 'webui.search.action.SwitchToDarkMode',
    icon: Moon,
    group: 'appearance',
    keywords: ['theme', 'dark', 'mode', 'appearance'],
    run: (ctx) => ctx.setThemeMode('dark'),
  },
  {
    id: 'action:theme-system',
    labelKey: 'webui.search.action.UseSystemTheme',
    icon: SunMoon,
    group: 'appearance',
    keywords: ['theme', 'system', 'mode', 'appearance'],
    run: (ctx) => ctx.setThemeMode('system'),
  },
  {
    id: 'action:change-language',
    labelKey: 'webui.search.action.ChangeLanguage',
    icon: Languages,
    group: 'appearance',
    keywords: ['language', 'locale', 'i18n'],
    run: (ctx) => ctx.navigate(userSettingsTarget('userSettings.Language')),
  },
  {
    id: 'action:open-notifications',
    labelKey: 'webui.search.action.OpenNotifications',
    icon: Bell,
    group: 'panels',
    keywords: ['notification', 'alert', 'bell', 'task'],
    run: (ctx) => ctx.openNotifications(),
  },
  {
    id: 'action:toggle-sidebar',
    labelKey: 'webui.search.action.ToggleSidebar',
    icon: PanelLeft,
    group: 'panels',
    keywords: ['sidebar', 'sider', 'menu', 'collapse'],
    run: (ctx) => ctx.toggleSider(),
  },
  {
    id: 'action:open-manual',
    labelKey: 'webui.search.action.OpenManual',
    icon: BookOpen,
    group: 'panels',
    keywords: ['manual', 'help', 'docs', 'documentation'],
    run: (ctx) => ctx.openHelp(),
  },
  {
    id: 'action:open-user-settings',
    labelKey: 'webui.search.action.OpenUserSettings',
    icon: Settings,
    group: 'panels',
    keywords: ['settings', 'preferences', 'account'],
    run: (ctx) => ctx.navigate(userSettingsTarget()),
  },
];
