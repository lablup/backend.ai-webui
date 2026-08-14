/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 GAP COMPONENT 5/5 (to-astryx ticket 08) — `BAINotificationStack`.

 antd's `notification` has **no Astryx
 counterpart**. `Banner` covers the persistent, in-flow half; the floating
 stack is NONE. `Toast` is not the substitute either — these notices carry a
 background-task progress bar, retry / cancel actions and a navigation link,
 and several of them stack at once, which is more than a toast is.

 LIVE SINCE TICKET 29. `react/src/hooks/useBAINotification.tsx` — which used
 to be the single place calling antd's imperative notification API — now maps
 its jotai list through `BAINotificationStackAdapter` and renders this
 component from `BAINotificationStackHost`, mounted once in
 `components/NotificationHost.tsx`. The shape it feeds in:

   - the old opener anchored every notice to `placement: 'bottomRight'`, hence
     the corner this component anchors to;
   - `NotificationState` carries `key`, `message`, `description`, `type`,
     `duration`, `to`/`toText` (a navigation link), `backgroundTask`
     ({status, percent}), `onCancel`, `onRetry`, `open`, `icon: 'folder'`,
     `skipDesktopNotification`, `node` (a Relay fragment) and `multiStep`.

 This component stays the PRESENTATIONAL layer only: no routing, no i18n, no
 Relay, no jotai — the host injects all four, which is what keeps this file
 and the adapter inside the antd-free graph.

 SUPPORTED: title, description, status icon/colour, background-task progress
 (determinate and indeterminate), the `to`/`toText` action link, retry +
 cancel buttons, per-notice auto-close duration that pauses on hover/focus,
 manual close, a `content` slot for a caller-drawn notice body, a collapsible
 `children` disclosure, stacking with newest nearest the corner, enter/exit
 transitions that respect `prefers-reduced-motion`, and `data-*` hooks for
 e2e (`data-testid="bai-notification-stack"`, `data-notification-key`,
 `data-status`, `data-paused`).

 SETTLED IN TICKET 29 (the rewire), each item ticket 08 had deferred:
   - `node` / `multiStep` -> the `content` slot. Those two renderers draw a
     complete notice body of their own (folder/session link, status tag, step
     list), so they REPLACE title/description/progress rather than sitting
     under them; the adapter fills `content` and the Banner header renders it
     in place of the title.
   - `extraDescription` (the "show more" disclosure) -> `children`. Astryx
     `Banner` collapses `children` behind a built-in chevron toggle, which is
     exactly the disclosure antd's `BAIGeneralNotificationItem` hand-rolled.
   - `duration`-pause-on-hover -> IMPLEMENTED here (open decision #3). It is a
     timer that banks its remaining budget on pointer-enter / focus-in and
     resumes from it on leave / focus-out — ~15 lines, no new dependency, so
     the "drop it if it gets complex" clause never triggered.

 STILL DEFERRED:
   - the desktop `Notification` mirror and `skipDesktopNotification` stay in
     the hook. They are a side effect, not a rendering concern.
   - `icon: 'folder'`: every call site that sets it also sets `node`, so the
     folder glyph arrives with the `content` renderer. The `icon` prop below
     stays available for a call site that needs it alone.
*/
import './astryxBui.css';
import { Banner } from '@astryxdesign/core/Banner';
import type { BannerStatus } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import React, { useEffect, useEffectEvent, useRef, useState } from 'react';

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
   * Seconds until auto-close; `null` (or `0`, antd's own "stay open" value)
   * keeps it until dismissed. Mirrors antd's `duration` (the hook uses
   * `CLOSING_DURATION = 4` for settled tasks). The countdown pauses while the
   * notice is hovered or holds focus.
   */
  duration?: number | null;
  /** @default true */
  isClosable?: boolean;
  /** Overrides the status icon (`NotificationState.icon === 'folder'`). */
  icon?: React.ReactNode;
  /**
   * A complete notice body that REPLACES title / description / progress —
   * the `node` and `multiStep` renderers, which draw all three themselves.
   */
  content?: React.ReactNode;
  /** Collapsible disclosure below the header (`extraDescription`). */
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

  // `useEffectEvent` (project rule use-effect-event.md): the timer must not
  // restart when a parent re-creates the `onClose` callback each render, but
  // firing must still see the latest one.
  const fireClose = useEffectEvent(() => onClose?.(key));

  // Open decision #3 — antd paused the auto-close countdown while the notice
  // was hovered, and a notice that closes under the pointer the user moved
  // there to read it is the one loss the migration would actually be felt as.
  // `isPaused` also covers focus, so a keyboard user tabbing into the action
  // buttons gets the same reprieve a mouse user does.
  const [isPaused, setIsPaused] = useState(false);
  // `0` is antd's "stay open" value, not "close immediately".
  const autoCloseMs =
    typeof duration === 'number' && duration > 0 ? duration * 1000 : null;
  // What is left of the countdown. Banked by the timer effect's cleanup so a
  // pause/resume cycle continues rather than restarts.
  const remainingMsRef = useRef<number | null>(autoCloseMs);

  // A fresh duration is a fresh budget (a background task that settles swaps
  // `duration: 0` for `CLOSING_DURATION`). React runs every cleanup before
  // every effect, so this lands after the timer effect's cleanup banked the
  // old value and before the timer effect below reads it.
  useEffect(() => {
    remainingMsRef.current = autoCloseMs;
  }, [autoCloseMs]);

  useEffect(() => {
    if (autoCloseMs === null || isExiting || isPaused) return;
    const budget = remainingMsRef.current ?? autoCloseMs;
    const startedAt = Date.now();
    const timer = window.setTimeout(() => fireClose(), budget);
    return () => {
      window.clearTimeout(timer);
      remainingMsRef.current = Math.max(0, budget - (Date.now() - startedAt));
    };
  }, [autoCloseMs, isExiting, isPaused]);

  const hasProgress =
    item.percent !== undefined || item.isProgressIndeterminate === true;

  // Actions go in the Banner's `endContent` — the slot Banner's own anatomy
  // names for them ("Action button ... a button for the user to act on the
  // message"). Ticket 29 had moved them into the description column instead,
  // to keep the 384px stack from wrapping the title onto three lines; the
  // user accepted that squeeze in exchange for using the component as
  // designed, so POLISH-3 supersedes that PILOT-DECISION. `wrap="wrap"` is
  // what absorbs the narrow width: two buttons stack inside the end area
  // rather than pushing the header wider.
  const actions = (
    <HStack gap={2} align="center" justify="end" wrap="wrap">
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

  const hasOwnContent = item.content != null;

  return (
    <div
      className="bai-notification-stack-item"
      data-exiting={isExiting ? 'true' : 'false'}
      data-notification-key={String(key)}
      data-status={item.status ?? 'info'}
      // e2e/measure anchor for the hover-pause contract.
      data-paused={isPaused ? 'true' : 'false'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      // React's onFocus/onBlur are the delegated focusin/focusout pair, so
      // focus anywhere inside the notice counts.
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <Banner
        status={item.status ?? 'info'}
        // `content` is a whole notice body (the `node` / `multiStep`
        // renderers); it takes the header's content column outright.
        // `Banner`'s `title`/`description` are plain unlabelled `<div>`s
        // (no stable class of their own), so the header text gets a
        // `data-testid` here — the one stable e2e anchor for "the notice's
        // headline" (`NotificationHandler.getNotificationMessage`).
        title={
          hasOwnContent ? (
            item.content
          ) : (
            <span data-testid="notification-title">{item.title}</span>
          )
        }
        icon={item.icon}
        // A floating surface needs a shadow to detach from the page; `Banner`
        // defaults to `none` because it is normally in flow.
        elevation="high"
        isDismissable={item.isClosable ?? true}
        onDismiss={() => onClose?.(key)}
        // POLISH-3 item 1 (supersedes ticket 29 PILOT-DECISION 3).
        endContent={hasActions ? actions : undefined}
        description={
          hasOwnContent ? undefined : item.description || hasProgress ? (
            <VStack gap={2} align="stretch">
              {typeof item.description === 'string' ? (
                <Text type="supporting">
                  <span data-testid="notification-description">
                    {item.description}
                  </span>
                </Text>
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
      // A manual popover, so the stack enters the CSS top layer — a fixed
      // div's z-index cannot compete with a modal <dialog>'s backdrop there.
      // `data-bai-top-layer` opts into the app-shim's re-promotion on modal
      // open; notices stay inert while a modal is open (FR-3486). Mirrors
      // Astryx ToastViewport's own top-layer promotion.
      popover="manual"
      data-bai-top-layer=""
      ref={(el) => {
        // API guard first: `:popover-open` throws in matches() where the
        // Popover API is missing (the CSS fallback keeps the stack visible).
        if (
          el &&
          typeof el.showPopover === 'function' &&
          !el.matches(':popover-open')
        ) {
          el.showPopover();
        }
      }}
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
