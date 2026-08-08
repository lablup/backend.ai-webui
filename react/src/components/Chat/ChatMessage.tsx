/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme } from '../../theme-shim';
import {
  ChatMessageContainer,
  ChatMessagePlacement,
} from './ChatMessageContainer';
import ChatMessageContent from './ChatMessageContent';
import { UIMessage } from '@ai-sdk/react';
// FRONTIER (documented, ticket 23 @ant-design/x judgment call): `FileCard`
// has no Astryx equivalent (not in MAPPING.md — it is outside the antd core
// surface the mapping measured) and rebuilding a file-attachment preview card
// is disproportionate to one call site. Kept as-is, same treatment as the
// lobehub icon packages — convert only the antd chrome AROUND it.
import { FileCard } from '@ant-design/x';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Spinner } from '@astryxdesign/core/Spinner';
import { Text } from '@astryxdesign/core/Text';
import { Thumbnail } from '@astryxdesign/core/Thumbnail';
import { BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FilePart {
  type: 'file';
  url: string;
  mediaType?: string;
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
  const content = _.map(
    _.filter(message.parts, (part) => part.type === 'text'),
    (part) => part.text,
  ).join('');

  const reasoningText = _.map(
    _.filter(message.parts, (part) => part.type === 'reasoning'),
    (part) => part.text,
  ).join('');

  // Filter file parts from the message parts array
  const fileParts = _.filter(message.parts, (part) => part.type === 'file');

  // The bubble has no vertical padding; the rendered markdown paragraphs of
  // `content` supply it. When only reasoning is present (e.g. while the model
  // is still thinking), there is no paragraph to provide the bottom gap, so the
  // Collapse has to add it itself.
  const hasContent = !_.isEmpty(_.trim(content));

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

        return part.mediaType?.toLowerCase().startsWith('image/') ? (
          <BAIFlex
            key={`${message?.id}-${index}`}
            style={{
              border: 'none',
              textAlign: 'end',
            }}
            align="end"
          >
            <Thumbnail
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
          <Collapsible
            defaultIsOpen={false}
            style={{
              marginTop: token.margin,
              marginBottom: hasContent ? 0 : token.margin,
              width: '100%',
            }}
            trigger={
              !hasContent ? (
                <BAIFlex gap="xs">
                  <Text>{t('chatui.Thinking')}</Text>
                  <Spinner size="sm" />
                </BAIFlex>
              ) : (
                <Text>{t('chatui.ViewReasoning')}</Text>
              )
            }
          >
            <ChatMessageContent isStreaming={isStreaming}>
              {reasoningText}
            </ChatMessageContent>
          </Collapsible>
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
