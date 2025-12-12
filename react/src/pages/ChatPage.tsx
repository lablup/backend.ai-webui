import { ChatPageQuery } from '../__generated__/ChatPageQuery.graphql';
import ChatCard from '../components/Chat/ChatCard';
import {
  type ChatHistoryData,
  generateChatId,
  getChatById,
  useHistory,
} from '../components/Chat/ChatHistory';
import { type ChatProviderData } from '../components/Chat/ChatModel';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { Badge, Button, Card, Drawer, List, Tooltip, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex, BAICard } from 'backend.ai-ui';
import dayjs from 'dayjs';
import { t } from 'i18next';
import _ from 'lodash';
import { HistoryIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Suspense, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';
import { StringParam, useQueryParams } from 'use-query-params';

const useStyles = createStyles(({ css }) => ({
  fixEditableVerticalAlign: css`
    & {
      top: 0 !important;
      margin: 0px !important;
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
      filter: baiClient.supports('endpoint-lifecycle-ready-stage')
        ? 'lifecycle_stage == "ready" | lifecycle_stage == "created"'
        : 'lifecycle_stage == "created"',
    },
  );

  return endpoint_list?.items[0]?.endpoint_id || undefined;
}

export function useChatProviderData(
  defaultEndpointId?: string,
): ChatProviderData {
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
  selectedHistoryId?: string;
  history: ChatHistoryData[];
  open?: boolean;
  onClickClose: () => void;
  onClickRemove: (id: string) => void;
  onClickHistory: (id: string) => void;
}

const ChatHistoryDrawer = ({
  selectedHistoryId,
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
        body: { paddingBlock: 0 },
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
            styles={{
              actions: {
                padding: 0,
              },
            }}
            onClick={() => onClickHistory(item.id)}
          >
            <List.Item.Meta
              title={
                <Badge dot={selectedHistoryId === item.id}>{item.title}</Badge>
              }
              description={dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};

const PureChatPage = ({ id }: { id: string }) => {
  'use memo';

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
                    triggerType: ['icon', 'text'],
                  }
                : undefined
            }
          >
            {chat.label}
          </Typography.Text>
        }
        style={{
          overflow: 'hidden',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
        styles={{
          body: {
            overflow: 'hidden',
            height: '100%',
            paddingTop: 0,
          },
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
          <BAIFlex
            direction="column"
            align="stretch"
            gap={'xs'}
            style={{
              overflow: 'hidden',
              minHeight: 0,
              height: '100%',
            }}
          >
            <Suspense fallback={<Card loading />}>
              {_.map(chat.chats, (chatData) => (
                <ChatCard
                  key={chatData.id}
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
                  onClearMessage={(chatData) => {
                    clearChatMessage(chatData.id);
                  }}
                  closable={isClosable(chat.chats.length)}
                  cloneable={isClonable(chat.chats.length)}
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                  }}
                />
              ))}
            </Suspense>
          </BAIFlex>
        )}
        <ChatHistoryDrawer
          selectedHistoryId={chat.id}
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

  return <PureChatPage id={id || generateChatId()} />;
};

export default ChatPage;
