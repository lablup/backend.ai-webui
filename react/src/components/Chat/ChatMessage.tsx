import Flex from '../Flex';
import {
  ChatMessageContainer,
  ChatMessagePlacement,
} from './ChatMessageContainer';
// ES 2015
import ChatMessageContent from './ChatMessageContent';
import { Message } from '@ai-sdk/react';
import { Attachments } from '@ant-design/x';
import { theme, Image, Collapse, Typography, Spin } from 'antd';
import _ from 'lodash';
import React, { memo } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ChatMessageProps {
  message: Message;
  placement?: ChatMessagePlacement;
  extra?: React.ReactNode;
  enableExtraHover?: boolean;
  isStreaming?: boolean;
  avatar?: React.ReactNode;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  extra,
  message,
  placement,
  enableExtraHover,
  isStreaming,
  avatar,
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const { content, reasoning } = message;

  return (
    <ChatMessageContainer
      placement={placement}
      avatar={avatar}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
                label: _.isEmpty(content) ? (
                  <Flex gap="xs">
                    <Typography.Text>{t('chatui.Thinking')}</Typography.Text>
                    <Spin size="small" />
                  </Flex>
                ) : (
                  <Typography.Text>{t('chatui.ViewReasoning')}</Typography.Text>
                ),
                children: (
                  <ChatMessageContent isStreaming={isStreaming}>
                    {reasoning}
                  </ChatMessageContent>
                ),
              },
            ]}
          />
        )}
        <ChatMessageContent isStreaming={isStreaming}>
          {content + (isStreaming ? '\n' : '')}
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
    </ChatMessageContainer>
  );
};

export default memo(ChatMessage);
