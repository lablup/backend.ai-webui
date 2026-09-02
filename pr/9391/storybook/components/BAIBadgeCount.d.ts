import { BadgeProps } from '@astryxdesign/core/Badge';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIBadgeCountProps extends Omit<BadgeProps, 'label' | 'icon'> {
    /** The number (or node) shown in the overlay. antd `count`. */
    count?: number | React.ReactNode;
    /** Render a bare dot instead of a number. antd `dot`. */
    hasDot?: boolean;
    /**
     * Overflow ceiling — a count above this renders as `${max}+`.
     * antd's `overflowCount`.
     * @default 99
     */
    max?: number;
    /** Keep the overlay when `count` is 0. antd `showZero`. @default false */
    showZero?: boolean;
    /**
     * `[x, y]` pixel nudge of the overlay: +x moves right, +y moves down —
     * antd's sign convention, so the 2 measured sites port verbatim.
     */
    offset?: [number, number];
    /**
     * `small` shrinks the pill for dense rows (tab rails, table headers).
     * antd's `size="small"`, measured on 5 sites.
     * @default 'default'
     */
    size?: 'small' | 'default';
    /**
     * Accessible name for the overlay (P8). A dot has no text at all, and a bare
     * number rarely says what it counts — `title="3 unread notifications"`.
     */
    title?: string;
    /** The element the overlay is anchored to. */
    children?: React.ReactNode;
}
declare const BAIBadgeCount: React.FC<BAIBadgeCountProps>;
export default BAIBadgeCount;
