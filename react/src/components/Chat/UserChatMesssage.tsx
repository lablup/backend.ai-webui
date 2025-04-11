import ChatMessage from './ChatMessage';
import type { ChatMessagePlacement } from './ChatMessageContainer';
import { Message } from '@ai-sdk/react';
import Compact from 'antd/es/space/Compact';

interface UserChatMessageProps {
  message: Message;
  isStreaming: boolean;
  placement?: ChatMessagePlacement;
}

export const UserChatMessage: React.FC<UserChatMessageProps> = ({
  message,
  isStreaming,
  placement,
}) => {
  return (
    <ChatMessage
      key={message.id}
      message={message}
      placement={{ ...placement, right: true }}
      isStreaming={isStreaming}
      enableExtraHover={true}
      extra={<Compact>{null}</Compact>}
      avatar={'🧑‍🦰'}
    />
  );
};
