/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useBAINotificationEffect,
  useSetBAINotification,
} from '../hooks/useBAINotification';
import React, { useEffect, useEffectEvent } from 'react';

/**
 * Single, always-mounted notification host for the whole app.
 *
 * Mounted once inside antd's `<App>` in `DefaultProvidersForReactRoot`, so it
 * is alive on every route (login screen, interactive-login, edu-applauncher,
 * authenticated main layout, ...) regardless of authentication state. It is
 * the ONLY place that subscribes to the `add-bai-notification` DOM event and
 * (via `useBAINotificationEffect`) the only driver of antd toast open/close.
 *
 * History: notifications used to be driven from two places — the
 * authenticated header's BAINotificationButton (suspended until login) and a
 * `NotificationForAnonymous` fallback that mirrored the same DOM event for
 * pre-login screens, a bridge left over from the Lit shell era. Both being
 * mounted in the authenticated state opened duplicate toasts for keyless
 * events such as the logout "Clean up now…" message (FR-3076). Consolidating
 * to this single host removes that bug class entirely.
 */
const NotificationHost: React.FC = () => {
  'use memo';

  const { upsertNotification, clearNotification } = useSetBAINotification();
  useBAINotificationEffect();

  const handleAddNotification = useEffectEvent((e: Event) => {
    upsertNotification((e as CustomEvent).detail);
  });
  // No in-repo code dispatches `clear-bai-notification` anymore, but the
  // event pair is part of the runtime plugin surface (compiled Lit-template
  // plugins were built against a shell that consumed both events), so keep
  // the listener for compatibility.
  const handleClearNotification = useEffectEvent((e: Event) => {
    clearNotification((e as CustomEvent).detail?.key);
  });

  // Register once on mount; the handlers are stable `useEffectEvent` refs that
  // always read the latest upsert/clear, so no deps are needed.
  useEffect(() => {
    document.addEventListener('add-bai-notification', handleAddNotification);
    document.addEventListener(
      'clear-bai-notification',
      handleClearNotification,
    );
    return () => {
      document.removeEventListener(
        'add-bai-notification',
        handleAddNotification,
      );
      document.removeEventListener(
        'clear-bai-notification',
        handleClearNotification,
      );
    };
  }, []);

  return null;
};

export default NotificationHost;
