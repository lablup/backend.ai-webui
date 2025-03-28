import ChatMessage from './ChatMessage';
import type { ChatMessageProps } from './ChatMessage';
import { ChatMessagePlacement } from './ChatMessageContainer';
import { Message } from '@ai-sdk/react';
import Compact from 'antd/es/space/Compact';

interface UserChatMessageProps
  extends Omit<ChatMessageProps, 'placement,extra,enableExtraHover'> {
  message: Message;
  isStreaming: boolean;
}

export const UserChatMessage: React.FC<UserChatMessageProps> = ({
  message,
  isStreaming,
}) => {
  return (
    <ChatMessage
      key={message.id}
      message={message}
      placement={ChatMessagePlacement.Right}
      isStreaming={isStreaming}
      enableExtraHover={true}
      extra={<Compact>{null}</Compact>}
      avatar={'🧑‍🦰'}
    />
  );
};
