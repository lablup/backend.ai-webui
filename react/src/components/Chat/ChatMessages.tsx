import Flex from '../Flex';
import PureChatTokenCounter from './ChatTokenCounter';
import VirtualChatMessageList from './VirtualChatMessageList';
import { Message } from '@ai-sdk/react';
import { theme } from 'antd';
import React, { memo } from 'react';

const ChatMessageList = memo(VirtualChatMessageList);

const ChatTokenCounter = memo(PureChatTokenCounter);

interface ChatMessageProps {
  messages: Message[];
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
    <Flex direction="column" align="stretch" style={{ flex: 1 }}>
      <ChatMessageList messages={messages} isStreaming={isStreaming} />
      <Flex
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
      </Flex>
    </Flex>
  );
};

export default ChatMessages;
