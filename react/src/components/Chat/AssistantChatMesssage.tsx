import ChatMessage, { ChatMessageProps } from './ChatMessage';
import CopyButton from './CopyButton';
import Compact from 'antd/es/space/Compact';
import _ from 'lodash';

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
        _.some(message.parts, (part) => part.type === 'text') && (
          <Compact>
            <CopyButton
              type="text"
              size="small"
              copyable={{
                text: message.parts
                  ?.filter((part) => part.type === 'text')
                  .map((part) => part.text)
                  .join('')
                  .trim(),
              }}
              style={{
                display: isStreaming ? 'none' : 'block',
              }}
            />
          </Compact>
        )
      }
      avatar={'🤖'}
    />
  );
};
