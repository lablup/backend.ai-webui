import { useUpdatableState } from '../../hooks';
import { useSuspenseTanQuery } from '../../hooks/reactQueryAlias';
import { useAIAgent } from '../../hooks/useAIAgent';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import AIAgentSelect from '../AIAgentSelect';
import EndpointSelect from '../EndpointSelect';
import Flex from '../Flex';
import { FluentEmojiIcon } from '../FluentEmojiIcon';
import { Model } from './ChatUIModal';
import LLMChatCard, { BAIModel } from './LLMChatCard';
import { EndpointLLMChatCard_endpoint$key } from './__generated__/EndpointLLMChatCard_endpoint.graphql';
import { CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { AttachmentsProps } from '@ant-design/x';
import { Alert, Button, CardProps, Popconfirm, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { atom, useAtom } from 'jotai';
import _ from 'lodash';
import React, {
  startTransition,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

const synchronizedMessageState = atom<string>('');
const synchronizedAttachmentState = atom<AttachmentsProps['items']>();
const chatSubmitKeyInfoState = atom<{ id: string; key: string } | undefined>(
  undefined,
);

interface EndpointLLMChatCardProps extends CardProps {
  basePath?: string;
  closable?: boolean;
  defaultModelId?: string;
  defaultEndpoint?: EndpointLLMChatCard_endpoint$key;
  defaultAgentId?: string;
  isSynchronous?: boolean;
  onRequestClose?: () => void;
  onModelChange?: (modelId: string) => void;
}

const EndpointLLMChatCard: React.FC<EndpointLLMChatCardProps> = ({
  basePath = 'v1',
  closable,
  defaultModelId,
  defaultEndpoint,
  defaultAgentId,
  isSynchronous,
  onRequestClose,
  onModelChange,
  ...cardProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [endpointFrgmt, setEndpointFrgmt] =
    useState<EndpointLLMChatCard_endpoint$key | null>(defaultEndpoint || null);
  const endpoint = useFragment(
    graphql`
      fragment EndpointLLMChatCard_endpoint on Endpoint {
        endpoint_id
        url
      }
    `,
    endpointFrgmt,
  );
  const [promisingEndpoint, setPromisingEndpoint] = useState(endpoint);

  const [synchronizedMessage, setSynchronizedMessage] = useAtom(
    synchronizedMessageState,
  );
  const [synchronizedAttachment, setSynchronizedAttachment] = useAtom(
    synchronizedAttachmentState,
  );

  const [chatSubmitKeyInfo, setChatSubmitKeyInfo] = useAtom(
    chatSubmitKeyInfoState,
  );

  const { data: modelsResult } = useSuspenseTanQuery<{
    data: Array<Model>;
  }>({
    queryKey: ['models', fetchKey, endpoint?.endpoint_id],
    queryFn: () => {
      return endpoint?.url
        ? fetch(
            new URL(
              basePath + '/models',
              endpoint?.url ?? undefined,
            ).toString(),
          )
            .then((res) => res.json())
            .catch((e) => ({ data: [] }))
        : Promise.resolve({ data: [] });
    },
  });

  const models = _.map(modelsResult?.data, (m) => ({
    id: m.id,
    name: m.id,
  })) as BAIModel[];

  const submitId = useId();

  const { agents } = useAIAgent();
  const [agentId, setAgentId] = useState(defaultAgentId);
  const agent = useMemo(() => {
    return agents.find((a) => a.id === agentId);
  }, [agents, agentId]);
  const [experimentalAIAgents] = useBAISettingUserState(
    'experimental_ai_agents',
  );

  useEffect(() => {
    setAgentId(defaultAgentId);
  }, [defaultAgentId]);

  const targetURL = agent?.endpoint_url ?? endpoint?.url;
  return (
    <LLMChatCard
      {...cardProps}
      chatId={`${endpoint?.endpoint_id}_${agentId}`}
      baseURL={
        targetURL
          ? new URL(basePath, targetURL ?? undefined).toString()
          : undefined
      }
      apiKey={agent?.endpoint_token}
      models={models}
      systemPrompt={agent?.config?.system_prompt}
      fetchOnClient
      leftExtra={
        <>
          {experimentalAIAgents && agent && (
            <Flex gap="xs">
              <FluentEmojiIcon
                name={agent.meta.avatar}
                height={32}
                width={32}
              />
              <AIAgentSelect
                agents={agents}
                value={agentId}
                onChange={(agent) => {
                  startTransition(() => {
                    setAgentId(agent);
                  });
                }}
              />
            </Flex>
          )}
          {_.isEmpty(agent?.endpoint_url) && (
            <EndpointSelect
              placeholder={t('chatui.SelectEndpoint')}
              style={{
                fontWeight: 'normal',
              }}
              fetchKey={fetchKey}
              showSearch
              loading={promisingEndpoint?.endpoint_id !== endpoint?.endpoint_id}
              onChange={(v, endpoint) => {
                // TODO: fix type definitions
                // @ts-ignore
                setPromisingEndpoint(endpoint);
                startTransition(() => {
                  // @ts-ignore
                  setEndpointFrgmt(endpoint);
                });
              }}
              value={endpoint?.endpoint_id}
              popupMatchSelectWidth={false}
            />
          )}
        </>
      }
      modelId={
        agent?.config.default_model ||
        (defaultModelId &&
        _.includes(_.map(modelsResult?.data, 'id'), defaultModelId)
          ? defaultModelId
          : (modelsResult?.data?.[0]?.id ?? 'custom'))
      }
      hideModelSelect={
        !_.isEmpty(agent?.endpoint_url) &&
        !_.isEmpty(agent?.config.default_model)
      }
      extra={
        closable ? (
          <Popconfirm
            title={t('chatui.DeleteChattingSession')}
            description={t('chatui.DeleteChattingSessionDescription')}
            onConfirm={() => {
              onRequestClose?.();
            }}
            okText={t('button.Delete')}
            okButtonProps={{ danger: true }}
          >
            <Button
              icon={<CloseOutlined />}
              type="text"
              style={{ color: token.colorIcon }}
            />
          </Popconfirm>
        ) : undefined
      }
      allowCustomModel={_.isEmpty(models)}
      alert={
        _.isEmpty(models) && (
          <Alert
            type="warning"
            showIcon
            message={t('chatui.CannotFindModel')}
            action={
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  updateFetchKey();
                }}
              >
                {t('button.Refresh')}
              </Button>
            }
          />
        )
      }
      inputMessage={isSynchronous ? synchronizedMessage : undefined}
      onInputChange={(v) => {
        setSynchronizedMessage(v);
      }}
      inputAttachment={isSynchronous ? synchronizedAttachment : undefined}
      onAttachmentChange={(attachment) => {
        setSynchronizedAttachment(attachment);
      }}
      submitKey={
        chatSubmitKeyInfo?.id === submitId ? undefined : chatSubmitKeyInfo?.key
      }
      onSubmitChange={() => {
        setSynchronizedMessage('');
        setSynchronizedAttachment([]);
        if (isSynchronous) {
          setChatSubmitKeyInfo({
            id: submitId,
            key: new Date().toString(),
          });
        }
      }}
    />
  );
};

export default EndpointLLMChatCard;
