import Flex from './Flex';
import { SiderProps, Typography, theme } from 'antd';
import Sider from 'antd/es/layout/Sider';
import React from 'react';
import { Link } from 'react-router-dom';

interface BAISiderProps extends SiderProps {
  // logo?: React.ReactNode;
  logoCollapsed?: React.ReactNode;
  logo?: React.ReactNode;
  logoTitleCollapsed?: React.ReactNode;
  logoTitle?: React.ReactNode;
  bottomText?: React.ReactNode;
}

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
        collapsedWidth={88}
        width={251}
        breakpoint="lg"
        style={{
          overflowX: 'hidden',
          overflowY: 'auto',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          borderRight: '1px solid',
          borderColor: token.colorBorder,
          backgroundColor: '#F4F7FD',
        }}
        {...otherProps}
        className="bai-sider"
      >
        <Link to="/">
          <Flex
            direction="column"
            justify="start"
            align="start"
            style={{
              padding: 16,
              overflow: 'visible',
            }}
            className={'logo-and-text-container'}
          >
            <div className="logo-img-wrap">
              <div style={{ display: otherProps.collapsed ? 'none' : 'block' }}>
                {logo}
              </div>
              <div style={{ display: otherProps.collapsed ? 'block' : 'none' }}>
                {logoCollapsed}
              </div>
            </div>
            <div className="logo-title-wrap">
              {otherProps.collapsed ? (
                <Typography.Text
                  style={{
                    fontSize: 16,
                    lineHeight: '16px',
                    fontWeight: 200,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {logoTitleCollapsed}
                </Typography.Text>
              ) : (
                <Typography.Text
                  style={{
                    fontSize: 16,
                    lineHeight: '16px',
                    fontWeight: 200,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {logoTitle}
                </Typography.Text>
              )}
            </div>
          </Flex>
        </Link>
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