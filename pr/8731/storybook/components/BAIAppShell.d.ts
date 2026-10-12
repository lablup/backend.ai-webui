import { AppShell } from '@astryxdesign/core/AppShell';
import { default as React, ComponentProps, ReactElement, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIAppShellDrawer {
    /** Brand-band content (logo). Rendered on the accent band. */
    header?: ReactNode;
    /**
     * Nav content — rendered under `SideNavRenderContext value="drawer-content"`
     * inside a vertical stack with className `bai-nav-surface` and NO gap. Hosts
     * style nav metrics by targeting `.bai-nav-surface`.
     */
    children: ReactNode;
    /** Accessible label of the drawer dialog (host passes its own translation). */
    label?: string;
    /**
     * Drawer panel width in px.
     * @default 240
     */
    width?: number;
    /** Wraps the drawer element — the host's theme-polarity provider slot. */
    wrap?: (drawer: ReactElement) => ReactElement;
    'data-testid'?: string;
}
export interface BAIAppShellProps {
    'data-testid'?: string;
    /** Full-width slot above everything (announcements). */
    banner?: ReactNode;
    /** Inline side navigation, >=768px. */
    sideNav?: ReactNode;
    /** Mobile drawer (<768px). Omit to disable mobile nav entirely. */
    drawer?: BAIAppShellDrawer;
    /** Current route pathname; a CHANGE closes the drawer. */
    pathname?: string;
    /** @default 'wash' */
    variant?: ComponentProps<typeof AppShell>['variant'];
    /** @default 0 */
    contentPadding?: ComponentProps<typeof AppShell>['contentPadding'];
    children: ReactNode;
}
/**
 * Astryx `AppShell` wired as the Backend.AI shell frame (FR-3612): the inline
 * rail above the `md` breakpoint, a `MobileNav` drawer below it, and the
 * drawer's open state owned here.
 *
 * `MobileNav` is a native `<dialog>` shown via `showModal()` — focus trap,
 * body scroll lock and backdrop come built in. The host's own header hamburger
 * opens it through AppShell's mobile context, so no auto toggle bar is
 * rendered.
 */
declare const BAIAppShell: React.FC<BAIAppShellProps>;
export default BAIAppShell;
