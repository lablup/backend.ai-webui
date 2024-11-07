import Flex from '../Flex';
import ChatMessage from './ChatMessage';
import CopyButton from './CopyButton';
import ScrollBottomHandlerButton from './ScrollBottomHandlerButton';
import { Message } from '@ai-sdk/react';
import { theme } from 'antd';
import Compact from 'antd/es/space/Compact';
import React, { useRef, useState } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

// import AutoScroll from '../AutoScroll';
// import Item from '../ChatItem';

interface VirtualizedListProps {
  messages: Array<Message>;
  isStreaming?: boolean;
}
const VirtualChatMessageList: React.FC<VirtualizedListProps> = ({
  messages,
  isStreaming,
}) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [atBottom, setAtBottom] = useState(true);
  const { token } = theme.useToken();
  // overscan should be 1.5 times the height of the window
  const overscan = typeof window !== 'undefined' ? window.innerHeight * 1.5 : 0;

  return (
    <Flex
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
        itemContent={(index, m) => {
          return (
            <ChatMessage
              key={m.id}
              message={m}
              placement={m.role === 'user' ? 'right' : 'left'}
              containerStyle={{
                paddingLeft: token.paddingMD,
                paddingRight: token.paddingMD,
                paddingTop: index === 0 ? token.paddingMD : 0,
                paddingBottom:
                  index === messages.length - 1 ? token.paddingMD : 0,
              }}
              isStreaming={
                m.role !== 'user' &&
                isStreaming &&
                index === messages.length - 1
              }
              enableExtraHover={m.role === 'user'}
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
                ) : (
                  <Compact>{null}</Compact>
                )
              }
            />
          );
        }}
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
          lastMessageContent={messages[messages.length - 1]?.content}
        />
      </div>
    </Flex>
  );
};

export default VirtualChatMessageList;
