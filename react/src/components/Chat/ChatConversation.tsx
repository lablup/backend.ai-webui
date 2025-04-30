import Flex from '../Flex';
import { useConversation } from './ChatCacheProvider';
import ChatCard from './ChatCard';
import type { ChatProviderData } from './ChatModel';
import { Card, Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import _ from 'lodash';
import { Suspense } from 'react';

const useStyles = createStyles(({ css }) => ({
  chatView: css`
    overflow: auto;
    height: calc(100vh - 240px);
  `,
  skeleton: css`
    width: 100%;
    display: flex;
    flex-direction: column;
  `,
  chatCard: css`
    flex: 1;
    overflow: 'hidden';
  `,
  conversation: css`
    overflow: hidden;
  `,
}));

export type ConversationProps = {
  conversationId: string;
};

export const ChatConversation: React.FC<ConversationProps> = ({
  conversationId,
}) => {
  const { chats, addChat, removeChat, updateChat, saveMessage, clearMessages } =
    useConversation(conversationId);
  const { styles } = useStyles();

  return (
    <Flex
      className={styles.conversation}
      direction="column"
      align="stretch"
      gap={'xs'}
    >
      <Flex
        className={styles.chatView}
        gap={'xs'}
        direction="row"
        align="stretch"
      >
        {_.map(chats, (chat) => (
          <Suspense
            fallback={
              <Card className={styles.skeleton} variant="outlined">
                <Skeleton active />
              </Card>
            }
            key={chat.id}
          >
            <ChatCard
              className={styles.chatCard}
              chat={chat}
              onUpdateChat={(newChatProperties) => {
                updateChat(chat.id, newChatProperties);
              }}
              fetchOnClient
              onRequestClose={() => {
                removeChat(chat.id);
              }}
              onCreateNewChat={(chat) => {
                addChat(chat.provider);
              }}
              onSaveMessage={(message) => {
                saveMessage(chat.id, message);
              }}
              onClickClearChatMessages={(chat) => {
                clearMessages(chat.id);
              }}
              closable={isClosable(chats?.length)}
              clonable={isClonable(chats?.length)}
            />
          </Suspense>
        ))}
      </Flex>
    </Flex>
  );
};

function isClosable(chatLength: number) {
  return chatLength > 1;
}

function isClonable(chatLength: number) {
  return chatLength <= 10;
}
