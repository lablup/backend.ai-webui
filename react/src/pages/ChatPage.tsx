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
import { useProjectPath } from '../hooks/useRouteScope';
import { Banner } from '@astryxdesign/core/Banner';
import { Card } from '@astryxdesign/core/Card';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Heading, Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { useTheme } from '@astryxdesign/core/theme';
import { Drawer } from '@astryxdesign/lab';
import { BAIFlex, BAITable, toLocalId } from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { HistoryIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { parseAsString, useQueryStates } from 'nuqs';
import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';

function useDefaultDeploymentId() {
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
      // supports the nested replica filter, keep deployments that have a
      // RUNNING, traffic-active replica — this mirrors the manager's own
      // "serving" definition (RouteStatus RUNNING; traffic_status ACTIVE is the
      // traffic-enabled flag). Deployment-level `status` is a monotonic
      // lifecycle axis, not a real-time serving signal, so it can't stand in for
      // this. Older managers (25.19.0–<26.8.0) fall back to excluding terminated
      // deployments by lifecycle status (the interim FR-3303 behavior). The
      // version gate lives in
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
        ? {
            replicas: {
              some: {
                status: { equals: 'RUNNING' },
                trafficStatus: { equals: 'ACTIVE' },
              },
            },
          }
        : { status: { notIn: ['STOPPING', 'STOPPED'] } },
    },
  );

  const deploymentId = myDeployments?.edges[0]?.node?.id;
  return deploymentId ? toLocalId(deploymentId) : undefined;
}

export function useChatProviderData(
  defaultDeploymentId?: string,
): ChatProviderData {
  const [{ deploymentId, modelId, agentId, apiKey }] = useQueryStates({
    deploymentId: parseAsString,
    agentId: parseAsString,
    modelId: parseAsString,
    apiKey: parseAsString,
  });

  return {
    basePath: 'v1', // Use OpenAPI 'v1' for OpenAI compatibility basePath,
    baseURL: '',
    deploymentId: deploymentId ?? defaultDeploymentId ?? undefined,
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

  const { token } = useTheme();
  const { t } = useTranslation();

  return (
    <Drawer
      isOpen={!!open}
      onClose={onClickClose}
      hasScrim={false}
      side="end"
      size={300}
      label={t('chatui.History')}
    >
      <VStack gap={4} align="stretch" style={{ padding: 'var(--spacing-6)' }}>
        <Heading level={5}>{t('chatui.History')}</Heading>
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
                  {/* PILOT-DECISION: antd `Badge dot` (selected-row marker) has
                      no Astryx overlay destination (MAPPING.md §3.8) —
                      self-built inline dot. */}
                  <HStack gap={1} align="center">
                    {selectedHistoryId === record.id && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-accent)',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Text weight="semibold">{title}</Text>
                  </HStack>
                  <Text
                    color="secondary"
                    style={{ fontSize: token('--font-size-sm') }}
                  >
                    {dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Text>
                </BAIFlex>
              ),
            },
            {
              key: 'actions',
              width: token('--spacing-12'),
              render: (_, record) => (
                <IconButton
                  variant="ghost"
                  icon={<TrashIcon size={token('--spacing-4')} />}
                  label={t('chatui.DeleteChattingSession')}
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
      </VStack>
    </Drawer>
  );
};

interface EditableChatTitleProps {
  label: string;
  editable: boolean;
  onChange: (value: string) => void;
}

// PILOT-DECISION: antd `Typography.Text editable` (click-to-rename in place)
// has no Astryx destination (MAPPING.md §3.4 — `editable` is NONE, self-build).
// Rebuilt as a minimal toggle between a `Heading` + edit `IconButton` and a
// controlled `TextInput` that commits on blur/Enter and reverts on Escape.
// `level={5}` = 16px on the restored antd type ramp — this is a BAICard title
// slot, so it matches every other card title (`BAICard` renders its own string
// titles at the same level). It was `level={3}` while Astryx's own ramp put
// 17px there; on the antd ramp heading-3 is 24px, which read as a page title.
const EditableChatTitle: React.FC<EditableChatTitleProps> = ({
  label,
  editable,
  onChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(label);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resync the local edit draft when the external chat label changes (e.g. rename saved elsewhere)
    setDraft(label);
  }, [label]);

  if (!editable) {
    return <Heading level={5}>{label}</Heading>;
  }

  if (isEditing) {
    const commit = () => {
      setIsEditing(false);
      if (draft.trim() && draft !== label) {
        onChange(draft.trim());
      } else {
        setDraft(label);
      }
    };
    return (
      <TextInput
        label={t('chatui.ChatTitle')}
        isLabelHidden
        value={draft}
        onChange={setDraft}
        hasAutoFocus
        onEnter={commit}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setDraft(label);
            setIsEditing(false);
          }
        }}
        onBlur={commit}
        width={280}
      />
    );
  }

  return (
    <HStack gap={1} align="center">
      <Heading level={5}>{label}</Heading>
      <IconButton
        variant="ghost"
        size="sm"
        icon={<PencilIcon size="1em" />}
        label={t('button.Edit')}
        onClick={() => setIsEditing(true)}
      />
    </HStack>
  );
};

