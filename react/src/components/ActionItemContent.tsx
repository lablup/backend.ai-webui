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
      direction="column"
      style={{
        height: '100%',
        textAlign: 'center',
        overflow: 'hidden',
        padding: token.marginMD,
      }}
    >
      <Flex
        direction="column"
        align="center"
        gap={type === 'default' ? 'sm' : 'xxs'}
        style={{
          flexShrink: 0,
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
        <Flex
          align="center"
          justify="center"
          style={{
            minHeight: 48,
            display: 'flex',
            alignItems: 'center',
          }}
        >
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
                textAlign: 'center',
              }}
            >
              {title}
            </Typography.Text>
          ) : (
            title
          )}
        </Flex>
      </Flex>

      <Flex
        direction="column"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: `${token.marginXS}px 0`,
          minHeight: 0,
        }}
      >
        <Typography.Text
          type="secondary"
          style={{
            fontSize: token.fontSizeSM,
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography.Text>
      </Flex>

      <Flex
        direction="column"
        style={{
          width: '100%',
          flexShrink: 0,
          marginTop: token.marginSM,
        }}
      >
        {description && (
          <Divider
            style={{
              margin: `${token.marginSM}px 0`,
              borderWidth: 1,
            }}
          />
        )}
        {to ? <WebUILink to={to}>{actionButton}</WebUILink> : actionButton}
      </Flex>
    </Flex>
  );
};

export default ActionItemContent;
