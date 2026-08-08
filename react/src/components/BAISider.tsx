/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx ticket 24 — the sider shell.

 PILOT-DECISION: antd `Layout.Sider` → Astryx `SideNav` (MAPPING §5:
 `Layout`/`Sider` → `AppShell` + `SideNav`, "richer than antd"). The sibling
 half of that recipe — `AppShell` — is deliberately NOT adopted; see
 `MainLayout.tsx` for that decision and its reasons.

 Mapping applied:
   width={240}          -> SideNav's own 260px (visual-values policy: take
                           the Astryx default, change it in the theme layer)
   collapsedWidth={74}  -> SideNav's own rail (`--spacing-12`, 48px)
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
*/
import './BAISider.css';
import { SideNav } from '@astryxdesign/core/SideNav';
import classNames from 'classnames';
import React from 'react';

export interface BAISiderProps {
  className?: string;
  ref?: React.Ref<HTMLElement>;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  logo?: React.ReactNode;
  logoCollapsed?: React.ReactNode;
  /** Sticky footer area (terms links, version). */
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export const COLLAPSED_SIDER_WIDTH = 48;
export const SIDER_WIDTH = 260;

const BAISider: React.FC<BAISiderProps> = ({
  ref,
  children,
  logo,
  logoCollapsed,
  footer,
  collapsed = false,
  onCollapse,
  className,
}) => {
  'use memo';
  return (
    <SideNav
      ref={ref}
      className={classNames('bai-sider', className)}
      style={{
        boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.10)',
        height: '100vh',
        position: 'relative',
      }}
      collapsible={{
        isCollapsed: collapsed,
        onCollapsedChange: (isCollapsed) => onCollapse?.(isCollapsed),
        hasButton: false,
      }}
      header={
        <div className="logo-and-text-container draggable">
          <div className="logo-img-wrap non-draggable">
            <div style={{ display: collapsed ? 'none' : 'block' }}>{logo}</div>
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
  );
};

BAISider.displayName = 'BAISider';
export default BAISider;
