/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx ticket 24 — the sider shell.

 PILOT-DECISION: antd `Layout.Sider` → Astryx `SideNav` (MAPPING §5:
 `Layout`/`Sider` → `AppShell` + `SideNav`, "richer than antd"). The sibling
 half of that recipe — `AppShell` — was adopted in FR-3612; this shell now
 mounts inside AppShell's `sideNav` slot (see `MainLayout.tsx`).

 Mapping applied:
   width={240}          -> theme default `components['side-nav'].width`.
                           Ticket 24 originally took SideNav's own 260px on
                           the visual-values policy; users read the 20px
                           difference immediately, and a rail width is a
                           page-layout metric the app owns rather than a
                           component look, so it is pinned in the theme.
   collapsedWidth={74}  -> `.bai-sider--collapsed` in BAISider.css (SideNav's
                           own collapsed rail is `--spacing-12`, 48px, and the
                           collapsed state is not theme-addressable)
   collapsed/onCollapse -> collapsible={{isCollapsed, onCollapsedChange,
                           hasButton: false}} (controlled; the app already
                           owns the state, incl. the `[` shortcut, and draws
                           its own hover-revealed toggle)
   breakpoint="md"      -> the caller's `useBAIBreakpoint()` effect
                           (RESPONSIVE-POLICY R3; Astryx has no breakpoint
                           system, MAPPING §3.9)
   trigger={null}       -> `hasButton: false`
   children             -> split into SideNav's `header` / `children` /
                           `footer` slots, which is what the hand-rolled
                           sticky logo band + scroll column + footer were
                           approximating.

 DROPPED:
 - The nested `ConfigProvider algorithm={darkAlgorithm}` that gave the sider
   an independent light/dark polarity: the Astryx equivalent is a nested
   `<Theme mode>`, and the caller (`WebUISider`) owns that decision via
   `AstryxReverseTheme`, so this shell no longer re-themes anything (P11).
 - `boxShadow: '0px 0px 10px rgba(0,0,0,0.10)'` on the rail — kept, because
   it is the only thing separating the sider from the content column in the
   light theme, and it is a plain CSS value, not an antd token.
 - `xs ? 0 : collapsedWidth` (the phone-width "collapse to nothing" rule):
   `SideNav` has no zero-width state, so the caller hides the whole rail
   instead — see `WebUISider`.

 THE SHELL WRAPPER (regression fix, 2026-08-08)
 ----------------------------------------------
 `SideNav`'s own StyleX rule is only `width: 260` — no `flex-shrink: 0` — so
 as a flex item next to a wide content column the rail SHRANK (measured 117px
 against the declared 260px, truncating every menu label). antd `Layout.Sider`
 emitted `flex: 0 0 <width>px` for exactly this reason; this wrapper keeps
 that contract. Since FR-3612 the rail mounts inside AppShell's `sideNav`
 panel (itself `flex-shrink: 0`), so this is now defence in depth, and the
 heights are `100%` — the shell fills the panel, which the AppShell `banner`
 slot may shorten below the viewport.

 It also un-clips the hover-revealed collapse toggle. `SideNav`'s root sets
 `overflow: hidden` and its scrollable column adds `overflow-x: hidden`, so
 the toggle — which by design protrudes `translateX(12px)` past the rail's
 right edge — had its outer half cut off while it was rendered as a `SideNav`
 CHILD (i.e. inside the scroll column). `overlay` renders it as a SIBLING of
 `SideNav` inside this `position: relative` shell, which is where antd's
 Sider used to put it: outside every clipping context, positioned against the
 rail's own box.
*/
import './BAISider.css';
import { SideNav } from '@astryxdesign/core/SideNav';
import classNames from 'classnames';
import React from 'react';

export interface BAISiderProps {
  className?: string;
  /**
   * Ref to the shell (the rail's positioning/hover box), not to `SideNav`
   * itself — callers use it for hover detection, which must include the
   * protruding `overlay` controls.
   */
  ref?: React.Ref<HTMLElement>;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  logo?: React.ReactNode;
  logoCollapsed?: React.ReactNode;
  /** Sticky footer area (terms links, version). */
  footer?: React.ReactNode;
  /**
   * Controls anchored to the rail's box but rendered OUTSIDE `SideNav`'s
   * clipping contexts — the hover-revealed collapse toggle. Positioned
   * against this component's `position: relative` shell.
   */
  overlay?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * The legacy antd `Layout.Sider` metrics, restored (see the `width` note in
 * the file header). These constants are the single source of truth for
 * callers that need the rail's footprint; the values themselves are applied
 * in the theme (expanded, `SIDE_NAV_DENSITY`) and in `BAISider.css`
 * (collapsed, `.bai-sider--collapsed`) — Astryx `SideNav` takes no width prop.
 */
export const COLLAPSED_SIDER_WIDTH = 74;
export const SIDER_WIDTH = 240;

const BAISider: React.FC<BAISiderProps> = ({
  ref,
  children,
  logo,
  logoCollapsed,
  footer,
  collapsed = false,
  onCollapse,
  overlay,
  className,
}) => {
  'use memo';
  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className="bai-sider-shell"
      style={{
        position: 'relative',
        display: 'flex',
        // See "THE SHELL WRAPPER" in the file header: restores the
        // `flex: 0 0 <width>` contract antd's Layout.Sider provided and
        // Astryx delegates to AppShell.
        flexShrink: 0,
        height: '100%',
      }}
    >
      <SideNav
        className={classNames(
          'bai-sider',
          // The collapsed rail needs a selector of its own: `SideNav` reflects
          // no collapsed state onto the DOM (`themeProps('side-nav')` carries
          // no `data-*` for it), and the theme's nav-item density has to be
          // stood down at rail width. See `BAISider.css`.
          collapsed && 'bai-sider--collapsed',
          className,
        )}
        style={{
          boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.10)',
          height: '100%',
        }}
        collapsible={{
          isCollapsed: collapsed,
          onCollapsedChange: (isCollapsed) => onCollapse?.(isCollapsed),
          hasButton: false,
        }}
        header={
          <div className="logo-and-text-container draggable">
            <div className="logo-img-wrap non-draggable">
              <div style={{ display: collapsed ? 'none' : 'block' }}>
                {logo}
              </div>
              <div style={{ display: collapsed ? 'block' : 'none' }}>
                {logoCollapsed}
              </div>
            </div>
          </div>
        }
        footer={footer}
      >
        {children}
      </SideNav>
      {overlay}
    </div>
  );
};

BAISider.displayName = 'BAISider';
export default BAISider;
