/**
 * useLoginOrchestration - React hook that orchestrates the initial login flow.
 *
 * This replaces the login orchestration logic that was previously in the Lit
 * shell's firstUpdated() method (backend-ai-webui.ts). It handles:
 *
 * 1. Waiting for config.toml to be loaded
 * 2. Checking if backendaiclient is already connected
 * 3. Skipping orchestration for edu-applauncher/applauncher pages (React Router)
 * 4. Tab counting and auto-logout logic
 * 5. Triggering the appropriate login method
 *
 * The auto-logout logic checks whether:
 * - auto_logout is enabled in config
 * - This is the only open tab (via TabCount)
 * - The page was NOT reloaded (fresh navigation)
 * - More than 3 seconds have passed since the last window close
 * If all conditions are met, it logs out the stale session and shows the
 * login panel. Otherwise, it attempts a silent re-login.
 */
import TabCount from '../../../src/lib/TabCounter';
import { backendaiOptions } from '../global-stores';
import { loadConfigFromWebServer } from '../helper/loginSessionAuth';
import { autoLogoutState, configLoadedState } from './useWebUIConfig';
import { useAtomValue } from 'jotai';
import { useEffect, useEffectEvent, useRef } from 'react';

/**
 * Detect whether the current page load is a browser reload.
 */
function isPageReloaded(): boolean {
  const navEntries = window.performance.getEntriesByType('navigation');
  if (navEntries.length > 0) {
    return (navEntries as PerformanceNavigationTiming[]).some(
      (nav) => nav.type === 'reload',
    );
  }
  // Fallback for older browsers
  if (window.performance.navigation) {
    return window.performance.navigation.type === 1;
  }
  return false;
}

/**
 * Check whether the current URL path corresponds to an edu-applauncher or
 * applauncher route. These routes are handled entirely by React Router and
 * should not trigger the normal login orchestration.
 */
function isAppLauncherPage(): boolean {
  const currentPage = window.location.pathname.replace(/^\//, '').split('/')[0];
  return currentPage === 'edu-applauncher' || currentPage === 'applauncher';
}

/**
 * Check whether backendaiclient is connected and ready.
 */
function isClientConnected(): boolean {
  return (
    typeof globalThis.backendaiclient !== 'undefined' &&
    globalThis.backendaiclient !== null &&
    globalThis.backendaiclient.ready !== false
  );
}

interface UseLoginOrchestrationOptions {
  /**
   * Called to attempt a silent login (re-use existing session).
   * Equivalent to the old loginPanel.login(false).
   */
  onLogin: (showError?: boolean) => void;

  /**
   * Called to open the login panel for user interaction.
   * Equivalent to the old loginPanel.open().
   */
  onOpen: () => void;

  /**
   * Called to show a blocking error message.
   * Equivalent to the old loginPanel.block(message, type).
   */
  onBlock: (message: string, type: string) => void;

  /**
   * Called to check if a session login exists on the server.
   * Equivalent to the old loginPanel.check_login().
   */
  onCheckLogin: () => Promise<boolean>;

  /**
   * Called to log out the current session on the server.
   * Equivalent to the old loginPanel._logoutSession().
   */
  onLogoutSession: () => Promise<void>;

  /**
   * The current API endpoint URL.
   */
  apiEndpoint: string;

  /**
   * The current connection mode.
   */
  connectionMode: 'SESSION' | 'API';
}

/**
 * Hook that orchestrates the initial login flow.
 *
 * Should be called once in LoginView, after config initialization hooks.
 * The hook runs its effect when config becomes loaded.
 */
export function useLoginOrchestration({
  onLogin,
  onOpen,
  onBlock,
  onCheckLogin,
  onLogoutSession,
  apiEndpoint,
  connectionMode,
}: UseLoginOrchestrationOptions): void {
  const isConfigLoaded = useAtomValue(configLoadedState);
  const autoLogout = useAtomValue(autoLogoutState);

  // Guard against running the effect more than once
  const hasRunRef = useRef(false);

  // useEffectEvent captures the latest callback values without making
  // them dependencies of the useEffect below.
  const doOrchestrate = useEffectEvent(async () => {
    // If the client is already connected, nothing to do.
    if (isClientConnected()) return;

    // Edu-applauncher and applauncher pages are handled by React Router
    // routes that perform their own login flow.
    if (isAppLauncherPage()) return;

    try {
      // Load config from web server for Electron
      if (
        connectionMode === 'SESSION' &&
        (globalThis as Record<string, unknown>).isElectron
      ) {
        const ep =
          apiEndpoint ||
          localStorage
            .getItem('backendaiwebui.api_endpoint')
            ?.replace(/^"+|"+$/g, '') ||
          '';
        if (ep) {
          await loadConfigFromWebServer(ep);
        }
      }

      const tabcount = new TabCount();
      const reloaded = isPageReloaded();
      tabcount.tabsCount(true);

      if (autoLogout === true && tabcount.tabsCounter === 1 && !reloaded) {
        // Auto-logout scenario: single tab, fresh navigation, auto_logout enabled
        const isLoggedIn = await onCheckLogin();
        const currentTime = Date.now() / 1000;
        const lastCloseTime = backendaiOptions.get(
          'last_window_close_time',
          currentTime,
        );

        if (isLoggedIn && currentTime - lastCloseTime > 3.0) {
          // Stale session: logged in but window was closed more than 3s ago
          await onLogoutSession();
          onOpen();
        } else if (isLoggedIn) {
          // Recently closed window - try to re-login silently
          onLogin(false);
        } else {
          // Not logged in, show login panel
          onOpen();
        }
      } else {
        // Normal flow: attempt silent login
        onLogin(false);
      }
    } catch {
      // If orchestration fails, show a blocking error
      onBlock('Configuration is not loaded.', 'Error');
    }
  });

  useEffect(() => {
    if (!isConfigLoaded || hasRunRef.current) return;
    hasRunRef.current = true;

    doOrchestrate();
  }, [isConfigLoaded]);
}
