/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
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
import { backendaiOptions } from '../global-stores';
import { loadConfigFromWebServer } from '../helper/loginSessionAuth';
import TabCount from '../lib/TabCounter';
import { INTENTIONAL_LOGOUT_FLAG } from './useLogout';
import { autoLogoutState, configLoadedState } from './useWebUIConfig';
import { useBAILogger } from 'backend.ai-ui';
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

/**
 * Read the in-memory client's current endpoint (trailing slashes stripped),
 * or `''` if no client is bound. `_config` is not part of the published
 * BackendAIClient surface, so the structural escape hatch is contained here.
 */
function getConnectedEndpoint(): string {
  const client = globalThis.backendaiclient as
    | (BackendAIClient & { _config?: { endpoint?: string } })
    | null
    | undefined;
  return (client?._config?.endpoint ?? '').replace(/\/+$/, '');
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

  /**
   * Dev-only: when set, the orchestrator forces this endpoint. If a
   * previously-connected backend client targets a different endpoint,
   * it is logged out and the login panel is opened so the user lands
   * on the dev-targeted backend instead of resuming a stale session.
   *
   * Sourced from VITE_DEFAULT_API_ENDPOINT in dev mode; ignored in
   * production builds.
   */
  enforcedEndpoint?: string;
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
  enforcedEndpoint,
}: UseLoginOrchestrationOptions): void {
  const isConfigLoaded = useAtomValue(configLoadedState);
  const autoLogout = useAtomValue(autoLogoutState);
  const { logger } = useBAILogger();

  // Guard against running the effect more than once
  const hasRunRef = useRef(false);

  // Normalize the enforced endpoint the same way getConnectedEndpoint()
  // normalizes the connected client's endpoint so a trailing-slash or
  // surrounding-whitespace difference doesn't trigger a false mismatch.
  const normalizedEnforcedEndpoint = enforcedEndpoint
    ?.trim()
    .replace(/\/+$/, '');

  // useEffectEvent captures the latest callback values without making
  // them dependencies of the useEffect below.
  const doOrchestrate = useEffectEvent(async () => {
    // Edu-applauncher and applauncher pages are handled by React Router
    // routes that perform their own login flow.
    if (isAppLauncherPage()) return;

    // Dev-only: when an enforced endpoint is supplied (from
    // VITE_DEFAULT_API_ENDPOINT) and the in-memory client targets a
    // different backend, log it out and surface the login panel rather
    // than letting the orchestrator resume the stale session.
    if (normalizedEnforcedEndpoint && isClientConnected()) {
      const connectedEp = getConnectedEndpoint();
      if (connectedEp !== normalizedEnforcedEndpoint) {
        // Consume any pending intentional-logout flag so the next
        // orchestration pass doesn't redundantly short-circuit on it.
        sessionStorage.removeItem(INTENTIONAL_LOGOUT_FLAG);
        try {
          await onLogoutSession();
        } catch (err) {
          // Best-effort: the stale client may already be unreachable.
          // Log so dev-only enforced-endpoint behavior stays debuggable.
          logger.warn(
            'enforcedEndpoint: stale-session logout failed; continuing to clear client and open login panel',
            err,
          );
        }
        // onLogoutSession only logs the client out on the server; it does
        // not clear the global ref. Null it here so isClientConnected()
        // returns false on the next orchestration pass.
        globalThis.backendaiclient = null;
        onOpen();
        return;
      }
    }

    // If the client is already connected, nothing to do.
    if (isClientConnected()) return;

    // Check for intentional logout flag set by useLogout before the reload.
    // When present, skip silent re-login and show the login panel directly
    // so that the "Connecting to Cluster" modal never appears after logout.
    const wasIntentionalLogout =
      sessionStorage.getItem(INTENTIONAL_LOGOUT_FLAG) === '1';
    if (wasIntentionalLogout) {
      sessionStorage.removeItem(INTENTIONAL_LOGOUT_FLAG);
      onOpen();
      return;
    }

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
    // Wait until config is loaded before running the orchestration.
    //
    // When apiEndpoint is temporarily empty due to effect ordering
    // (setApiEndpoint() in LoginView runs in a separate useEffect on the
    // same render cycle), we want to avoid a premature silent session-login
    // attempt because connectUsingSession would receive an empty endpoint
    // and bail out before reaching the sToken check.
    //
    // However, an empty api_endpoint can also be intentional: the user may
    // need to enter it manually in the login UI. In that case the
    // orchestrator must still run so it can open the login panel.
    //
    // Therefore, only defer orchestration for a missing endpoint when a
    // stored sToken exists (or one arrives via URL) and a silent login or
    // SSO flow may be attempted. On Electron we still allow an empty
    // apiEndpoint because the orchestrator falls back to the
    // localStorage-persisted endpoint.
    const isElectron = !!(globalThis as Record<string, unknown>).isElectron;
    const hasStoredSessionToken =
      typeof window !== 'undefined' &&
      (window.localStorage.getItem('sToken') !== null ||
        window.sessionStorage.getItem('sToken') !== null ||
        new URLSearchParams(window.location.search).has('sToken'));

    if (!isConfigLoaded || hasRunRef.current) return;
    if (!apiEndpoint && !isElectron && hasStoredSessionToken) return;
    hasRunRef.current = true;

    doOrchestrate();
  }, [isConfigLoaded, apiEndpoint]);
}
