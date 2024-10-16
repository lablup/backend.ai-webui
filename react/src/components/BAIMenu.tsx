import { ConfigProvider, Menu, MenuProps, theme } from 'antd';
import React from 'react';

interface BAIMenuProps extends MenuProps {
  isAdminMenu?: boolean;
}
const BAIMenu: React.FC<BAIMenuProps> = ({ ...props }) => {
  const { token } = theme.useToken();
  return (
    <>
      <style>
        {`
          .bai-menu li.ant-menu-item.ant-menu-item-selected {
            overflow: visible;
          }
          
          .bai-menu li.ant-menu-item.ant-menu-item-selected::before {
            left: 0px;
            top: 0;
            bottom: 0;
            position: absolute;
            right: auto;
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
              itemBorderRadius: 20,
              itemMarginInline: 14,
              colorPrimaryBorder: props.isAdminMenu
                ? token.colorSuccess
                : token.colorInfoHover,
              itemHoverBg: props.isAdminMenu
                ? token.colorSuccessBgHover
                : token.colorInfoHover,
              itemHoverColor: props.isAdminMenu
                ? token.colorSuccessHover
                : token.colorPrimaryBg,
              itemSelectedBg: props.isAdminMenu
                ? token.colorSuccessBgHover
                : token.colorInfoHover,
              itemSelectedColor: props.isAdminMenu
                ? token.colorSuccessHover
                : token.colorPrimaryBg,
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
