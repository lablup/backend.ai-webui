import {
  ChatMessageContainer,
  ChatMessagePlacement,
} from './ChatMessageContainer';
// ES 2015
import ChatMessageContent from './ChatMessageContent';
import { UIMessage } from '@ai-sdk/react';
import { FileCard } from '@ant-design/x';
import { theme, Image, Collapse, Typography, Spin } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FilePart {
  type: 'file';
  url: string;
  mediaType?: 'audio' | 'video' | 'image' | 'file';
  filename?: string;
}

export interface ChatMessageProps {
  message: UIMessage;
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

  // Extract content and reasoning from parts array
  const content = _.chain(message.parts)
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')
    .value();

  const reasoningText = _.chain(message.parts)
    .filter((part) => part.type === 'reasoning')
    .map((part) => part.text)
    .join('')
    .value();

  // Filter file parts from the message parts array
  const fileParts = _.filter(message.parts, (part) => part.type === 'file');

  return (
    <ChatMessageContainer
      placement={placement}
      avatar={avatar}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {_.map(fileParts, (part: FilePart, index) => {
        if (part.type !== 'file') {
          return null;
        }

        const filename =
          part.filename || part.url?.split('/').pop() || `file-${index}`;

        return _.includes(part?.mediaType, 'image/') ? (
          <BAIFlex
            key={`${message?.id}-${index}`}
            style={{
              border: 'none',
              textAlign: 'end',
            }}
            align="end"
          >
            <Image
              src={part?.url}
              alt={filename}
              style={{
                maxWidth: '50vw',
                maxHeight: '12vh',
                borderRadius: token.borderRadius,
              }}
            />
          </BAIFlex>
        ) : (
          <FileCard
            key={`${message?.id}-${index}`}
            name={filename}
            description={filename}
            src={part?.url}
            type={part?.mediaType}
          />
        );
      })}
      <BAIFlex
        align="stretch"
        direction="column"
        style={{
          borderRadius: token.borderRadius,
          borderColor: token.colorBorderSecondary,
          borderWidth: token.lineWidth,
          padding: '1em',
          paddingTop: 0,
          paddingBottom: 0,
          backgroundColor: token.colorBgElevated,
          maxWidth: '100%',
          width: _.trim(reasoningText) ? '100%' : 'auto',
        }}
      >
        {_.trim(reasoningText) && (
          <Collapse
            style={{
              marginTop: token.margin,
              width: '100%',
            }}
            items={[
              {
                key: 'reasoning',
                label: _.isEmpty(content) ? (
                  <BAIFlex gap="xs">
                    <Typography.Text>{t('chatui.Thinking')}</Typography.Text>
                    <Spin size="small" />
                  </BAIFlex>
                ) : (
                  <Typography.Text>{t('chatui.ViewReasoning')}</Typography.Text>
                ),
                children: (
                  <ChatMessageContent isStreaming={isStreaming}>
                    {reasoningText}
                  </ChatMessageContent>
                ),
              },
            ]}
          />
        )}
        <ChatMessageContent isStreaming={isStreaming}>
          {content + (isStreaming ? '\n' : '')}
        </ChatMessageContent>
      </BAIFlex>
      <BAIFlex
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
      </BAIFlex>
    </ChatMessageContainer>
  );
};

export default memo(ChatMessage);
