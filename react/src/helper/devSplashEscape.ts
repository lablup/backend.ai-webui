/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { INTENTIONAL_LOGOUT_FLAG } from '../hooks/useLogout';
import { escapeLoginProbe } from './loginSessionAuth';

function isSplashLoading(): boolean {
  const splash = document.getElementById('splash');
  return (
    !!splash &&
    !splash.classList.contains('splash-backdrop') &&
    !splash.classList.contains('splash-hidden')
  );
}

/**
 * Dev-only: Esc on the "Loading components…" splash reloads with the
 * intentional-logout flag, so the login form opens without a silent login.
 * Installed at boot, before any other window listener, because the boot step
 * that hangs may be one that keeps LoginView from mounting at all.
 */
export function installDevSplashEscape(): void {
  if (!import.meta.env.DEV) return;
  window.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'Escape' || !isSplashLoading()) return;
      e.stopImmediatePropagation();
      escapeLoginProbe();
      sessionStorage.setItem(INTENTIONAL_LOGOUT_FLAG, '1');
      window.location.reload();
    },
    true,
  );
}
