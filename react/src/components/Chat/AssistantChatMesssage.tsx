/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ChatMessage, { ChatMessageProps } from './ChatMessage';
import CopyButton from './CopyButton';
import * as _ from 'lodash-es';

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
          <CopyButton
            size="sm"
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
        )
      }
      avatar={'🤖'}
    />
  );
};
