import { ChatPageQuery } from '../__generated__/ChatPageQuery.graphql';
import BAICard from '../components/BAICard';
import ChatCard from '../components/Chat/ChatCard';
import {
  type ChatHistoryData,
  createChats,
  getChatsById,
  useHistory,
} from '../components/Chat/ChatHistory';
import type { ChatProviderData } from '../components/Chat/ChatModel';
import Flex from '../components/Flex';
import { useSuspendedBackendaiClient } from '../hooks';
import { Button, Drawer, List } from 'antd';
import { createStyles } from 'antd-style';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import { t } from 'i18next';
import _ from 'lodash';
import { HistoryIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { StringParam, useQueryParams } from 'use-query-params';

const useStyles = createStyles(({ css }) => ({
  chatViewHorizontal: css`
    overflow: auto;
    height: calc(100vh - 240px);
  `,
  chatViewVertical: css`
    overflow: hidden;
  `,
  chatCard: css`
    flex: 1;
    overflow: 'hidden';
  `,
}));

function useDefaultEndpointId() {
  const baiClient = useSuspendedBackendaiClient();
  const { endpoint_list } = useLazyLoadQuery<ChatPageQuery>(
    graphql`
      query ChatPageQuery($filter: String) {
        endpoint_list(limit: 1, offset: 0, filter: $filter) {
          items {
            endpoint_id
          }
        }
      }
    `,
    {
      filter: baiClient.supports('endpoint-lifecycle-stage-filter')
        ? 'lifecycle_stage == "created"'
        : undefined,
    },
  );

  return endpoint_list?.items[0]?.endpoint_id || undefined;
}

function useChatProviderData(defaultEndpointId?: string): ChatProviderData {
  const [{ endpointId, modelId, agentId, apiKey }] = useQueryParams({
    endpointId: StringParam,
    agentId: StringParam,
    modelId: StringParam,
    apiKey: StringParam,
  });

  return {
    basePath: 'v1', // Use OpenAPI 'v1' for OpenAI compatibility basePath,
    baseURL: '',
    endpointId: endpointId ?? defaultEndpointId ?? undefined,
    agentId: agentId ?? undefined,
    modelId: modelId ?? undefined,
    apiKey: apiKey ?? undefined,
  };
}

interface ChatHistoryDrawerProps {
  history: ChatHistoryData[];
  open?: boolean;
  onClickClose: () => void;
  onClickRemove: (id: string) => void;
  onClickHistory: (id: string) => void;
}

const useChatNavigate = () => {
  const navigate = useNavigate();

  return ({ id, provider }: { id?: string; provider: ChatProviderData }) => {
    const chatId = id ? id : createChats({ provider }).id;
    navigate(`/chat/${chatId}`);
  };
};

const ChatHistoryDrawer = ({
  history,
  open,
  onClickClose,
  onClickRemove,
  onClickHistory,
}: ChatHistoryDrawerProps) => {
  return (
    <Drawer
      getContainer={false}
      open={open}
      onClose={onClickClose}
      mask={false}
      title="History"
    >
      <List
        dataSource={history.map((item) => ({
          title: item.label,
          id: item.id,
        }))}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                key="delete"
                type="text"
                icon={
                  <TrashIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      onClickRemove(item.id);
                    }}
                  />
                }
              />,
            ]}
            style={{ cursor: 'pointer' }}
            onClick={() => onClickHistory(item.id)}
          >
            <List.Item.Meta
              title={item.title}
              description={dayjs().format('YYYY-MM-DD HH:mm:ss')}
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};

const PureChatPage = ({
  id,
  provider,
}: {
  id: string;
  provider: ChatProviderData;
}) => {
  const { styles } = useStyles();
  const [openHistory, setOpenHistory] = useState(false);
  const {
    chats,
    history,
    addChat,
    removeChat,
    updateChat,
    saveMessage,
    clearMessage,
    removeHistory,
    updateHistory,
  } = useHistory(id);
  const navigate = useChatNavigate();

  return (
    <BAICard
      title={t('webui.menu.Chat')}
      styles={{
        body: { overflow: 'hidden', paddingTop: 0 },
      }}
      extra={
        <>
          <Button
            type="text"
            icon={<PlusIcon />}
            onClick={() => {
              setOpenHistory(false);
              navigate({ provider });
            }}
          />
          <Button
            type="text"
            icon={<HistoryIcon />}
            onClick={() => {
              setOpenHistory(!openHistory);
            }}
          />
        </>
      }
    >
      {id && (
        <Flex
          className={styles.chatViewVertical}
          direction="column"
          align="stretch"
          gap={'xs'}
        >
          <Flex
            className={styles.chatViewHorizontal}
            gap={'xs'}
            direction="row"
            align="stretch"
          >
            {_.map(chats, (chat, index) => (
              <ChatCard
                key={chat.id}
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
                  saveMessage(chat.id, message);

                  // Save first user message as the first chat
                  if (
                    chat.messages.length === 0 &&
                    message.role === 'user' &&
                    index === 0
                  ) {
                    const chats = getChatsById(id);
                    if (chats) {
                      updateHistory({
                        ...chats,
                        label: message.content,
                      });
                    }
                  }
                }}
                onClearMessage={(chat) => {
                  clearMessage(chat.id);
                }}
                closable={isClosable(chats?.length)}
                clonable={isClonable(chats?.length)}
              />
            ))}
          </Flex>
          <ChatHistoryDrawer
            open={openHistory}
            history={history}
            onClickClose={() => {
              setOpenHistory(false);
            }}
            onClickRemove={(historyId) => {
              removeHistory(historyId);

              const chat = history.filter(({ id }) => id !== historyId)[0];
              navigate({ id: chat?.id, provider });

              // Close history drawer if no more history items left
              if (history.length < 2) {
                setOpenHistory(false);
              }
            }}
            onClickHistory={(historyId) => {
              navigate({ id: historyId, provider });
              setOpenHistory(false);
            }}
          />
        </Flex>
      )}
    </BAICard>
  );
};

function isClosable(chatLength: number) {
  return chatLength > 1;
}

function isClonable(chatLength: number) {
  return chatLength <= 10;
}

const ChatPage: React.FC = () => {
  const defaultEndpointId = useDefaultEndpointId();
  const provider = useChatProviderData(defaultEndpointId);
  const { id } = useParams();
  const navigate = useChatNavigate();

  useEffect(() => {
    // Redirect as if id is not provided or does not exist
    if (!id || !getChatsById(id)) {
      navigate({ provider });
    }
  }, [navigate, provider, id]);

  return <>{id && <PureChatPage id={id} provider={provider} />}</>;
};

export default ChatPage;
