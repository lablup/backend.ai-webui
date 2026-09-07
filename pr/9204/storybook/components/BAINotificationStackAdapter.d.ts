import { BAINotificationStackItem } from './BAINotificationStack';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
export interface ToBAINotificationStackItemsOptions<T extends BAINotificationSource> {
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
export declare function toBAINotificationStackItems<T extends BAINotificationSource>(notifications: Array<T>, { onNavigate, getActionText, renderContent, renderExtra, cancelText, retryText, }?: ToBAINotificationStackItemsOptions<T>): Array<BAINotificationStackItem>;
