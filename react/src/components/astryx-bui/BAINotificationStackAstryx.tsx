/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 GAP COMPONENT 5/5 (cn-oss-removal / ticket 10) — `BAINotificationStack`.

 Executes ticket 07's verdict: antd's `notification` has **no Astryx
 counterpart**. `Banner` covers the persistent, in-flow half; the floating
 stack is NONE. `Toast` is not the substitute either — these notices carry a
 background-task progress bar, retry / cancel actions and a navigation link,
 and several of them stack at once, which is more than a toast is.

 BLAST RADIUS is exactly one file: `react/src/hooks/useBAINotification.tsx`,
 the single place that calls `app.notification.open()` / `.destroy()`. Read
 that file for the shape being replaced:

   - it opens every notice with `placement: 'bottomRight'` (hence the corner
     this component anchors to) and suppresses antd's own header, putting all
     content into `description`;
   - `NotificationState` carries `key`, `message`, `description`, `type`,
     `duration`, `to`/`toText` (a navigation link), `backgroundTask`
     ({status, percent}), `onCancel`, `onRetry`, `open`, `icon: 'folder'`,
     `skipDesktopNotification`, `node` (a Relay fragment) and `multiStep`.

 This component is the PRESENTATIONAL layer only. The jotai hook is not
 rewired here — see `BAINotificationStackAdapter.tsx` for the mapping that
 makes the future rewiring a one-file change.

 SUPPORTED (what the hook actually renders today): title, description, status
 icon/colour, background-task progress (determinate and indeterminate), the
 `to`/`toText` action link, retry + cancel buttons, per-notice auto-close
 duration, manual close, stacking with newest nearest the corner, enter/exit
 transitions that respect `prefers-reduced-motion`, and a `data-*` hook for
 e2e (`data-testid="bai-notification-stack"`, `data-notification-key`,
 `data-status`).

 DEFERRED, deliberately, and annotated rather than faked:
   - `node` -> `BAINodeNotificationItem` renders a Relay fragment; it needs a
     RelayEnvironment, so it stays a `children` slot the adapter fills.
   - `multiStep` -> `BAIMultiStepNotificationItem` is a step list with its own
     per-step status; it is a second component, not a prop on this one.
   - `extraDescription` (the "show more" disclosure) — Astryx `Banner` HAS a
     collapsible `children` area with a built-in toggle, which is the natural
     home; not wired until a call site needs it.
   - the desktop `Notification` mirror and `skipDesktopNotification` stay in
     the hook. They are a side effect, not a rendering concern.
   - `duration`-pause-on-hover: antd paused its timer while hovered. Not
     reproduced; recorded as a behaviour loss.
*/
import './astryxBui.css';
import { Banner } from '@astryxdesign/core/Banner';
import type { BannerStatus } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import React, { useEffect, useRef, useState } from 'react';

/** Matches `.bai-notification-stack-item`'s exit animation budget. */
const EXIT_ANIMATION_MS = 200;

export interface BAINotificationStackItem {
  key: React.Key;
  /** Headline. `NotificationState.title ?? .message`. */
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Drives the Banner icon and colour. @default 'info' */
  status?: BannerStatus;
  /** Background-task progress, 0-100. Omit for a notice with no task. */
  percent?: number;
  /** A task that is running with no measurable progress yet. */
  isProgressIndeterminate?: boolean;
  /** Accessible name for the progress bar (P8 — `label` is required). */
  progressLabel?: string;
  /** The `to` / `toText` link: "View folder", "Go to session". */
  actionText?: string;
  onAction?: () => void;
  /** `NotificationState.onRetry`. */
  retryText?: string;
  onRetry?: () => void;
  /** `NotificationState.onCancel`. */
  cancelText?: string;
  onCancel?: () => void;
  /**
   * Seconds until auto-close; `null` keeps it until dismissed. Mirrors antd's
   * `duration` (the hook uses `CLOSING_DURATION = 4` for settled tasks).
   */
  duration?: number | null;
  /** @default true */
  isClosable?: boolean;
  /** Overrides the status icon (`NotificationState.icon === 'folder'`). */
  icon?: React.ReactNode;
  /** Escape hatch for the deferred `node` / `multiStep` renderers. */
  children?: React.ReactNode;
}

export interface BAINotificationStackAstryxProps {
  /** Oldest first; the last entry renders nearest the corner. */
  notifications: Array<BAINotificationStackItem>;
  /** Fired by the close button and by the auto-close timer. */
  onClose?: (key: React.Key) => void;
  /**
   * Cap on simultaneously visible notices; the newest win.
   * antd had `maxCount` on the whole API. Unlimited by default, as today.
   */
  maxVisible?: number;
  'data-testid'?: string;
}

