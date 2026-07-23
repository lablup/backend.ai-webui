/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { isOpenDrawerState } from './BAINotificationButton';
import { Grid, Layout } from 'antd';
import { createGlobalStyle } from 'antd-style';
import { BasicProps } from 'antd/lib/layout/layout';
import { useAtomValue } from 'jotai';
import React from 'react';

interface Props extends BasicProps {
  drawerWidth?: number;
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
  const { xl } = Grid.useBreakpoint();
  const drawerStyle: DrawerStyle =
    xl && isOpenDrawer ? 'margin-style' : 'overlay-style';
  return (
    <>
      <DrawerAreaGlobalStyle
        drawerWidth={drawerWidth}
        drawerStyle={drawerStyle}
      />
      <Layout.Content
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
