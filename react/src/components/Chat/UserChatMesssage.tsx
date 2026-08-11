/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ChatMessage from './ChatMessage';
import type { ChatMessagePlacement } from './ChatMessageContainer';
import { UIMessage } from '@ai-sdk/react';

interface UserChatMessageProps {
  message: UIMessage;
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
      extra={null}
      avatar={'🧑‍🦰'}
    />
  );
};
