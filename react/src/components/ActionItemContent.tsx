import Flex from './Flex';
import WebUILink from './WebUILink';
// import useResizeObserver from '@react-hook/resize-observer';
import { Button, Divider, Typography, theme } from 'antd';
import { ReactNode, useRef } from 'react';
import { To } from 'react-router-dom';

interface StartItemContentProps {
  title: string | ReactNode;
  description?: string;
  icon?: React.ReactNode;
  buttonText: string;
  onClick?: () => void;
  to?: To;
  themeColor?: string;
  itemRole?: 'user' | 'admin';
  type?: 'simple' | 'default';
  style?: React.CSSProperties;
}

const ActionItemContent: React.FC<StartItemContentProps> = ({
  title,
  description,
  icon,
  buttonText,
  onClick,
  to,
  themeColor,
  type = 'default',
  itemRole = 'user',
  style,
}) => {
  const { token } = theme.useToken();
  const containerRef = useRef<HTMLDivElement>(null);
  const colorPrimaryWithAlpha = `rgba(${parseInt(token.colorPrimary.slice(1, 3), 16)}, ${parseInt(token.colorPrimary.slice(3, 5), 16)}, ${parseInt(token.colorPrimary.slice(5, 7), 16)}, 0.15)`;

  const actionButton = (
    <Button
      type="primary"
      style={{
        width: '100%',
        height: 40,
        backgroundColor: themeColor
          ? themeColor
          : itemRole === 'user'
            ? token.colorPrimary
            : token.colorInfo,
      }}
      onClick={onClick}
    >
      <Typography.Text
        style={{
          fontSize: token.fontSizeHeading5,
          color: token.colorWhite,
        }}
      >
        {buttonText}
      </Typography.Text>
    </Button>
  );
  return (
    <Flex
      ref={containerRef}
      align="center"
      justify="between"
      direction="column"
      style={{
        height: 328,
        textAlign: 'center',
        overflowY: 'auto',
        ...style,
      }}
    >
      <Flex
        direction="column"
        gap={type === 'default' ? 'sm' : 'xxs'}
        style={{
          overflow: 'hidden',
          padding: token.marginMD,
          paddingBottom: 0,
        }}
      >
        <Flex
          align="center"
          justify="center"
          style={{
            borderRadius: 25,
            width: 50,
            height: 50,
            fontSize: token.fontSizeHeading3,
            color: token.colorPrimary,
            backgroundColor: colorPrimaryWithAlpha,
          }}
        >
          {icon}
        </Flex>
        <Flex style={{ minHeight: 60 }}>
          {typeof title === 'string' ? (
            <Typography.Text
              strong
              style={{
                fontSize: token.fontSizeHeading4,
                color: themeColor
                  ? themeColor
                  : itemRole === 'user'
                    ? token.colorPrimary
                    : token.colorInfo,
              }}
            >
              {title}
            </Typography.Text>
          ) : (
            title
          )}
        </Flex>
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM }}
        >
          {description}
        </Typography.Text>
      </Flex>
      <Flex
        direction="column"
        align="stretch"
        style={{
          width: '100%',
          position: 'sticky',
          bottom: 0,
          backgroundColor:
            type === 'default' ? token.colorBgContainer : undefined,
          padding: type === 'default' ? token.paddingMD : undefined,
          paddingTop: 0,
        }}
      >
        {description && (
          <Divider
            style={{ margin: 0, marginBottom: token.marginMD, borderWidth: 1 }}
          />
        )}
        {to ? <WebUILink to={to}>{actionButton}</WebUILink> : actionButton}
      </Flex>
    </Flex>
  );
};

export default ActionItemContent;
