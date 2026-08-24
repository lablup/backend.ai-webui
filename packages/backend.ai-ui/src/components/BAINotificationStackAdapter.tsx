/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 GAP COMPONENT 5/5 (to-astryx ticket 08) — the thin adapter that turns
 `useBAINotification`'s `NotificationState[]` into
 `BAINotificationStack`'s presentational item list.

 It lives in its own file on purpose. `BAINotificationStack` must not
 import from `hooks/useBAINotification`, because that module pulls in antd
 (`App`, `antd-style`, `antd/lib/notification`) at RUNTIME — a presentational
 component that depends on it could never be part of an antd-free graph
 (P15: residue travels one hop further than a per-file grep sees).

 The input is typed STRUCTURALLY (`BAINotificationSource`, the subset of
 `NotificationState` this adapter actually reads) rather than as a type-only
 import of `NotificationState` from the hook module. A type-only import is
 erased at runtime, but during the Astryx migration a static P15
 import-graph check counted it as a real edge regardless, so structural
 typing was the one guaranteed-safe choice — and it is kept that way.
 `NotificationState` satisfies `BAINotificationSource` structurally, so the
 call site type-checks with no cast.

 Ticket 29 did the rewire on exactly that seam: `useBAINotification.tsx` lost
 its `app.notification.open()` effect and gained `BAINotificationStackHost`,
 which `components/NotificationHost.tsx` now renders (one line) where it
 already mounts `useBAINotificationEffect`.

 The `type`/`backgroundTask.status` -> `BannerStatus` table is the only real
 decision in here, and it follows what `BAIGeneralNotificationItem` draws
 today: a pending task shows a clock (info), resolved a green check (success),
 rejected a red cross (error).
*/
import type { BAINotificationStackItem } from './BAINotificationStack';
import type { BannerStatus } from '@astryxdesign/core/Banner';
import type React from 'react';

/**
 * The subset of `NotificationState` (hooks/useBAINotification.tsx) this
 * adapter reads. Structural on purpose — see the header.
 */
export interface BAINotificationSource {
  key: React.Key;
  title?: React.ReactNode;
  /** Legacy antd `ArgsProps.message`, still set by older call sites. */
  message?: React.ReactNode;
  description?: React.ReactNode;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number | null;
  /** Presence enables the action button; navigation itself stays in the hook. */
  to?: unknown;
  toText?: string;
  open?: boolean;
  backgroundTask?: {
    status: 'pending' | 'rejected' | 'resolved';
    percent?: number;
  };
  onCancel?: (() => void) | null;
  onRetry?: (() => void) | null;
}

export interface ToBAINotificationStackItemsOptions<
  T extends BAINotificationSource,
> {
  /** Navigate to `notification.to` — the hook owns routing, not the view. */
  onNavigate?: (notification: T) => void;
  /**
   * Label for the `to` action. The host resolves it because `toText` /
   * `toTextKey` / the "See detail" fallback are an i18n concern and this
   * module is a pure mapper (translation frontier, spec §0).
   */
  getActionText?: (notification: T) => string | undefined;
  /**
   * The `node` / `multiStep` bodies. Each draws a complete notice of its own,
   * so what it returns REPLACES title / description / progress.
   */
  renderContent?: (notification: T) => React.ReactNode;
  /** The `extraDescription` disclosure, shown in the Banner's collapsible area. */
  renderExtra?: (notification: T) => React.ReactNode;
  /** Translated button labels; the view's own defaults are English literals. */
  cancelText?: string;
  retryText?: string;
}

function resolveStatus(notification: BAINotificationSource): BannerStatus {
  if (notification.backgroundTask) {
    switch (notification.backgroundTask.status) {
      case 'resolved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'info';
    }
  }
  switch (notification.type) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'info';
  }
}

/**
 * Map the jotai state to the presentational item list.
 *
 * Order in = order out; the host reverses so the newest notice sits nearest
 * the corner, which is where antd's `bottomRight` stack put it.
 *
 * DROPPED here (not silently — each has a home elsewhere):
 *   `skipDesktopNotification` / the desktop `Notification` mirror -> stays a
 *   side effect in the hook. `placement` -> the stack owns its corner.
 *   `className` -> the antd-only notification-description margin patch,
 *   which has nothing to target any more (P6).
 *   the 200/300-character `_.truncate` the antd item applied to
 *   message/description -> the stack is 384px wide and wraps; a hard clip on
 *   an error message is a worse default than a taller notice.
 */
export function toBAINotificationStackItems<T extends BAINotificationSource>(
  notifications: Array<T>,
  {
    onNavigate,
    getActionText,
    renderContent,
    renderExtra,
    cancelText,
    retryText,
  }: ToBAINotificationStackItemsOptions<T> = {},
): Array<BAINotificationStackItem> {
  return (
    notifications
      // `open === true`, not `!== false`: a notification that never asked to be
      // shown (no `open`) belongs to the drawer only. antd's opener made the
      // same distinction, and widening it here would float notices that have
      // never been toasts.
      .filter((notification) => notification.open === true)
      .map((notification) => {
        const percent = notification.backgroundTask?.percent;
        const isPending = notification.backgroundTask?.status === 'pending';
        const content = renderContent?.(notification);
        return {
          key: notification.key,
          title: notification.title ?? notification.message,
          description: notification.description,
          status: resolveStatus(notification),
          percent,
          // A task that has started but reported no progress yet: antd showed a
          // 0% bar, which reads as "stuck". An indeterminate bar reads as "busy".
          isProgressIndeterminate: isPending && percent === undefined,
          actionText: getActionText?.(notification) ?? notification.toText,
          onAction: notification.to
            ? () => onNavigate?.(notification)
            : undefined,
          onRetry: notification.onRetry ?? undefined,
          onCancel: notification.onCancel ?? undefined,
          cancelText,
          retryText,
          // antd treats `0` as "no auto-close" (the hook sets it on every
          // pending background task); the view's "stay open" value is `null`.
          duration:
            typeof notification.duration === 'number' &&
            notification.duration > 0
              ? notification.duration
              : null,
          content: content ?? undefined,
          children: renderExtra?.(notification),
        } satisfies BAINotificationStackItem;
      })
  );
}
