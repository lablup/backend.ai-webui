import Flex from '../Flex';
import ChatCard from './ChatCard';
import { ChatProviderType, ChatType, ConversationType } from './ChatModel';
import { useDynamicList } from 'ahooks';
import { Card, Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import _ from 'lodash';
import { map } from 'lodash';
import { Suspense, useId } from 'react';

const useStyles = createStyles(({ token, css }) => ({
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
  conversation: ConversationType;
  provider: ChatProviderType;
};

function createNewChat(
  id: string,
  conversationId: string,
  provider: ChatProviderType,
) {
  return {
    id,
    conversationId,
    label: 'Chat',
    sync: true,
    provider,
  };
}

export const Conversation: React.FC<ConversationProps> = ({
  conversation,
  provider,
}) => {
  const defaultChat = createNewChat(useId(), conversation.id, provider);
  const { list, remove, push, replace } = useDynamicList<ChatType>([
    defaultChat,
  ]);
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
        {map(list, (chat, index) => (
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
                const mergedChat = _.merge({}, chat, newChatProperties);
                replace(index, mergedChat);
              }}
              fetchOnClient
              onRequestClose={() => remove(index)}
              onCreateNewChat={() => {
                push(
                  createNewChat(
                    list.length.toString(),
                    conversation.id,
                    chat.provider,
                  ),
                );
              }}
              closable={list.length > 1}
            />
          </Suspense>
        ))}
      </Flex>
    </Flex>
  );
};
