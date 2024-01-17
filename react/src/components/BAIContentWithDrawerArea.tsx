import { isOpenDrawerState } from './BAINotificationButton';
import { Layout } from 'antd';
import { BasicProps } from 'antd/lib/layout/layout';
import React from 'react';
import { useRecoilValue } from 'recoil';

interface Props extends BasicProps {
  drawerWidth?: number;
}
const BAIContentWithDrawerArea: React.FC<Props> = ({
  drawerWidth = 256,
  ...contextProps
}) => {
  const isOpenDrawer = useRecoilValue(isOpenDrawerState);
  const extraStyle = `
    .main-layout-main-content{
      transition: margin-right 0.3s ease;
    }
    .main-layout-main-content.drawer-open{
      margin-right: ${drawerWidth}px;
    }
    .ant-drawer-content {
      box-shadow: none !important;
    }
  `;
  return (
    <>
      <style>{extraStyle}</style>
      <Layout.Content
        {...contextProps}
        className={
          `main-layout-main-content ${isOpenDrawer ? 'drawer-open ' : ' '}` +
          (contextProps.className || '')
        }
      />
    </>
  );
};

export default BAIContentWithDrawerArea;
