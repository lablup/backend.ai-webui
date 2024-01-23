import { useCustomThemeConfig } from '../helper/customThemeConfig';
import { useWebUINavigate } from '../hooks';
import { useThemeMode } from '../hooks/useThemeMode';
import Flex from './Flex';
import { Grid, SiderProps, Typography, theme } from 'antd';
import Sider from 'antd/es/layout/Sider';
import _ from 'lodash';
import React, { useRef } from 'react';

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
  ...otherProps
}) => {
  const { token } = theme.useToken();
  const { Text } = Typography;
  const { isDarkMode } = useThemeMode();
  const { xs } = Grid.useBreakpoint();
  const themeConfig = useCustomThemeConfig();
  const logoRef = useRef<HTMLImageElement>(null);
  const logoCollapsedRef = useRef<HTMLImageElement>(null);
  const webuiNavigate = useWebUINavigate();

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
        `}
      </style>
      <Sider
        width={221}
        breakpoint="md"
        style={{
          overflowX: 'hidden',
          overflowY: 'auto',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          borderRight: '1px solid',
          borderColor: token.colorBorder,
          paddingTop: token.paddingContentVerticalSM,
        }}
        {...otherProps}
        collapsedWidth={
          xs
            ? 0
            : _.isNumber(otherProps.collapsedWidth)
            ? otherProps.collapsedWidth
            : DEFAULT_COLLAPSED_WIDTH
        }
        className="bai-sider"
        theme={isDarkMode ? 'dark' : 'light'}
      >
        <Flex
          direction="column"
          justify="start"
          align="start"
          style={{
            padding: otherProps.collapsed
              ? '12px 12px 12px 12px'
              : '12px 16px 12px 16px',
            overflow: 'visible',
            transition: 'all 0.2s ease-in-out',
            marginBottom: token.marginSM,
            marginTop: token.marginSM,
          }}
          className={'logo-and-text-container'}
        >
          <div className="logo-img-wrap">
            <div style={{ display: otherProps.collapsed ? 'none' : 'block' }}>
              {themeConfig?.logo ? (
                <img
                  className="logo-wide"
                  ref={logoRef}
                  src={
                    themeConfig?.logo?.src || '/manifest/backend.ai-text.svg'
                  }
                  alt={themeConfig?.logo?.alt || 'Backend.AI Logo'}
                  onClick={() =>
                    webuiNavigate(themeConfig?.logo?.href || '/summary')
                  }
                />
              ) : (
                logo
              )}
            </div>
            <div style={{ display: otherProps.collapsed ? 'block' : 'none' }}>
              {themeConfig?.logo ? (
                <img
                  className="logo-square"
                  ref={logoCollapsedRef}
                  src={
                    themeConfig?.logo?.srcCollapsed ||
                    '/manifest/backend.ai-text.svg'
                  }
                  alt={themeConfig?.logo?.alt || 'Backend.AI Logo'}
                  onClick={() =>
                    webuiNavigate(themeConfig?.logo?.href || '/summary')
                  }
                />
              ) : (
                logoCollapsed
              )}
            </div>
          </div>
          <div className="logo-title-wrap">
            <Typography.Text
              style={{
                fontSize: 16,
                lineHeight: '16px',
                fontWeight: 200,
                whiteSpace: 'nowrap',
              }}
            >
              {otherProps.collapsed
                ? themeConfig?.logo?.logoTitleCollapsed || logoTitleCollapsed
                : themeConfig?.logo?.logoTitle || logoTitle}
            </Typography.Text>
          </div>
        </Flex>
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
      </Sider>
    </>
  );
};

export default BAISider;
