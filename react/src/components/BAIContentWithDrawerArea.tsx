/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { isOpenDrawerState } from './BAINotificationButton';
import { Grid, Layout, theme } from 'antd';
import { BasicProps } from 'antd/lib/layout/layout';
import { useAtomValue } from 'jotai';
import React from 'react';

interface Props extends BasicProps {
  drawerWidth?: number;
}
const BAIContentWithDrawerArea: React.FC<Props> = ({
  drawerWidth = 256,
  ...contextProps
}) => {
  const isOpenDrawer = useAtomValue(isOpenDrawerState);
  const { xl } = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const drawerStyle = xl && isOpenDrawer ? 'margin-style' : 'overlay-style';
  const extraStyle = `
    .main-layout-main-content{
      transition: margin-right 0.3s ease;
    }
    .main-layout-main-content.margin-style{
      margin-right: ${drawerWidth}px;
    }
    .ant-drawer-content-wrapper {
      ${
        drawerStyle === 'margin-style'
          ? `
          box-shadow: none !important;
          border-left: 1px solid ${token.colorBorder};
        `
          : ''
      }
    }
  `;
  return (
    <>
      <style>{extraStyle}</style>
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
