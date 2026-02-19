/**
 * PluginLoader - React component that handles loading Backend.AI WebUI plugins.
 *
 * This component replaces the Lit-based plugin loading system that was previously
 * in backend-ai-webui.ts. It:
 * 1. Reads plugin configuration from Jotai state (set by Lit shell via event)
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
  webUIPluginsState,
} from '../hooks/useWebUIPluginState';
import { usePluginConfigStringValue } from '../hooks/useWebUIPluginState';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface BackendAIPageElement extends HTMLElement {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const pluginElementsRef = useRef<Map<string, BackendAIPageElement>>(
    new Map(),
  );
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

            const pageItem = document.createElement(
              page,
            ) as BackendAIPageElement;
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
          } catch {
            // Failed to load plugin - skip it silently
            // The plugin may not exist or may have a syntax error
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
    [apiEndpoint, setWebUIPlugins, setPluginLoaded],
  );

  // Load plugins when config string becomes available
  useEffect(() => {
    if (pluginConfigString && !loadingStarted) {
      setLoadingStarted(true);
      loadPlugins(pluginConfigString);
    }
  }, [pluginConfigString, loadingStarted, setLoadingStarted, loadPlugins]);

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
