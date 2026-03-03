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
import {
  type PluginPage,
  type WebUIPluginType,
  pluginApiEndpointState,
  pluginLoadedState,
  usePluginConfigStringValue,
  webUIPluginsState,
} from '../hooks/useWebUIPluginState';
import { useBAILogger } from 'backend.ai-ui';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

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

  const pluginConfigString = usePluginConfigStringValue();
  const apiEndpoint = useAtomValue(pluginApiEndpointState);
  const setWebUIPlugins = useSetAtom(webUIPluginsState);
  const setPluginLoaded = useSetAtom(pluginLoadedState);
  const loadingStarted = useAtomValue(pluginLoadingStartedState);
  const setLoadingStarted = useSetAtom(pluginLoadingStartedState);
  const { logger } = useBAILogger();
  const containerRef = useRef<HTMLDivElement>(null);
  const pluginElementsRef = useRef<Map<string, PluginPageElement>>(new Map());
  const loadingGuardRef = useRef(false);
  const location = useLocation();

  const loadPlugins = useCallback(
    async (configString: string) => {
      const pluginNames = configString
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

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
        async (page) => {
          const pluginUrl =
            (globalThis as Record<string, unknown>).isElectron && apiEndpoint
              ? `${apiEndpoint}/dist/plugins/${page}.js`
              : `../plugins/${page}.js`;

          try {
            await import(/* @vite-ignore */ pluginUrl);

            const pageItem = document.createElement(page) as PluginPageElement;
            pageItem.classList.add('page');
            pageItem.setAttribute('name', page);

            // Append to the container div so the web component connects to the DOM
            if (containerRef.current) {
              containerRef.current.appendChild(pageItem);
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
            logger.warn(`Failed to load plugin "${page}":`, error);
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

  // Load plugins when config string becomes available
  useEffect(() => {
    if (pluginConfigString && !loadingStarted && !loadingGuardRef.current) {
      loadingGuardRef.current = true;
      setLoadingStarted(true);
      loadPlugins(pluginConfigString).catch((error) => {
        logger.error('Unexpected error during plugin loading:', error);
        setPluginLoaded(true);
      });
    }
  }, [
    pluginConfigString,
    loadingStarted,
    setLoadingStarted,
    loadPlugins,
    logger,
    setPluginLoaded,
  ]);

  // Activate/deactivate plugin pages based on current route
  useEffect(() => {
    const currentPage = location.pathname.split('/')[1] || '';

    pluginElementsRef.current.forEach((element, name) => {
      if (name === currentPage) {
        element.active = true;
        element.requestUpdate?.();
      } else {
        element.active = false;
        element.removeAttribute('active');
      }
    });
  }, [location.pathname]);

  return (
    <div
      ref={containerRef}
      id="plugin-container"
      style={{ display: 'contents' }}
    />
  );
}

export default PluginLoader;
