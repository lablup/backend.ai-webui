import { ConfigProvider, Menu, MenuProps, theme } from 'antd';
import { createStyles } from 'antd-style';
import classNames from 'classnames';
import React from 'react';

const useStyle = createStyles(({ css, token }) => ({
  baiMenu: css`
    &.expanded ul.ant-menu-item-group-list li.ant-menu-item {
      padding-inline: ${token.padding}px !important;
    }

    &.expanded li div.ant-menu-item-group-title {
      padding-top: ${token.paddingMD}px;
      padding-left: ${token.paddingXL}px;
    }

    &.expanded li div.ant-menu-item-group-title div {
      border-bottom-width: 0 !important;
    }
    li div.ant-menu-item-group-title div span {
      font-weight: 500;
    }
  `,
}));

interface BAIMenuProps extends MenuProps {
  collapsed?: boolean;
}

const BAIMenu: React.FC<BAIMenuProps> = ({ collapsed, ...props }) => {
  const { styles } = useStyle();
  const { token } = theme.useToken();
  const colorPrimaryWithAlpha = `rgba(${parseInt(token.colorPrimary.slice(1, 3), 16)}, ${parseInt(token.colorPrimary.slice(3, 5), 16)}, ${parseInt(token.colorPrimary.slice(5, 7), 16)}, 0.15)`;

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            // set specific height and border radius for menu items
            itemHeight: 40,
            itemBorderRadius: 20,
            itemMarginInline: token.margin,
            itemSelectedBg: colorPrimaryWithAlpha,
            fontSize: token.fontSizeLG,
          },
        },
      }}
    >
      <Menu
        style={{
          backgroundColor: 'transparent',
          borderRight: 'none',
          // paddingRight: 4,
          userSelect: 'none',
        }}
        // mode=""
        {...props}
        className={classNames(
          'bai-menu',
          styles.baiMenu,
          collapsed ? 'collapsed' : 'expanded',
        )}
      />
    </ConfigProvider>
  );
};

export default BAIMenu;
