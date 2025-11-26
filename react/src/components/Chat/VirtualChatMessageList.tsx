import { AssistantChatMessage } from './AssistantChatMesssage';
import ScrollBottomHandlerButton from './ScrollBottomHandlerButton';
import { UserChatMessage } from './UserChatMesssage';
import { UIMessage } from '@ai-sdk/react';
import { theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { useCallback, useRef, useState } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

interface VirtualizedListProps {
  messages: Array<UIMessage>;
  isStreaming?: boolean;
}

const ChatMessageRenders = {
  user: UserChatMessage,
  assistant: AssistantChatMessage,
  system: AssistantChatMessage,
  data: AssistantChatMessage,
};

const VirtualChatMessageList: React.FC<VirtualizedListProps> = ({
  messages,
  isStreaming,
}) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [atBottom, setAtBottom] = useState(true);
  const { token } = theme.useToken();

  // overscan should be 1.5 times the height of the window
  const overscan = typeof window !== 'undefined' ? window.innerHeight * 1.5 : 0;

  const itemContent = useCallback(
    (index: number, message: UIMessage) => {
      const RenderChatMessage = ChatMessageRenders[message.role];

      return (
        <RenderChatMessage
          key={message.id}
          message={message}
          isStreaming={isStreaming ?? false}
          placement={{
            top: index === 0,
            bottom: index === messages.length - 1,
          }}
        />
      );
    },
    [isStreaming, messages.length],
  );

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{ height: '100%', flex: 1 }}
    >
      <Virtuoso
        atBottomStateChange={setAtBottom}
        atBottomThreshold={60}
        computeItemKey={(_, item) => item.id}
        data={messages}
        followOutput={'auto'}
        initialTopMostItemIndex={messages?.length - 1}
        itemContent={itemContent}
        overscan={overscan}
        ref={virtuosoRef}
      />
      <div
        style={{
          position: 'absolute',
          right: '50%',
          transform: 'translateX(+50%)',
          bottom: token.marginSM,
          opacity: atBottom ? 0 : 1,
          transition: 'opacity 0.2s',
          transitionDelay: atBottom ? '0s' : '0.2s',
          zIndex: 1,
        }}
      >
        <ScrollBottomHandlerButton
          atBottom={atBottom}
          autoScroll={isStreaming}
          onScrollToBottom={(type) => {
            const virtuoso = virtuosoRef.current;
            switch (type) {
              case 'auto': {
                virtuoso?.scrollToIndex({
                  align: 'end',
                  behavior: 'auto',
                  index: 'LAST',
                });
                break;
              }
              case 'click': {
                virtuoso?.scrollToIndex({
                  align: 'end',
                  behavior: 'smooth',
                  index: 'LAST',
                });
                break;
              }
            }
          }}
        />
      </div>
    </BAIFlex>
  );
};

export default VirtualChatMessageList;
