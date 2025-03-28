import ChatMessage from './ChatMessage';
import type { ChatMessageProps } from './ChatMessage';
import { ChatMessagePlacement } from './ChatMessageContainer';
import CopyButton from './CopyButton';
import { Message } from '@ai-sdk/react';
import Compact from 'antd/es/space/Compact';

interface AssistantChatMessageProps
  extends Omit<ChatMessageProps, 'placement,extra,enableExtraHover'> {
  message: Message;
  isStreaming: boolean;
}

export const AssistantChatMessage: React.FC<AssistantChatMessageProps> = ({
  message,
  isStreaming,
}) => {
  return (
    <ChatMessage
      key={message.id}
      message={message}
      placement={ChatMessagePlacement.Left}
      isStreaming={isStreaming}
      enableExtraHover={false}
      extra={
        !isStreaming && (
          <Compact>
            <CopyButton
              type="text"
              size="small"
              copyable={{
                text: message.content,
              }}
            />
          </Compact>
        )
      }
      avatar={'🤖'}
    />
  );
};
