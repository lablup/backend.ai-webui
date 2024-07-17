import ChatMessage from './ChatMessage';
import CopyButton from './CopyButton';
import Flex, { FlexProps } from './Flex';
import { Message } from 'ai';
import Compact from 'antd/es/space/Compact';
import React from 'react';

interface ChatMessageListProps extends FlexProps {
  messages: Array<Message>;
}
const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  ...flexProps
}) => {
  return (
    <Flex
      direction="column"
      justify="start"
      align="stretch"
      gap={'xs'}
      {...flexProps}
    >
      {messages.map((m) => (
        <ChatMessage
          key={m.id}
          message={m}
          placement={m.role === 'user' ? 'right' : 'left'}
          extra={
            m.role !== 'user' ? (
              <Compact>
                <CopyButton
                  type="text"
                  size="small"
                  copyable={{
                    text: m.content,
                  }}
                />
                {/* <Button/> */}
                {/* <Button/> */}
              </Compact>
            ) : undefined
          }
        />
      ))}
    </Flex>
  );
};

export default ChatMessageList;
