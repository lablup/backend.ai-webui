import { BannerStatus } from '@astryxdesign/core/Banner';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
export interface BAINotificationStackProps {
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
declare const BAINotificationStack: React.FC<BAINotificationStackProps>;
export default BAINotificationStack;
