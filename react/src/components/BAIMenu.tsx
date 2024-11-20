import { ConfigProvider, Menu, MenuProps } from 'antd';
import React from 'react';

const BAIMenu: React.FC<MenuProps> = ({ ...props }) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemBorderRadius: 2,
            itemMarginInline: 0,
          },
        },
      }}
    >
      <Menu
        style={{
          backgroundColor: 'transparent',
          borderRight: 'none',
          paddingRight: 4,
        }}
        // mode=""
        {...props}
        className="bai-menu"
      />
    </ConfigProvider>
  );
};

export default BAIMenu;
