import Flex from '../Flex';
// ES 2015
import ChatMessageContent from './ChatMessageContent';
import { useThrottle } from 'ahooks';
import { Message } from 'ai';
import { Avatar, theme } from 'antd';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';
import { useState } from 'react';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

const ChatMessage: React.FC<{
  message: Message;
  placement?: 'left' | 'right';
  extra?: React.ReactNode;
  enableExtraHover?: boolean;
  containerStyle?: React.CSSProperties;
  isStreaming?: boolean;
  // avatar?:
}> = ({
  extra,
  message,
  placement = 'left',
  containerStyle,
  enableExtraHover,
  isStreaming,
}) => {
  const { token } = theme.useToken();
  const [isHovered, setIsHovered] = useState(false);

  const throttledMessageContent = useThrottle(message.content, { wait: 50 });
  return (
    <Flex
      direction={placement === 'left' ? 'row' : 'row-reverse'}
      justify={'start'}
      align="baseline"
      style={{
        marginLeft: placement === 'left' ? '0' : '15%',
        marginRight: placement === 'right' ? '0' : 20,
        ...containerStyle,
      }}
      gap={'sm'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {message.role !== 'user' ? (
        <Avatar
          // icon={message.role === "user" ? "🧑‍🦰" : "🤖"}
          icon={'🤖'}
          style={{ fontSize: token.fontSizeHeading3 }}
        />
      ) : null}

      <Flex
        direction="column"
        align={placement === 'left' ? 'start' : 'end'}
        wrap="wrap"
        style={{ flex: 1 }}
        gap={'xxs'}
      >
        <Flex
          align="stretch"
          direction="column"
          style={{
            borderRadius: token.borderRadius,
            borderColor: token.colorBorderSecondary,
            borderWidth: token.lineWidth,
            padding: '1em',
            paddingTop: 0,
            paddingBottom: 0,
            backgroundColor:
              message.role !== 'user'
                ? token.colorBgContainer
                : token.colorBgContainerDisabled,
            width: '100%',
          }}
        >
          <ChatMessageContent>
            {throttledMessageContent + (isStreaming ? '\n●' : '')}
          </ChatMessageContent>
        </Flex>
        <Flex
          style={{
            fontSize: token.fontSizeSM,
            ...(enableExtraHover
              ? {
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.2s',
                  transitionDelay: isHovered ? '0s' : '0.2s',
                }
              : {}),
          }}
        >
          {extra}
        </Flex>
        {/* <Text
          type="secondary"
          style={{
            fontSize: token.fontSizeSM,
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.2s",
            transitionDelay: isHovered ? "0s" : "0.2s",
          }}
        >
          {dayjs(message.createdAt)?.isSame(new Date(), "day")
            ? dayjs(message.createdAt).format("LT")
            : dayjs(message.createdAt).format("L LT")}
        </Text> */}
      </Flex>
    </Flex>
  );
};

export default ChatMessage;
