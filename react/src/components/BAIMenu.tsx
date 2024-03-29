import { ConfigProvider, Menu, MenuProps, theme } from 'antd';
import React from 'react';

// interface BAIMenuProps extends MenuProps {

// }

const BAIMenu: React.FC<MenuProps> = ({ ...props }) => {
  const { token } = theme.useToken();
  return (
    <>
      <style>
        {`
          .bai-menu li.ant-menu-item.ant-menu-item-selected {
            overflow: visible;
            font-weight: 600;
          }
          
          .bai-menu li.ant-menu-item.ant-menu-item-selected::before {
            left: 0px;
            top: 0;
            bottom: 0;
            position: absolute;
            right: auto;
            border-right: 3px solid ${token.colorPrimary};
            transform: scaleY(1);
            opacity: 1;
            content: "";
          }
          `}
      </style>
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
          mode="inline"
          {...props}
          className="bai-menu"
        />
      </ConfigProvider>
    </>
  );
};

export default BAIMenu;
