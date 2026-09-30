/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import PureChatTokenCounter from './ChatTokenCounter';
import VirtualChatMessageList from './VirtualChatMessageList';
import { UIMessage } from '@ai-sdk/react';
import { useTheme } from '@astryxdesign/core/theme';
import { BAIFlex } from 'backend.ai-ui';
import React, { memo } from 'react';

const ChatMessageList = memo(VirtualChatMessageList);

const ChatTokenCounter = memo(PureChatTokenCounter);

interface ChatMessageProps {
  messages: UIMessage[];
  input: string;
  isStreaming: boolean;
  startTime: number | null;
  endTime: number | null;
}

const ChatMessages: React.FC<ChatMessageProps> = ({
  messages,
  input,
  isStreaming,
  startTime,
  endTime,
}) => {
  const { token } = useTheme();
  return (
    // `minHeight: 0` lets this pane absorb the shrink when the composer grows
    // (attachment drawer open, multi-line input) instead of the composer being
    // clipped: the virtualized list already scrolls internally.
    <BAIFlex
      direction="column"
      align="stretch"
      style={{ flex: 1, minHeight: 0 }}
    >
      <ChatMessageList messages={messages} isStreaming={isStreaming} />
      <BAIFlex
        direction="column"
        align="end"
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          margin: token('--spacing-4'),
        }}
      >
        <ChatTokenCounter
          messages={messages}
          input={input}
          startTime={startTime}
          endTime={endTime}
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default ChatMessages;
