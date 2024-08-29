import Flex from './Flex';
import { ConfigProvider, Grid, SiderProps, Typography, theme } from 'antd';
import Sider from 'antd/es/layout/Sider';
import _ from 'lodash';
import React from 'react';

export interface BAISiderProps extends SiderProps {
  logoCollapsed?: React.ReactNode;
  logo?: React.ReactNode;
  logoTitleCollapsed?: React.ReactNode;
  logoTitle?: React.ReactNode;
  bottomText?: React.ReactNode;
}

export const DEFAULT_COLLAPSED_WIDTH = 74;
const BAISider: React.FC<BAISiderProps> = ({
  children,
  logo,
  logoCollapsed,
  logoTitle,
  logoTitleCollapsed,
  bottomText,
  theme: siderTheme,
  ...otherProps
}) => {
  const { token } = theme.useToken();
  const { Text } = Typography;
  const { xs } = Grid.useBreakpoint();

  return (
    <>
      <style>
        {`
          .bai-sider .ant-layout-sider-children {
            display: flex;
            flex-direction: column;
          }

          .bai-sider::-webkit-scrollbar {
            width: 0px;
          }
          
          .bai-sider::-webkit-scrollbar-track {
            background: transparent; 
          }
          
          .bai-sider::-webkit-scrollbar-thumb {
            background: transparent;
          }
          .bai-sider .draggable {
            -webkit-app-region: drag;
          }
          .bai-sider .non-draggable {
            -webkit-app-region: no-drag;
          }
          .bai-menu li.ant-menu-item.ant-menu-item-selected {
            border-radius: 20px;
            background-color: #FFE3B7 !important;
          }
          .bai-menu li.ant-menu-item.ant-menu-item-selected > span.ant-menu-title-content {
            color: #FF7A00 !important;
            font-weight: normal;
          }
          .bai-menu li.ant-menu-item.ant-menu-item-selected::before {
          width: 0px !important;
          }
          .bai-menu li.ant-menu-item.ant-menu-item-selected > span.anticon.ant-menu-item-icon {
            color: #FF7A00 !important;
          }
          .bai-menu span.ant-menu-title-content {
            color: #333;
          }
        `}
      </style>
      <Sider
        width={220}
        breakpoint="md"
        style={{
          overflowX: 'hidden',
          overflowY: 'auto',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          background: '#FFF',
          borderColor: token.colorBorder,
          paddingTop: token.paddingContentVerticalSM,
          scrollbarColor: 'auto',
        }}
        {...otherProps}
        collapsedWidth={
          xs
            ? 0
            : _.isNumber(otherProps.collapsedWidth)
              ? otherProps.collapsedWidth
              : DEFAULT_COLLAPSED_WIDTH
        }
        theme={siderTheme}
        className="bai-sider"
      >
        <ConfigProvider
          theme={{
            algorithm: siderTheme === 'dark' ? theme.darkAlgorithm : undefined,
          }}
        >
          {/* <Flex
            direction="column"
            justify="start"
            align="start"
            style={{
              padding: otherProps.collapsed
                ? `${12 + token.marginSM}px 12px 12px 12px`
                : `${12 + token.marginSM}px 16px 12px 16px`,
              overflow: 'visible',
              transition: 'all 0.2s ease-in-out',
              marginBottom: token.marginSM,
            }}
            className={'logo-and-text-container draggable'}
          >
            <div className="logo-img-wrap non-draggable">
              <div style={{ display: otherProps.collapsed ? 'none' : 'block' }}>
                {logo}
              </div>
              <div style={{ display: otherProps.collapsed ? 'block' : 'none' }}>
                {logoCollapsed}
              </div>
            </div>
            <div className="logo-title-wrap non-draggable">
              <Typography.Text
                style={{
                  fontSize: 16,
                  lineHeight: '16px',
                  fontWeight: 200,
                  whiteSpace: 'nowrap',
                }}
              >
                {otherProps.collapsed ? logoTitleCollapsed : logoTitle}
              </Typography.Text>
            </div>
          </Flex> */}
          {children}
          {bottomText && (
            <>
              <Flex style={{ flex: 1 }} />
              <Flex
                justify="center"
                direction="column"
                style={{
                  width: '100%',
                  padding: 20,
                  textAlign: 'center',
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: '12px',
                    wordBreak: 'normal',
                  }}
                >
                  {bottomText}
                </Text>
              </Flex>
            </>
          )}
        </ConfigProvider>
      </Sider>
    </>
  );
};

export default BAISider;
