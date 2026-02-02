import { ConfigProvider, Grid, type SiderProps, theme } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { BAIFlex } from 'backend.ai-ui';
import classNames from 'classnames';
import _ from 'lodash';
import React, { forwardRef } from 'react';

export interface BAISiderProps extends SiderProps {
  logoCollapsed?: React.ReactNode;
  logo?: React.ReactNode;
}

export const COLLAPSED_SIDER_WIDTH = 74;
export const SIDER_WIDTH = 240;
const BAISider = forwardRef<HTMLDivElement, BAISiderProps>(
  (
    { children, logo, logoCollapsed, theme: siderTheme, ...otherProps },
    ref,
  ) => {
    const { token } = theme.useToken();
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
        `}
        </style>
        <Sider
          ref={ref}
          width={SIDER_WIDTH}
          breakpoint="md"
          style={{
            boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.10)',
            height: '100vh',
            scrollbarColor: 'auto',
          }}
          {...otherProps}
          collapsedWidth={
            xs
              ? 0
              : _.isNumber(otherProps.collapsedWidth)
                ? otherProps.collapsedWidth
                : COLLAPSED_SIDER_WIDTH
          }
          theme={siderTheme}
          className={classNames('bai-sider', otherProps.className)}
          trigger={null}
        >
          <ConfigProvider
            theme={{
              algorithm:
                siderTheme === 'dark' ? theme.darkAlgorithm : undefined,
            }}
          >
            <BAIFlex
              direction="column"
              align="stretch"
              style={{ height: '100%' }}
            >
              <BAIFlex
                direction="column"
                justify="center"
                align={otherProps.collapsed ? 'center' : 'start'}
                style={{
                  transition: 'all 0.2s ease-in-out',
                  backgroundColor: token.colorPrimary,
                  padding: otherProps.collapsed ? undefined : '0 30px',
                  height: token.Layout?.headerHeight || 60,
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
                className={'logo-and-text-container draggable'}
              >
                <div className="logo-img-wrap non-draggable">
                  <div
                    style={{ display: otherProps.collapsed ? 'none' : 'block' }}
                  >
                    {logo}
                  </div>
                  <div
                    style={{ display: otherProps.collapsed ? 'block' : 'none' }}
                  >
                    {logoCollapsed}
                  </div>
                </div>
              </BAIFlex>
              {children}
            </BAIFlex>
          </ConfigProvider>
        </Sider>
      </>
    );
  },
);

BAISider.displayName = 'BAISider';
export default BAISider;
