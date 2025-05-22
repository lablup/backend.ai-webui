import Flex from '../Flex';
import ChatCard from './ChatCard';
import { useConversation } from './ChatHistoryProvider';
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
  id: string;
  provider: ChatProviderData;
};

export const ChatConversation: React.FC<ConversationProps> = ({
  id,
  provider,
}) => {
  const { chats, addChat, removeChat, updateChat, updateChatMessage } =
    useConversation(id, provider);
  const { styles } = useStyles();

  console.log('chats', chats);

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
              onRemoveChat={() => {
                removeChat(chat.id);
              }}
              onAddChat={(chat) => {
                addChat(chat);
              }}
              onSaveMessage={(message) => {
                updateChatMessage(chat.id, message);
              }}
              onClearMessage={(chat) => {
                updateChatMessage(chat.id);
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
