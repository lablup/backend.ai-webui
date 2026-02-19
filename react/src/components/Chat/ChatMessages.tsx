/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import PureChatTokenCounter from './ChatTokenCounter';
import VirtualChatMessageList from './VirtualChatMessageList';
import { UIMessage } from '@ai-sdk/react';
import { theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { memo } from 'react';

const ChatMessageList = memo(VirtualChatMessageList);

const ChatTokenCounter = memo(PureChatTokenCounter);

interface ChatMessageProps {
  messages: UIMessage[];
  input: string;
  isStreaming: boolean;
  startTime: number | null;
}

const ChatMessages: React.FC<ChatMessageProps> = ({
  messages,
  input,
  isStreaming,
  startTime,
}) => {
  const { token } = theme.useToken();
  return (
    <BAIFlex direction="column" align="stretch" style={{ flex: 1 }}>
      <ChatMessageList messages={messages} isStreaming={isStreaming} />
      <BAIFlex
        direction="column"
        align="end"
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          margin: token.margin,
        }}
      >
        <ChatTokenCounter
          messages={messages}
          input={input}
          startTime={startTime}
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default ChatMessages;
