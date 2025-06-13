import { ChatPageQuery } from '../__generated__/ChatPageQuery.graphql';
import BAICard from '../components/BAICard';
import ChatCard from '../components/Chat/ChatCard';
import {
  type ChatHistoryData,
  generateChatId,
  getChatById,
  useHistory,
} from '../components/Chat/ChatHistory';
import { type ChatProviderData } from '../components/Chat/ChatModel';
import Flex from '../components/Flex';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { Button, Drawer, List, Tooltip, Typography } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { t } from 'i18next';
import _ from 'lodash';
import { HistoryIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';
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
  fixEditableVerticalAlign: css`
    & {
      margin-top: 0px !important;
      inset-inline-start: 0px !important;
    }
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
      maskClosable={true}
      title={t('chatui.History')}
     styles={{
        body: { paddingRight: 0 },
      }}
    >
      <List
        dataSource={history.map((item) => ({
          title: item.label,
          id: item.id,
          updatedAt: item.updatedAt,
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
              description={dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};

const PureChatPage = ({ id }: { id: string }) => {
  const defaultEndpointId = useDefaultEndpointId();
  const provider = useChatProviderData(defaultEndpointId);
  const { styles } = useStyles();
  const [openHistory, setOpenHistory] = useState(false);
  const {
    chat,
    history,
    addChatData,
    removeChatData,
    updateChatData,
    saveChatMessage,
    clearChatMessage,
    removeHistory,
    updateHistory,
  } = useHistory(id, provider);
  const navigate = useWebUINavigate();

  return (
    chat && (
      <BAICard
        title={
          <Typography.Text
            className={styles.fixEditableVerticalAlign}
            editable={
              getChatById(chat.id)
                ? {
                    onChange: (value) => {
                      if (!_.isEmpty(value)) {
                        updateHistory({ ...chat, label: value });
                      }
                    },
                    text: chat.label,
                  }
                : undefined
            }
          >
            {chat.label}
          </Typography.Text>
        }
        styles={{
          body: { overflow: 'hidden', paddingTop: 0 },
        }}
        extra={
          <>
            <Tooltip title={t('chatui.NewChat')}>
              <Button
                type="text"
                icon={<PlusIcon />}
                onClick={() => {
                  setOpenHistory(false);
                  navigate('/chat', { replace: true });
                }}
              />
            </Tooltip>
            <Tooltip title={t('chatui.History')}>
              <Button
                type="text"
                icon={<HistoryIcon />}
                onClick={() => {
                  setOpenHistory(!openHistory);
                }}
              />
            </Tooltip>
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
              {_.map(chat.chats, (chatData, index) => (
                <ChatCard
                  key={chatData.id}
                  className={styles.chatCard}
                  chat={chatData}
                  onUpdateChat={(newChatProperties) => {
                    updateChatData(chatData.id, newChatProperties);
                  }}
                  fetchOnClient
                  onRemoveChat={() => {
                    removeChatData(chatData.id);
                  }}
                  onAddChat={() => {
                    addChatData(chatData);
                  }}
                  onSaveMessage={(message) => {
                    saveChatMessage(chatData.id, message);
                  }}
                  onClearMessage={(chat) => {
                    clearChatMessage(chat.id);
                  }}
                  closable={isClosable(chat.chats.length)}
                  cloneable={isClonable(chat.chats.length)}
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
                const remainHistories = removeHistory(historyId);

                if (remainHistories === 0) {
                  setOpenHistory(false);
                  navigate('/chat', { replace: true });
                } else if (historyId === chat.id) {
                  const chat = history.filter(({ id }) => id !== historyId)[0];
                  navigate(`/chat/${chat?.id}`, { replace: true });
                }
              }}
              onClickHistory={(historyId) => {
                navigate(`/chat/${historyId}`, { replace: true });
              }}
            />
          </Flex>
        )}
      </BAICard>
    )
  );
};

function isClosable(chatLength: number) {
  return chatLength > 1;
}

function isClonable(chatLength: number) {
  return chatLength <= 10;
}

const ChatPage: React.FC = () => {
  const { id } = useParams();

  const webuiNavigate = useWebUINavigate();

  if (id && !getChatById(id)) {
    webuiNavigate(`/chat`, { replace: true });
  }

  return (
    <>
      <PureChatPage id={id || generateChatId()} />
    </>
  );
};

export default ChatPage;
