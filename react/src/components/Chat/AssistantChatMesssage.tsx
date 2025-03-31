import ChatMessage, { ChatMessageProps } from './ChatMessage';
import CopyButton from './CopyButton';
import Compact from 'antd/es/space/Compact';

export const AssistantChatMessage: React.FC<ChatMessageProps> = ({
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
