import { ConfigProvider, Menu, MenuProps, theme } from 'antd';
import _ from 'lodash';
import React from 'react';

interface BAIMenuProps extends MenuProps {}

// workaround for style change in user / admin menu
const administratorMenu = [
  'system_overview',
  'credential',
  'environment',
  'resource-policy',
  'agent',
  'settings',
  'maintenance',
  'information',
];

const BAIMenu: React.FC<BAIMenuProps> = ({ ...props }) => {
  const { token } = theme.useToken();
  const isAdminMenu = () => {
    return _.some(props?.selectedKeys, (element) =>
      _.includes(administratorMenu, element),
    );
  };
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
              itemMarginInline: 0,
              colorPrimaryBorder: isAdminMenu()
                ? token.colorSuccess
                : token.colorInfoHover,
              itemHoverBg: isAdminMenu()
                ? token.colorSuccessBgHover
                : token.colorInfoHover,
              itemHoverColor: isAdminMenu()
                ? token.colorSuccessHover
                : token.colorPrimaryBg,
              itemSelectedBg: isAdminMenu()
                ? token.colorSuccessBgHover
                : token.colorInfoHover,
              itemSelectedColor: isAdminMenu()
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
