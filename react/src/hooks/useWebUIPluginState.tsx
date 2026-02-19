/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { atom, useAtomValue } from 'jotai';

export type PluginPage = {
  name: string;
  url: string;
  menuitem: string;
  icon?: string;
  group?: string;
};

export type WebUIPluginType = {
  page: PluginPage[];
  menuitem: string[];
  'menuitem-user': string[];
  'menuitem-admin': string[];
  'menuitem-superadmin': string[];
};

/**
 * Jotai atom holding the parsed plugin configuration string from config.toml.
 * Set directly by useInitializeConfig when config is loaded.
 */
export const pluginConfigStringState = atom<string | undefined>(undefined);

/**
 * Jotai atom holding the API endpoint for Electron plugin URL resolution.
 */
export const pluginApiEndpointState = atom<string | undefined>(undefined);

/**
 * Jotai atom holding the fully resolved plugin metadata.
 * Updated by PluginLoader after all plugin modules are imported and inspected.
 */
export const webUIPluginsState = atom<WebUIPluginType | undefined>(undefined);

/**
 * Jotai atom indicating whether plugin loading has completed.
 * Set to true by PluginLoader after all plugins are loaded,
 * or immediately if there are no plugins to load.
 */
export const pluginLoadedState = atom<boolean>(false);

export const useWebUIPluginValue = () => {
  return useAtomValue(webUIPluginsState);
};

export const useWebUIPluginLoadedValue = () => {
  return useAtomValue(pluginLoadedState);
};

export const usePluginConfigStringValue = () => {
  return useAtomValue(pluginConfigStringState);
};

/**
 * @deprecated Plugin config is now set directly by useInitializeConfig.
 * This hook is kept as a no-op for backward compatibility with MainLayout
 * that calls it. It will be removed in a future cleanup.
 */
export const useSetupWebUIPluginEffect = () => {
  // No-op: plugin config atoms are now set directly by useInitializeConfig
  // in react/src/hooks/useWebUIConfig.ts when config.toml is loaded.
};
