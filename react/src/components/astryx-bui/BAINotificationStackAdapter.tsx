/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 GAP COMPONENT 5/5 (to-astryx ticket 08) — the thin adapter that turns
 `useBAINotification`'s `NotificationState[]` into
 `BAINotificationStackAstryx`'s presentational item list.

 It lives in its own file on purpose. `BAINotificationStackAstryx` must not
 import from `hooks/useBAINotification`, because that module pulls in antd
 (`App`, `antd-style`, `antd/lib/notification`) at RUNTIME — a presentational
 component that depends on it could never be part of an antd-free graph
 (P15: residue travels one hop further than a per-file grep sees).

 The input is typed STRUCTURALLY (`BAINotificationSource`, the subset of
 `NotificationState` this adapter actually reads) rather than as a type-only
 import of `NotificationState` from the hook module. A type-only import is
 erased at runtime, but the P15 import-graph gate
 (`scripts/migration-gates/antd-import-graph.mjs`) is static and counts it as
 an edge — and the gate's judgement is the one this directory must satisfy.
 `NotificationState` satisfies `BAINotificationSource` structurally, so the
 call site type-checks with no cast.

 With this split, rewiring the app is a ONE-FILE change in
 `useBAINotification.tsx`: delete the `app.notification.open()` effect and
 render

     <BAINotificationStackAstryx
       notifications={toBAINotificationStackItems(notifications, { … })}
       onClose={(key) => closeNotification(key)}
     />

 once, at the host that already mounts `useBAINotificationEffect`.

 The `type`/`backgroundTask.status` -> `BannerStatus` table is the only real
 decision in here, and it follows what `BAIGeneralNotificationItem` draws
 today: a pending task shows a clock (info), resolved a green check (success),
 rejected a red cross (error).
*/
import type { BAINotificationStackItem } from './BAINotificationStackAstryx';
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
  /** Renders the deferred `node` / `multiStep` bodies, if the host wires them. */
  renderExtra?: (notification: T) => React.ReactNode;
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
 * DROPPED here (not silently — each has a home elsewhere):
 *   `skipDesktopNotification` / the desktop `Notification` mirror -> stays a
 *   side effect in the hook. `placement` -> the stack owns its corner.
 *   `className` -> the antd-only notification-description margin patch,
 *   which has nothing to target any more (P6).
 */
export function toBAINotificationStackItems<T extends BAINotificationSource>(
  notifications: Array<T>,
  { onNavigate, renderExtra }: ToBAINotificationStackItemsOptions<T> = {},
): Array<BAINotificationStackItem> {
  return notifications
    .filter((notification) => notification.open !== false)
    .map((notification) => {
      const percent = notification.backgroundTask?.percent;
      const isPending = notification.backgroundTask?.status === 'pending';
      return {
        key: notification.key,
        title: notification.title ?? notification.message,
        description: notification.description,
        status: resolveStatus(notification),
        percent,
        // A task that has started but reported no progress yet: antd showed a
        // 0% bar, which reads as "stuck". An indeterminate bar reads as "busy".
        isProgressIndeterminate: isPending && percent === undefined,
        actionText: notification.toText,
        onAction: notification.to
          ? () => onNavigate?.(notification)
          : undefined,
        onRetry: notification.onRetry ?? undefined,
        onCancel: notification.onCancel ?? undefined,
        duration:
          typeof notification.duration === 'number'
            ? notification.duration
            : null,
        children: renderExtra?.(notification),
      } satisfies BAINotificationStackItem;
    });
}
