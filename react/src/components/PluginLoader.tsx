/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * PluginLoader - React component that handles loading Backend.AI WebUI plugins.
 *
 * It:
 * 1. Reads plugin configuration from Jotai state (set during config initialization)
 * 2. Dynamically imports each plugin module (ES modules)
 * 3. Creates web component elements and appends them to a container
 * 4. Extracts metadata (menuitem, icon, group, permission) from each plugin element
 * 5. Updates Jotai plugin state atoms for navigation menu integration
 * 6. Manages plugin active/inactive state based on the current route
 */
import { pluginPathName, resolvePluginScriptUrl } from '../helper/pluginPath';
import { useCurrentMenuKey } from '../hooks/useRouteScope';
import { configLoadedState, loginConfigState } from '../hooks/useWebUIConfig';
import {
  type PluginPage,
  type WebUIPluginType,
  pluginApiEndpointState,
  pluginLoadedState,
  webUIPluginsState,
} from '../hooks/useWebUIPluginState';
import { useBAILogger } from 'backend.ai-ui';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';

interface PluginPageElement extends HTMLElement {
  active: boolean;
  permission?: string;
  menuitem?: string;
  icon?: string;
  group?: string;
  requestUpdate?: () => void;
}

/**
 * Internal atom to track whether the plugin loading process has started.
 * Prevents re-loading plugins on re-renders.
 */
const pluginLoadingStartedState = atom<boolean>(false);

