import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIDrawerProps {
    /** Whether the drawer is open. antd `Drawer`'s `open`. */
    open?: boolean;
    /** Close request (Escape, scrim click, the header close button). */
    onClose?: () => void;
    /** Header title. antd `Drawer`'s `title`. */
    title?: ReactNode;
    /** Header actions, rendered at the trailing edge. antd `Drawer`'s `extra`. */
    extra?: ReactNode;
    /**
     * Accessible name for the drawer. lab `Drawer` requires one because it has
     * no built-in heading to derive a name from. Defaults to `title` when the
     * title is a plain string.
     */
    label?: string;
    /** Panel size along the slide axis. antd `Drawer`'s `size`/`width`. */
    size?: number | string;
    /** Edge the panel slides from. @default 'end' */
    side?: 'start' | 'end' | 'top' | 'bottom';
    /**
     * Modal scrim, and with it the modality switch: `true` renders through
     * `BAIDrawerPortal` (modal band level + focus containment), `false` keeps
     * lab's native non-modal `show()` overlay.
     * antd `Drawer`'s `mask`. @default true
     */
    hasScrim?: boolean;
    /**
     * Body padding. antd's drawer body was `paddingLG` (24px) and a few call
     * sites zeroed it via `styles={{ body: { padding: 0 } }}`; pass `false` for
     * those and pad inside the content instead.
     * @default true
     */
    hasBodyPadding?: boolean;
    /** Extra class on the scrollable body region. */
    bodyClassName?: string;
    /**
     * Extra class on the header row. Used by the Electron-aware notification
     * drawer, which makes its header the frameless window's drag handle.
     */
    headerClassName?: string;
    children?: ReactNode;
}
/**
 * The project's drawer shell: lab `Drawer` plus the header arrangement antd's
 * `Drawer` produced — `[X] Title …… [extra]`, a divider, then a padded
 * scrollable body — so every detail drawer reads the way it did before the
 * Astryx migration. lab has no title bar of its own, only a floating
 * `hasCloseButton` glyph that overlaps whatever the content renders first;
 * that button is turned off here so there is one close affordance (qa2-c).
 */
declare const BAIDrawer: React.FC<BAIDrawerProps>;
export default BAIDrawer;
