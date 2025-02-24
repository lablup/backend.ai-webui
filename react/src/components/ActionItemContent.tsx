import Flex from './Flex';
import useResizeObserver from '@react-hook/resize-observer';
import { Button, Divider, Typography, theme } from 'antd';
import { useRef, useState } from 'react';

interface StartItemContentProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  buttonText: string;
  onClick?: () => void;
  themeColor?: string;
  iconBgColor?: string;
  itemRole?: 'user' | 'admin';
}

const ActionItemContent: React.FC<StartItemContentProps> = ({
  title,
  description,
  icon,
  buttonText,
  onClick,
  themeColor,
  iconBgColor,
  itemRole = 'user',
}) => {
  const { token } = theme.useToken();
  const [needScroll, setNeedScroll] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorPrimaryWithAlpha = `rgba(${parseInt(token.colorPrimary.slice(1, 3), 16)}, ${parseInt(token.colorPrimary.slice(3, 5), 16)}, ${parseInt(token.colorPrimary.slice(5, 7), 16)}, 0.15)`;
  const colorInfoWithAlpha = `rgba(${parseInt(token.colorInfo.slice(1, 3), 16)}, ${parseInt(token.colorInfo.slice(3, 5), 16)}, ${parseInt(token.colorInfo.slice(5, 7), 16)}, 0.15)`;

  useResizeObserver(
    containerRef,
    (entry: { contentRect: { width: number } }) => {
      entry.contentRect.width <= 220
        ? setNeedScroll(true)
        : setNeedScroll(false);
    },
  );

  return (
    <Flex
      ref={containerRef}
      align="center"
      justify="between"
      direction="column"
      style={{
        height: '100%',
        textAlign: 'center',
        overflowY: 'auto',
        padding: token.marginMD,
      }}
    >
      <Flex direction="column" gap={token.marginSM}>
        <Flex
          align="center"
          justify="center"
          style={{
            borderRadius: 25,
            width: 50,
            height: 50,
            backgroundColor: iconBgColor
              ? iconBgColor
              : itemRole === 'user'
                ? colorPrimaryWithAlpha
                : colorInfoWithAlpha,
          }}
        >
          {icon}
        </Flex>
        <Flex style={{ minHeight: 60 }}>
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
        </Flex>
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM }}
        >
          {!needScroll && description}
        </Typography.Text>
      </Flex>
      <Flex direction="column" style={{ width: '100%' }}>
        {description && (
          <Divider style={{ margin: token.marginSM, borderWidth: 2 }} />
        )}
        <Flex style={{ width: '100%', padding: `0 ${token.paddingMD}px` }}>
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
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ActionItemContent;
