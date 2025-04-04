import Flex from '../Flex';
import PureChatTokenCounter from './ChatTokenCounter';
import VirtualChatMessageList from './VirtualChatMessageList';
import { Message } from '@ai-sdk/react';
import React, { memo } from 'react';

const ChatMessageList = memo(VirtualChatMessageList);

const ChatTokenCounter = memo(PureChatTokenCounter);

interface ChatRequest {
  headers?: Record<string, string> | Headers;
  credentials?: RequestCredentials;
  fetchOnClient?: boolean;
}

interface ChatMessageProps extends ChatRequest {
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
  return (
    <>
      <ChatMessageList messages={messages} isStreaming={isStreaming} />
      <Flex direction="column" align="end">
        <ChatTokenCounter
          messages={messages}
          input={input}
          startTime={startTime}
        />
      </Flex>
    </>
  );
};

export default ChatMessages;