const BAINotificationStackItemView: React.FC<{
  item: BAINotificationStackItem;
  isExiting: boolean;
  onClose?: (key: React.Key) => void;
}> = ({ item, isExiting, onClose }) => {
  'use memo';
  const { key, duration } = item;

  useEffect(() => {
    if (duration === null || duration === undefined || isExiting) return;
    const timer = window.setTimeout(() => onClose?.(key), duration * 1000);
    return () => window.clearTimeout(timer);
    // `onClose` is intentionally not a dependency: a parent that re-creates the
    // callback each render would restart every timer on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, duration, isExiting]);

  const hasProgress =
    item.percent !== undefined || item.isProgressIndeterminate === true;

  const actions = (
    <HStack gap={2} align="center">
      {item.onCancel ? (
        <Button
          size="sm"
          variant="ghost"
          label={item.cancelText ?? 'Cancel'}
          onClick={item.onCancel}
        />
      ) : null}
      {item.onRetry ? (
        <Button
          size="sm"
          variant="secondary"
          label={item.retryText ?? 'Retry'}
          onClick={item.onRetry}
        />
      ) : null}
      {item.onAction && item.actionText ? (
        <Button
          size="sm"
          variant="ghost"
          label={item.actionText}
          onClick={item.onAction}
        />
      ) : null}
    </HStack>
  );

  const hasActions = !!(item.onCancel || item.onRetry || item.onAction);

  return (
    <div
      className="bai-notification-stack-item"
      data-exiting={isExiting ? 'true' : 'false'}
      data-notification-key={String(key)}
      data-status={item.status ?? 'info'}
    >
      <Banner
        status={item.status ?? 'info'}
        title={item.title}
        icon={item.icon}
        // A floating surface needs a shadow to detach from the page; `Banner`
        // defaults to `none` because it is normally in flow.
        elevation="high"
        isDismissable={item.isClosable ?? true}
        onDismiss={() => onClose?.(key)}
        endContent={hasActions ? actions : undefined}
        description={
          item.description || hasProgress ? (
            <VStack gap={2} align="stretch">
              {typeof item.description === 'string' ? (
                <Text type="supporting">{item.description}</Text>
              ) : (
                item.description
              )}
              {hasProgress ? (
                <ProgressBar
                  value={item.percent ?? 0}
                  max={100}
                  // Required string; hidden because the Banner title already
                  // names the task on screen (P8: a real name, not 'Progress').
                  label={
                    item.progressLabel ??
                    (typeof item.title === 'string' ? item.title : 'Task')
                  }
                  isLabelHidden
                  hasValueLabel={!item.isProgressIndeterminate}
                  isIndeterminate={item.isProgressIndeterminate}
                />
              ) : null}
            </VStack>
          ) : undefined
        }
      >
        {item.children}
      </Banner>
    </div>
  );
};

const BAINotificationStackAstryx: React.FC<BAINotificationStackAstryxProps> = ({
  notifications,
  onClose,
  maxVisible,
  'data-testid': testId,
}) => {
  'use memo';

  // Items that left `notifications` but are still playing their exit
  // animation. Without this the stack would pop rather than slide out — antd's
  // notification had a motion contract and losing it reads as a bug.
  const [exiting, setExiting] = useState<Array<BAINotificationStackItem>>([]);
  const previousRef = useRef<Array<BAINotificationStackItem>>([]);

  useEffect(() => {
    const currentKeys = new Set(notifications.map((n) => n.key));
    const removed = previousRef.current.filter((n) => !currentKeys.has(n.key));
    previousRef.current = notifications;
    if (removed.length === 0) return;
    setExiting((prev) => [...prev, ...removed]);
    const timer = window.setTimeout(() => {
      const removedKeys = new Set(removed.map((n) => n.key));
      setExiting((prev) => prev.filter((n) => !removedKeys.has(n.key)));
    }, EXIT_ANIMATION_MS);
    return () => window.clearTimeout(timer);
  }, [notifications]);

  const visible = maxVisible ? notifications.slice(-maxVisible) : notifications;
  const visibleKeys = new Set(visible.map((n) => n.key));
  const stillExiting = exiting.filter((n) => !visibleKeys.has(n.key));

  if (visible.length === 0 && stillExiting.length === 0) return null;

  return (
    <div
      className="bai-notification-stack"
      // e2e anchor: the stack, each notice, and each notice's status are
      // addressable without reaching into Astryx's own class names (P7).
      data-testid={testId ?? 'bai-notification-stack'}
      // Announcements are the individual Banners' job (`role="alert"` /
      // `role="status"`), so the container itself stays out of the a11y tree.
      role="presentation"
    >
      {stillExiting.map((item) => (
        <BAINotificationStackItemView
          key={item.key}
          item={item}
          isExiting
          onClose={onClose}
        />
      ))}
      {visible.map((item) => (
        <BAINotificationStackItemView
          key={item.key}
          item={item}
          isExiting={false}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default BAINotificationStackAstryx;
