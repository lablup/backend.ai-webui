import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

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
 * Set when Lit dispatches 'backend-ai-plugin-config' with the raw
 * comma-separated plugin page names.
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
 * Hook that listens for 'backend-ai-plugin-config' events from the Lit shell
 * and stores the plugin config string in Jotai state.
 *
 * The Lit shell dispatches this event in loadConfig() with:
 * - pluginPages: the raw config.plugin.page string (e.g. "test-plugin1,test-plugin2")
 * - apiEndpoint: the login panel API endpoint for Electron plugin URL resolution
 *
 * If no plugin config exists, the Lit shell dispatches the event with an empty
 * pluginPages string so React can mark plugins as loaded immediately.
 */
export const useSetupWebUIPluginEffect = () => {
  'use memo';
  const setPluginConfigString = useSetAtom(pluginConfigStringState);
  const setPluginApiEndpoint = useSetAtom(pluginApiEndpointState);
  const setPluginLoaded = useSetAtom(pluginLoadedState);

  useEffect(() => {
    const handlePluginConfig = (e: Event) => {
      const detail = (
        e as CustomEvent<{ pluginPages: string; apiEndpoint?: string }>
      ).detail;
      const pluginPages = detail?.pluginPages ?? '';
      if (detail?.apiEndpoint) {
        setPluginApiEndpoint(detail.apiEndpoint);
      }
      if (pluginPages) {
        setPluginConfigString(pluginPages);
      } else {
        // No plugins to load, mark as loaded immediately
        setPluginLoaded(true);
      }
    };

    // Also handle legacy 'backend-ai-plugin-loaded' for backward compat
    const handleLegacyPluginLoaded = () => {
      setPluginLoaded(true);
    };

    document.addEventListener('backend-ai-plugin-config', handlePluginConfig);
    document.addEventListener(
      'backend-ai-plugin-loaded',
      handleLegacyPluginLoaded,
    );

    return () => {
      document.removeEventListener(
        'backend-ai-plugin-config',
        handlePluginConfig,
      );
      document.removeEventListener(
        'backend-ai-plugin-loaded',
        handleLegacyPluginLoaded,
      );
    };
  }, [setPluginConfigString, setPluginApiEndpoint, setPluginLoaded]);
};