function PluginLoader() {
  'use memo';

  // The effective login config carries `plugin.page` from the file, the
  // endpoint config merged by loadConfigFromWebServer, and the public
  // app-config override (`pluginPage`), whichever applies.
  const loginConfig = useAtomValue(loginConfigState);
  const configLoaded = useAtomValue(configLoadedState);
  const pluginNames =
    loginConfig && loginConfig.pluginPages.length > 0
      ? loginConfig.pluginPages
      : undefined;

  const apiEndpoint = useAtomValue(pluginApiEndpointState);
  const setWebUIPlugins = useSetAtom(webUIPluginsState);
  const setPluginLoaded = useSetAtom(pluginLoadedState);
  const loadingStarted = useAtomValue(pluginLoadingStartedState);
  const setLoadingStarted = useSetAtom(pluginLoadingStartedState);
  const { logger } = useBAILogger();
  const containerRef = useRef<HTMLDivElement>(null);
  const pluginElementsRef = useRef<Map<string, PluginPageElement>>(new Map());
  const loadingGuardRef = useRef(false);
  const currentMenuKey = useCurrentMenuKey();

  const loadPlugins = useCallback(
    async (pluginNames: string[]) => {
      if (pluginNames.length === 0) {
        setPluginLoaded(true);
        document.dispatchEvent(
          new CustomEvent('backend-ai-plugin-loaded', { detail: true }),
        );
        return;
      }

      const plugins: WebUIPluginType = {
        page: [],
        menuitem: [],
        'menuitem-user': [],
        'menuitem-admin': [],
        'menuitem-superadmin': [],
      };

      const pluginLoaderQueue: Promise<void>[] = pluginNames.map(
        async (path) => {
          const pluginUrl = resolvePluginScriptUrl(path, apiEndpoint);
          if (!pluginUrl) {
            logger.warn(
              `Invalid plugin path "${path}": use /-separated segments of letters, digits, "-" and "_"`,
            );
            return;
          }
          // The file name is the custom element and the page route.
          const page = pluginPathName(path);

          try {
            // `@vite-ignore` = Vite's equivalent of webpack's `webpackIgnore`.
            // pluginUrl is a runtime-computed path outside the module graph,
            // so we opt out of static analysis entirely.
            await import(/* @vite-ignore */ pluginUrl);

            const pageItem = document.createElement(page) as PluginPageElement;
            pageItem.classList.add('page');
            pageItem.setAttribute('name', page);

            // Append to the container div so the web component connects to the DOM.
            // Fall back to getElementById in case containerRef.current is transiently
            // null during the async import (can happen in React 19 concurrent mode).
            const container =
              containerRef.current ??
              document.getElementById('plugin-container');
            if (container) {
              container.appendChild(pageItem);
            }

            // Store reference for activation management
            pluginElementsRef.current.set(page, pageItem);

            plugins.menuitem.push(page);

            switch (pageItem.permission) {
              case 'superadmin':
                plugins['menuitem-superadmin'].push(page);
                break;
              case 'admin':
                plugins['menuitem-admin'].push(page);
                break;
              default:
                plugins['menuitem-user'].push(page);
            }

            const pluginPageData: PluginPage = {
              name: page,
              url: page,
              menuitem: pageItem.menuitem ?? '',
              icon: pageItem.icon,
              group: pageItem.group,
            };
            plugins.page.push(pluginPageData);
          } catch (error) {
            logger.warn(`Failed to load plugin "${path}":`, error);
          }
        },
      );

      await Promise.all(pluginLoaderQueue);

      // Set backward compat global
      (globalThis as Record<string, unknown>).backendaiPages = plugins.page;

      // Update Jotai state
      setWebUIPlugins(plugins);
      setPluginLoaded(true);

      // Dispatch backward compat event
      document.dispatchEvent(
        new CustomEvent('backend-ai-plugin-loaded', { detail: true }),
      );
    },
    [apiEndpoint, logger, setWebUIPlugins, setPluginLoaded],
  );

  // Mark plugins as loaded when config is loaded but no plugins are configured.
  // This replaces the logic that was previously in useInitializeConfig.
  useEffect(() => {
    if (
      configLoaded &&
      !pluginNames &&
      !loadingStarted &&
      !loadingGuardRef.current
    ) {
      setPluginLoaded(true);
      document.dispatchEvent(
        new CustomEvent('backend-ai-plugin-loaded', { detail: true }),
      );
    }
  }, [configLoaded, pluginNames, loadingStarted, setPluginLoaded]);

  // Load plugins when the plugin list becomes available.
  // In Electron, apiEndpoint must also be set before starting, because the plugin URL
  // is `${apiEndpoint}/dist/plugins/${page}.js`. If we start early with apiEndpoint=null,
  // the guard (loadingGuardRef + loadingStarted) is set and blocks any later retry
  // even after apiEndpoint becomes available.
  useEffect(() => {
    const isElectronEnv = (globalThis as Record<string, unknown>).isElectron;
    const canLoad =
      pluginNames &&
      !loadingStarted &&
      !loadingGuardRef.current &&
      (!isElectronEnv || !!apiEndpoint);

    if (canLoad) {
      loadingGuardRef.current = true;
      setLoadingStarted(true);
      loadPlugins(pluginNames).catch((error) => {
        logger.error('Unexpected error during plugin loading:', error);
        setPluginLoaded(true);
      });
    }
  }, [
    pluginNames,
    apiEndpoint,
    loadingStarted,
    setLoadingStarted,
    loadPlugins,
    logger,
    setPluginLoaded,
  ]);

  // Activate/deactivate plugin pages based on current route.
  // Match against the scope-aware menu key (route handle) rather than the raw
  // first pathname segment: under `/project/:name/<feature>` and
  // `/admin/<feature>` the first segment is the scope prefix. Flat plugin URLs
  // (`/<plugin-url>`, served by the catch-all) carry no handle, so
  // `useCurrentMenuKey()` falls back to the first pathname segment for them —
  // which is exactly the plugin element name.
  useEffect(() => {
    const currentPage = currentMenuKey || '';

    pluginElementsRef.current.forEach((element, name) => {
      if (name === currentPage) {
        element.setAttribute('active', '');
        element.active = true;
        element.style.display = 'block';
        element.style.flex = '1';
        element.style.minHeight = '0';
        element.requestUpdate?.();
      } else {
        element.active = false;
        element.removeAttribute('active');
        element.style.display = '';
        element.style.flex = '';
        element.style.minHeight = '';
      }
    });
  }, [currentMenuKey]);

  return (
    <div
      ref={containerRef}
      id="plugin-container"
      style={{ display: 'contents' }}
    />
  );
}

export default PluginLoader;