const PureChatPage = ({ id }: { id: string }) => {
  'use memo';

  const { t } = useTranslation();
  const defaultDeploymentId = useDefaultDeploymentId();
  const provider = useChatProviderData(defaultDeploymentId);
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
  const buildProjectPath = useProjectPath();

  return (
    chat && (
      <BAIFlex
        direction="column"
        align="stretch"
        gap="sm"
        style={{ height: '100%', overflow: 'hidden', minHeight: 0 }}
      >
        {!chatIntroAlertDismissed && (
          <Banner
            status="info"
            title={t('chatui.intro.Title')}
            description={t('chatui.intro.Description')}
            isDismissable
            onDismiss={() => setChatIntroAlertDismissed(true)}
          />
        )}
        {/* PILOT-DECISION: Astryx `Card` is a bare container (MAPPING.md
            §5.1) — the header/body split is hand-composed (BAICardAstryx's
            generic recipe assumes a padded body, which collides with this
            page's full-bleed chat body). */}
        <Card
          padding={6}
          variant="default"
          style={{
            overflow: 'hidden',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <VStack
            gap={4}
            align="stretch"
            style={{ overflow: 'hidden', minHeight: 0, flex: 1 }}
          >
            <HStack justify="between" align="center" wrap="wrap" gap={2}>
              <EditableChatTitle
                label={chat.label}
                editable={!!getChatById(chat.id)}
                onChange={(value) => {
                  updateHistory({ ...chat, label: value });
                }}
              />
              <BAIFlex>
                <Tooltip content={t('chatui.NewChat')}>
                  <IconButton
                    variant="ghost"
                    icon={<PlusIcon />}
                    label={t('chatui.NewChat')}
                    onClick={() => {
                      setOpenHistory(false);
                      navigate(buildProjectPath('chat'), { replace: true });
                    }}
                  />
                </Tooltip>
                <Tooltip content={t('chatui.History')}>
                  <IconButton
                    variant="ghost"
                    icon={<HistoryIcon />}
                    label={t('chatui.History')}
                    onClick={() => {
                      setOpenHistory(!openHistory);
                    }}
                  />
                </Tooltip>
              </BAIFlex>
            </HStack>
            {/* `flex: 1` + `minHeight: 0`, never `height: 100%`. This column is
                a flex child of the `VStack` above, which also holds the title
                row. `height: 100%` resolves against the VStack's *full* height
                and so ignores that sibling — the column then overflows the
                VStack by exactly the title row's height, and the VStack's
                `overflow: hidden` eats that much off the bottom, which is
                where the composer lives. Growing into the leftover space
                instead keeps the whole height budget honest. */}
            <BAIFlex
              direction="column"
              align="stretch"
              style={{
                overflow: 'hidden',
                minHeight: 0,
                flex: 1,
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
                  <Suspense
                    fallback={
                      <Skeleton width="100%" height="100%" radius={3} />
                    }
                  >
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
          </VStack>
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
                navigate(buildProjectPath('chat'), { replace: true });
              } else if (historyId === chat.id) {
                const chat = history.filter(({ id }) => id !== historyId)[0];
                navigate(buildProjectPath(`chat/${chat?.id}`), {
                  replace: true,
                });
              }
            }}
            onClickHistory={(historyId) => {
              navigate(buildProjectPath(`chat/${historyId}`), {
                replace: true,
              });
            }}
          />
        </Card>
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
  'use memo';
  const { id } = useParams();
  const buildProjectPath = useProjectPath();

  if (id && !getChatById(id)) {
    return <WebUINavigate to={buildProjectPath('chat')} replace />;
  }

  return <PureChatPage id={id || generateChatId()} />;
};

export default ChatPage;
