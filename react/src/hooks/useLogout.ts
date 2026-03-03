/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { backendaiOptions, backendaiUtils } from '../global-stores';
import React, { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/**
 * Clears all Backend.AI login-related localStorage keys and sessionStorage.
 */
function clearLoginStorage() {
  const keys = Object.keys(localStorage);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (/^(BackendAIWebUI\.login\.)/.test(key)) {
      localStorage.removeItem(key);
    }
  }
  sessionStorage.clear();
}

/**
 * Logs out the backendaiclient if it exists and is in SESSION mode,
 * then nullifies the global reference.
 */
async function logoutBackendAIClient() {
  if (
    typeof globalThis.backendaiclient !== 'undefined' &&
    globalThis.backendaiclient !== null
  ) {
    if (globalThis.backendaiclient._config.connectionMode === 'SESSION') {
      await globalThis.backendaiclient.logout();
    }
    globalThis.backendaiclient = null;
  }
}

/**
 * Session storage key used to signal that the current page load follows
 * an intentional logout. The login orchestration hook reads and clears
 * this flag to skip silent re-login and show the login panel directly.
 *
 * The flag is written AFTER clearLoginStorage() (which resets sessionStorage)
 * so that it survives into the next page load triggered by location.reload().
 */
export const INTENTIONAL_LOGOUT_FLAG = 'backendai_intentional_logout';

/**
 * Perform the full logout flow (framework-agnostic core):
 * 1. Delete recent project group info
 * 2. Show "cleaning up" notification
 * 3. Logout backendaiclient (SESSION mode)
 * 4. Clear localStorage/sessionStorage
 * 5. Set intentional-logout flag so the next page load skips auto-login
 *
 * Returns true if cleanup was performed, false if there was no client to
 * clean up.
 */
async function performLogoutCleanup(notificationMessage: string) {
  // Delete recent project group info.
  // Tolerate failure: backendaiutils or backendaiclient may not be
  // initialized yet, in which case there is nothing to delete.
  try {
    backendaiUtils._deleteRecentProjectGroupInfo();
  } catch {
    // Intentionally ignored -- project group info cleanup is best-effort.
  }

  if (
    typeof globalThis.backendaiclient !== 'undefined' &&
    globalThis.backendaiclient !== null
  ) {
    // Show cleanup notification
    document.dispatchEvent(
      new CustomEvent('add-bai-notification', {
        detail: {
          open: true,
          message: notificationMessage,
        },
      }),
    );

    await logoutBackendAIClient();
    clearLoginStorage();

    // Set the flag AFTER clearLoginStorage() so it is not erased by the
    // sessionStorage.clear() call inside clearLoginStorage().  The flag
    // persists across the upcoming location.reload() and is consumed by
    // useLoginOrchestration to suppress the silent re-login attempt.
    sessionStorage.setItem(INTENTIONAL_LOGOUT_FLAG, '1');

    return true;
  }
  return false;
}

/**
 * Electron-only: clean up login data when the app window is closing,
 * unless the user has chosen to preserve their login.
 *
 * The logout API call is performed before clearing storage so that
 * session tokens remain available for the server-side logout request.
 */
async function performAppCloseCleanup(notificationMessage: string) {
  if (backendaiOptions.get('preserve_login') === false) {
    document.dispatchEvent(
      new CustomEvent('add-bai-notification', {
        detail: {
          open: true,
          message: notificationMessage,
        },
      }),
    );

    await logoutBackendAIClient();
    clearLoginStorage();
  }
}

/**
 * Hook that provides logout and app-close functionality for Backend.AI WebUI.
 *
 * This hook:
 * - Provides a `logout` function that cleans up session data and redirects
 * - Provides a `closeAppWindow` function for Electron app-close cleanup
 *
 * Must be used within a React Router context (needs `useNavigate`).
 */
export function useLogout() {
  'use memo';

  const navigate = useNavigate();
  const { t } = useTranslation();

  /**
   * Perform the full logout flow including redirect:
   * 1. Clean up session data
   * 2. Redirect (Electron -> electronInitialHref, Web -> navigate + reload)
   */
  const logout = async (performClose = false, callbackURL = '/') => {
    const didCleanup = await performLogoutCleanup(t('webui.CleanUpNow'));

    if (didCleanup) {
      if (performClose) {
        // Do nothing. The window will be closed (Electron).
      } else if (globalThis.isElectron) {
        globalThis.location.href = globalThis.electronInitialHref;
      } else {
        // Use React Router navigate directly instead of dispatching
        // react-navigate CustomEvent through the Lit shell
        navigate(callbackURL, { replace: true });
        globalThis.location.reload();
      }
    }
  };

  /**
   * Electron-only: clean up login data when the app window is closing,
   * unless the user has chosen to preserve their login.
   */
  const closeAppWindow = async () => {
    await performAppCloseCleanup(t('webui.CleanUpLoginSession'));
  };

  return { logout, closeAppWindow };
}

/**
 * Effect hook that registers global event listeners for logout-related events.
 * Should be called once at the app level (e.g., in MainLayout).
 *
 * Registers:
 * - `backend-ai-logout` -> calls logout()
 * - `backend-ai-app-close` -> calls closeAppWindow() (Electron only)
 * - `beforeunload` -> saves last_window_close_time
 */
export function useLogoutEventListeners() {
  const { logout, closeAppWindow } = useLogout();

  // useEffectEvent captures the latest logout/closeAppWindow without
  // making them dependencies of the useEffect below.
  const onLogout = useEffectEvent((e: Event) => {
    const detail = (e as CustomEvent<{ callbackURL?: string }>).detail;
    logout(false, detail?.callbackURL);
  });

  const onAppClose = useEffectEvent(() => {
    closeAppWindow();
  });

  useEffect(() => {
    const handleBeforeUnload = () => {
      backendaiOptions.set(
        'last_window_close_time',
        new Date().getTime() / 1000,
      );
    };

    document.addEventListener('backend-ai-logout', onLogout);
    globalThis.addEventListener('beforeunload', handleBeforeUnload);

    if (globalThis.isElectron) {
      document.addEventListener('backend-ai-app-close', onAppClose);
    }

    return () => {
      document.removeEventListener('backend-ai-logout', onLogout);
      globalThis.removeEventListener('beforeunload', handleBeforeUnload);
      if (globalThis.isElectron) {
        document.removeEventListener('backend-ai-app-close', onAppClose);
      }
    };
  }, []);
}

/**
 * Standalone logout handler component that can be placed in any route.
 * Uses React Router's navigate for post-logout redirection.
 * Renders nothing -- only registers event listeners.
 */
export const LogoutEventHandler: React.FC = () => {
  useLogoutEventListeners();
  return null;
};
