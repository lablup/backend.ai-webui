/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ChatPageQuery } from '../__generated__/ChatPageQuery.graphql';
import ChatCard from '../components/Chat/ChatCard';
import {
  type ChatHistoryData,
  generateChatId,
  getChatById,
  useHistory,
} from '../components/Chat/ChatHistory';
import { type ChatProviderData } from '../components/Chat/ChatModel';
import WebUINavigate from '../components/WebUINavigate';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import {
  Alert,
  Badge,
  Button,
  Card,
  Drawer,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import { createStyles } from 'antd-style';
import {
  BAIButton,
  BAIFlex,
  BAICard,
  BAITable,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { t } from 'i18next';
import * as _ from 'lodash-es';
import { HistoryIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { parseAsString, useQueryStates } from 'nuqs';
import { Suspense, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';

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
  'use memo';
  const baiClient = useSuspendedBackendaiClient();

  const { myDeployments } = useLazyLoadQuery<ChatPageQuery>(
    graphql`
      query ChatPageQuery($filter: DeploymentFilter) {
        myDeployments(filter: $filter, limit: 1, offset: 0) {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
    {
      // Select a deployment with an actively-serving replica. When the manager
      // supports the nested replica filter, filter on replica traffic status;
      // otherwise (25.19.0–<26.8.0) fall back to excluding terminated
      // deployments (the interim FR-3303 behavior). The version gate lives in
      // the client `deployment-replica-nested-filter` support flag rather than a
      // hardcoded version compare here. The whole deployment-selection surface
      // targets the Strawberry v2 Deployments API (myDeployments/DeploymentFilter,
      // manager ≥25.19.0), same baseline as the FR-2664 Deployments UI.
      //
      // NOTE: This is intentionally left without a current-project scope. The
      // legacy endpoint_list query wasn't project-scoped either — it declared a
      // `project` arg but never passed a value (always null) — so this preserves
      // the prior behavior rather than changing it here. It does diverge from
      // DeploymentListPage, which scopes myDeployments by
      // `projectId: { equals: currentProject.id }`.
      // TODO(FR-3332): investigate why Chat endpoint selection has never been
      // project-scoped and decide whether it should align with the new
      // Deployments UI.
      filter: baiClient.supports('deployment-replica-nested-filter')
        ? { replicas: { some: { trafficStatus: { equals: 'ACTIVE' } } } }
        : { status: { notIn: ['STOPPING', 'STOPPED'] } },
    },
  );

  const deploymentId = myDeployments?.edges[0]?.node?.id;
  return deploymentId ? toLocalId(deploymentId) : undefined;
}

export function useChatProviderData(
  defaultEndpointId?: string,
): ChatProviderData {
  const [{ endpointId, modelId, agentId, apiKey }] = useQueryStates({
    endpointId: parseAsString,
    agentId: parseAsString,
    modelId: parseAsString,
    apiKey: parseAsString,
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
  'use memo';

  const { token } = theme.useToken();

  return (
    <Drawer
      getContainer={false}
      open={open}
      onClose={onClickClose}
      mask={false}
      maskClosable={true}
      title={t('chatui.History')}
      size={300}
      styles={{
        body: {
          paddingBlock: 0,
          paddingLeft: token.size,
          paddingRight: token.size,
        },
      }}
    >
      <BAITable
        showHeader={false}
        dataSource={history.map((item) => ({
          title: item.label,
          id: item.id,
          updatedAt: item.updatedAt,
          key: item.id,
        }))}
        columns={[
          {
            key: 'title',
            dataIndex: 'title',
            render: (title, record) => (
              <BAIFlex direction="column" gap="xs" align="start">
                <Badge dot={selectedHistoryId === record.id}>
                  <Typography.Text strong>{title}</Typography.Text>
                </Badge>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: token.fontSizeSM }}
                >
                  {dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Typography.Text>
              </BAIFlex>
            ),
          },
          {
            key: 'actions',
            width: token.sizeXXL,
            render: (_, record) => (
              <Button
                type="text"
                icon={<TrashIcon size={token.size} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onClickRemove(record.id);
                }}
              />
            ),
          },
        ]}
        onRow={(record) => ({
          onClick: () => onClickHistory(record.id),
          style: { cursor: 'pointer' },
        })}
        pagination={false}
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
  const [chatIntroAlertDismissed, setChatIntroAlertDismissed] =
    useBAISettingUserState('chat_intro_alert_dismissed');
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
      <BAIFlex
        direction="column"
        align="stretch"
        gap="sm"
        style={{ height: '100%', overflow: 'hidden', minHeight: 0 }}
      >
        {!chatIntroAlertDismissed && (
          <Alert
            type="info"
            showIcon
            closable={{
              closeIcon: true,
              afterClose: () => setChatIntroAlertDismissed(true),
            }}
            title={t('chatui.intro.Title')}
            description={t('chatui.intro.Description')}
          />
        )}
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
            flex: 1,
          }}
          styles={{
            body: {
              overflow: 'hidden',
              height: '100%',
              paddingTop: 0,
            },
          }}
          extra={
            <BAIFlex>
              <Tooltip title={t('chatui.NewChat')}>
                <BAIButton
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
            </BAIFlex>
          }
        >
          <BAIFlex
            direction="column"
            align="stretch"
            style={{
              overflow: 'hidden',
              minHeight: 0,
              height: '100%',
            }}
          >
            {id && (
              <BAIFlex
                direction="row"
                align="stretch"
                gap={'xs'}
                style={{
                  overflow: 'hidden',
                  minHeight: 0,
                  flex: 1,
                }}
              >
                <Suspense fallback={<Card loading style={{ width: '100%' }} />}>
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
          </BAIFlex>
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
      </BAIFlex>
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

  if (id && !getChatById(id)) {
    return <WebUINavigate to="/chat" replace />;
  }

  return <PureChatPage id={id || generateChatId()} />;
};

export default ChatPage;
