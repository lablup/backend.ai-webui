/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAIBreakpoint } from '../theme-shim';
import { isOpenDrawerState } from './BAINotificationButton';
import { createGlobalStyle } from 'antd-style';
import { useAtomValue } from 'jotai';
import React from 'react';

// PILOT-DECISION: antd `Layout.Content` (MAPPING §5 `Layout` → COMPOSITION)
// carried no behaviour here — it is a `<main>`-ish block that this component
// only uses to hang a className on. It becomes a plain block element, and the
// props interface drops `antd/lib/layout/layout`'s `BasicProps` for the
// grepped surface (P1: MainLayout passes `drawerWidth` + `children` only).
//
// The `createGlobalStyle` block STAYS (ticket 33 owns the antd-style →
// plain-CSS pass): its `.ant-drawer-content-wrapper` rule is still live —
// WEBUINotificationDrawer is an antd `Drawer` until ticket 29 — and
// createGlobalStyle is what makes the injected <style> carry the CSP nonce.
interface Props {
  drawerWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

type DrawerStyle = 'margin-style' | 'overlay-style';

// Global rules that depend on the drawer's open/width state. createGlobalStyle
// injects a nonce'd emotion <style> (via the <StyleProvider nonce> in
// DefaultProviders), so it survives a strict CSP style-src policy — unlike a
// raw <style> element. The non-theme values (drawerWidth, drawerStyle) are
// forwarded as props; `theme` is antd-style's theme.
const DrawerAreaGlobalStyle = createGlobalStyle((props) => {
  const { drawerWidth, drawerStyle, theme } = props as unknown as {
    drawerWidth: number;
    drawerStyle: DrawerStyle;
    theme: { colorBorder: string };
  };
  return `
    .main-layout-main-content {
      transition: margin-right 0.3s ease;
    }
    .main-layout-main-content.margin-style {
      margin-right: ${drawerWidth}px;
    }
    .ant-drawer-content-wrapper {
      ${
        drawerStyle === 'margin-style'
          ? `box-shadow: none !important;
          border-left: 1px solid ${theme.colorBorder};`
          : ''
      }
    }
  `;
}) as unknown as React.FC<{ drawerWidth: number; drawerStyle: DrawerStyle }>;

const BAIContentWithDrawerArea: React.FC<Props> = ({
  drawerWidth = 256,
  ...contextProps
}) => {
  const isOpenDrawer = useAtomValue(isOpenDrawerState);
  // Responsive policy (ticket 14): JS behaviour branch — the drawer style is
  // a layout MODE, not a track layout, so it stays on the JS-side hook.
  const { xl } = useBAIBreakpoint();
  const drawerStyle: DrawerStyle =
    xl && isOpenDrawer ? 'margin-style' : 'overlay-style';
  return (
    <>
      <DrawerAreaGlobalStyle
        drawerWidth={drawerWidth}
        drawerStyle={drawerStyle}
      />
      <div
        {...contextProps}
        className={
          `main-layout-main-content ${drawerStyle}` +
          (contextProps.className || '')
        }
      />
    </>
  );
};

export default BAIContentWithDrawerArea;
