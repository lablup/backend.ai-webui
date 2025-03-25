import Flex from '../Flex';
// ES 2015
import ChatMessageContent from './ChatMessageContent';
import { Message } from '@ai-sdk/react';
import { Attachments } from '@ant-design/x';
import { Avatar, theme, Image, Collapse, Typography, Spin } from 'antd';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import _ from 'lodash';
import React, { useDeferredValue } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const deferredReasoning = useDeferredValue(message.reasoning);
  const deferredContent = useDeferredValue(message.content);

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
        gap={'xs'}
      >
        {_.map(message.experimental_attachments, (attachment, index) =>
          _.includes(attachment?.contentType, 'image/') ? (
            <Flex
              style={{
                border: 'none',
                textAlign: 'end',
              }}
              align="end"
            >
              <Image
                key={`${message?.id}-${index}`}
                src={attachment?.url}
                alt={attachment?.name}
                style={{
                  maxWidth: '50vw',
                  maxHeight: '12vh',
                  borderRadius: token.borderRadius,
                }}
              />
            </Flex>
          ) : (
            <Attachments.FileCard
              key={index}
              item={{
                uid: `${message?.id}-${index}`,
                name: attachment?.name || attachment?.url,
                type: attachment?.contentType,
                description: attachment?.name,
                url: attachment?.url,
              }}
            />
          ),
        )}
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
            maxWidth: '100%',
            width: _.trim(message.reasoning) ? '100%' : 'auto',
          }}
        >
          {_.trim(message.reasoning) && (
            <Collapse
              style={{
                marginTop: token.margin,
                width: '100%',
              }}
              items={[
                {
                  key: 'reasoning',
                  label: _.isEmpty(deferredContent) ? (
                    <Flex gap="xs">
                      <Typography.Text>{t('chatui.Thinking')}</Typography.Text>
                      <Spin size="small" />
                    </Flex>
                  ) : (
                    <Typography.Text>
                      {t('chatui.ViewReasoning')}
                    </Typography.Text>
                  ),
                  children: (
                    <ChatMessageContent>{deferredReasoning}</ChatMessageContent>
                  ),
                },
              ]}
            />
          )}
          <ChatMessageContent>
            {deferredContent + (isStreaming ? '\n●' : '')}
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
