/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './BAIAppShell.css';
import { AppShell, useAppShellMobile } from '@astryxdesign/core/AppShell';
import { MobileNav } from '@astryxdesign/core/MobileNav';
import { SideNavRenderContext } from '@astryxdesign/core/SideNav';
import { VStack } from '@astryxdesign/core/Stack';
import { useTheme } from '@astryxdesign/core/theme';
import classNames from 'classnames';
import React, {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  Suspense,
  useEffect,
  useEffectEvent,
  useState,
} from 'react';

/** The Backend.AI rail width — `MobileNav`'s own default is 320px. */
const DEFAULT_DRAWER_WIDTH = 240;

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
const BAIAppShell: React.FC<BAIAppShellProps> = ({
  'data-testid': dataTestId,
  banner,
  sideNav,
  drawer,
  pathname,
  variant = 'wash',
  contentPadding = 0,
  children,
}) => {
  'use memo';
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  // Same rule as a header band's right-side buttons: the brand band is a
  // REVERSED surface, so its content is on-dark in light mode and on-light in
  // dark mode.
  const { mode } = useTheme();

  // Close the drawer once a menu selection navigates
  // (adjust-state-during-render — setState-in-effect is lint-forbidden).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== undefined && prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileNavOpen(false);
  }

  let drawerElement: ReactElement | null = null;
  if (drawer) {
    const element = (
      <MobileNav
        data-testid={drawer['data-testid']}
        className={classNames(
          'bai-app-shell-drawer',
          mode === 'dark'
            ? 'bai-app-shell-drawer--on-light'
            : 'bai-app-shell-drawer--on-dark',
        )}
        label={drawer.label}
        width={drawer.width ?? DEFAULT_DRAWER_WIDTH}
        // Pin the drawer to the start edge (where the rail lives) instead of
        // `auto`, whose trigger-position heuristic defaults to `end` when no
        // trigger position is readable.
        side="start"
        header={
          <div className="bai-app-shell-drawer-brand">{drawer.header}</div>
        }
      >
        {/* `drawer-content` render mode makes every `SideNavItem` close the
            drawer on activation (the pathname-change reset only covers taps
            that navigate — not a window.open item or re-tapping the current
            page).

            `gap={0}`: a stack gap here lands BETWEEN the menu's own sections
            and stretches the row pitch past the rail's 44px. */}
        <SideNavRenderContext value="drawer-content">
          <VStack className="bai-nav-surface" align="stretch" gap={0}>
            {drawer.children}
          </VStack>
        </SideNavRenderContext>
      </MobileNav>
    );
    drawerElement = drawer.wrap?.(element) ?? element;
  }

  return (
    <AppShell
      data-testid={dataTestId}
      variant={variant}
      height="fill"
      contentPadding={contentPadding}
      banner={banner}
      sideNav={sideNav}
      mobileNav={
        drawerElement
          ? {
              // The host's own hamburger opens the drawer (via the AppShell
              // mobile context) — no auto toggle bar.
              hasToggle: false,
              breakpoint: 'md',
              isOpen: isMobileNavOpen,
              onOpenChange: setIsMobileNavOpen,
              content: <Suspense fallback={null}>{drawerElement}</Suspense>,
            }
          : false
      }
    >
      <MobileNavStateSync onLeaveMobile={() => setIsMobileNavOpen(false)} />
      {children}
    </AppShell>
  );
};

/**
 * Resets the drawer's controlled open state when the viewport leaves mobile.
 * Reads AppShell's OWN breakpoint verdict from the mobile context (it must be
 * the exact complement — a second media query would disagree at exactly 768px)
 * so a stale `true` can't pop the drawer back open on the next rotation below
 * the breakpoint.
 */
const MobileNavStateSync: React.FC<{ onLeaveMobile: () => void }> = ({
  onLeaveMobile,
}) => {
  'use memo';
  const { isMobile } = useAppShellMobile();
  const onLeave = useEffectEvent(onLeaveMobile);
  useEffect(() => {
    if (!isMobile) {
      onLeave();
    }
  }, [isMobile]);
  return null;
};

export default BAIAppShell;
