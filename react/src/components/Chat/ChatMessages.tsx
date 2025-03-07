import Flex from '../Flex';
import PureChatTokenCounter from './ChatTokenCounter';
import VirtualChatMessageList from './VirtualChatMessageList';
import { Message } from '@ai-sdk/react';
import equal from 'fast-deep-equal';
import React, { memo } from 'react';

const ChatMessageList = memo(VirtualChatMessageList, (prevProps, nextProps) => {
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;
  return true;
});

const ChatTokenCounter = memo(PureChatTokenCounter, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (prevProps.startTime !== nextProps.startTime) return false;
  return true;
});

interface ChatRequest {
  headers?: Record<string, string> | Headers;
  credentials?: RequestCredentials;
  fetchOnClient?: boolean;
}

interface ChatMessageProps extends ChatRequest {
  messages: Message[];
  input: string;
  isLoading: boolean;
  startTime: number | null;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  messages,
  input,
  isLoading,
  startTime,
}) => {
  return (
    <>
      <ChatMessageList messages={messages} isStreaming={isLoading} />
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

export default ChatMessage;
