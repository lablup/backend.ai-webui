/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { MenuKeys } from './useWebUIMenuItems';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIEndpointsIcon,
  BAIModelStoreIcon,
  BAIMyEnvironmentsIcon,
  BAIPipelinesIcon,
  BAISessionsIcon,
} from 'backend.ai-ui';
import {
  Activity,
  BadgeCheck,
  BotMessageSquare,
  ChartColumn,
  CirclePlay,
  ClipboardClock,
  CloudUpload,
  FileCheck,
  FileUser,
  Gauge,
  HardDrive,
  Info,
  MessageSquare,
  PackagePlus,
  Palette,
  Settings2,
  SlidersHorizontal,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Which part of the sidebar a menu key belongs to. */
export type WebUIMenuTier = 'user' | 'projectAdmin' | 'admin';

/** Menu keys with an entry of their own (the `summary` / `job` aliases have none). */
export type WebUIMenuCatalogKey = Exclude<MenuKeys, 'summary' | 'job'>;

export interface WebUIMenuCatalogEntry {
  key: WebUIMenuCatalogKey;
  labelText: string;
  icon: React.ReactNode;
  tier: WebUIMenuTier;
}

/**
 * Every sidebar entry's label, icon and tier, whatever the viewer's role or
 * the config hides; `useWebUIMenuItems` filters it, the menu-key selector
 * lists all of it. Ordered as the sidebar.
 */
export const useWebUIMenuCatalog = (): ReadonlyArray<WebUIMenuCatalogEntry> => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const user = { color: token('--color-accent') };
  const admin = { color: token('--color-info') };

  const entry = (
    key: WebUIMenuCatalogKey,
    labelText: string,
    icon: React.ReactNode,
    tier: WebUIMenuTier,
  ): WebUIMenuCatalogEntry => ({ key, labelText, icon, tier });

  return [
    entry(
      'start',
      t('webui.menu.Start'),
      <CirclePlay style={user} size="1em" />,
      'user',
    ),
    entry(
      'dashboard',
      t('webui.menu.Dashboard'),
      <Gauge style={user} size="1em" />,
      'user',
    ),
    entry(
      'session',
      t('webui.menu.Sessions'),
      <BAISessionsIcon style={user} />,
      'user',
    ),
    entry(
      'deployments',
      t('webui.menu.Deployments'),
      <BAIEndpointsIcon style={user} />,
      'user',
    ),
    entry(
      'model-store',
      t('data.ModelStore'),
      <BAIModelStoreIcon style={user} />,
      'user',
    ),
    entry(
      'ai-agent',
      t('webui.menu.AIAgents'),
      <BotMessageSquare style={user} />,
      'user',
    ),
    entry(
      'chat',
      t('webui.menu.Chat'),
      <MessageSquare style={user} size="1em" />,
      'user',
    ),
    entry(
      'data',
      t('webui.menu.Data'),
      <CloudUpload style={user} size="1em" />,
      'user',
    ),
    entry(
      'my-environment',
      t('webui.menu.MyEnvironments'),
      <BAIMyEnvironmentsIcon style={user} />,
      'user',
    ),
    entry(
      'agent-summary',
      t('webui.menu.AgentSummary'),
      <HardDrive style={user} size="1em" />,
      'user',
    ),
    entry(
      'statistics',
      t('webui.menu.Statistics'),
      <ChartColumn style={user} size="1em" />,
      'user',
    ),
    entry(
      'pipeline',
      t('webui.menu.FastTrack'),
      <BAIPipelinesIcon style={user} />,
      'user',
    ),
    entry(
      'admin-dashboard',
      t('webui.menu.Dashboard'),
      <Gauge style={admin} size="1em" />,
      'projectAdmin',
    ),
    entry(
      'project-admin-users',
      t('webui.menu.ProjectMembers'),
      <Users style={admin} size="1em" />,
      'projectAdmin',
    ),
    entry(
      'project-admin-session',
      t('webui.menu.ProjectSessions'),
      <BAISessionsIcon style={admin} />,
      'projectAdmin',
    ),
    entry(
      'project-admin-deployments',
      t('webui.menu.ProjectDeployments'),
      <BAIEndpointsIcon style={admin} />,
      'projectAdmin',
    ),
    entry(
      'credential',
      t('webui.menu.Users'),
      <User style={admin} size="1em" />,
      'admin',
    ),
    entry(
      'project',
      t('webui.menu.Projects'),
      <Users style={admin} size="1em" />,
      'admin',
    ),
    entry(
      'admin-data',
      t('webui.menu.Data'),
      <CloudUpload style={admin} size="1em" />,
      'admin',
    ),
    entry(
      'admin-session',
      t('webui.menu.Sessions'),
      <BAISessionsIcon style={admin} />,
      'admin',
    ),
    entry(
      'admin-deployments',
      t('webui.menu.Deployments'),
      <BAIEndpointsIcon style={admin} />,
      'admin',
    ),
    entry(
      'environment',
      t('webui.menu.Environments'),
      <FileCheck style={admin} size="1em" />,
      'admin',
    ),
    entry(
      'reservoir',
      t('webui.menu.Reservoir'),
      <PackagePlus style={admin} />,
      'admin',
    ),
    entry(
      'scheduler',
      t('webui.menu.Scheduler'),
      <ClipboardClock style={admin} />,
      'admin',
    ),
    entry(
      'resource-policy',
      t('webui.menu.ResourcePolicies'),
      <FileUser style={admin} size="1em" />,
      'admin',
    ),
    entry(
      'agent',
      t('webui.menu.Resources'),
      <HardDrive style={admin} size="1em" />,
      'admin',
    ),
    entry(
      'maintenance',
      t('webui.menu.Maintenance'),
      <Wrench style={admin} size="1em" />,
      'admin',
    ),
    entry(
      'diagnostics',
      t('webui.menu.Diagnostics'),
      <Activity style={admin} />,
      'admin',
    ),
    entry(
      'rbac',
      t('webui.menu.RBACManagement'),
      <BadgeCheck style={admin} size="1em" />,
      'admin',
    ),
    entry(
      'branding',
      t('webui.menu.Branding'),
      <Palette style={admin} />,
      'admin',
    ),
    entry(
      'information',
      t('webui.menu.Information'),
      <Info style={admin} size="1em" />,
      'admin',
    ),
    entry(
      'system-settings',
      t('webui.menu.SystemSettings'),
      <Settings2 style={admin} size="1em" />,
      'admin',
    ),
    // A tab of System Settings, not a sidebar entry; the key still governs it.
    entry(
      'settings',
      t('webui.menu.Configurations'),
      <SlidersHorizontal style={admin} size="1em" />,
      'admin',
    ),
  ];
};
