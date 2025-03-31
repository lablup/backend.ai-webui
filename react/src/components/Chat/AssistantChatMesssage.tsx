import ChatMessage from './ChatMessage';
import { ChatMessagePlacement } from './ChatMessageContainer';
import CopyButton from './CopyButton';
import { Message } from '@ai-sdk/react';
import Compact from 'antd/es/space/Compact';

interface AssistantChatMessageProps {
  message: Message;
  isStreaming: boolean;
  placement?: ChatMessagePlacement;
}

export const AssistantChatMessage: React.FC<AssistantChatMessageProps> = ({
  message,
  isStreaming,
  placement,
}) => {
  return (
    <ChatMessage
      key={message.id}
      message={message}
      placement={{ ...placement, left: true }}
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
