import { useUpdatableState } from '../../hooks';
import { useSuspenseTanQuery } from '../../hooks/reactQueryAlias';
import { AIAgent, useAIAgent } from '../../hooks/useAIAgent';
import PureChatHeader from './ChatHeader';
import PureChatInput from './ChatInput';
import ChatMessages from './ChatMessages';
import {
  BAIModel,
  ChatLifecycleEventType,
  ChatProviderType,
  ChatType,
  Model,
} from './ChatModel';
import { CustomModelAlert, CustomModelForm } from './CustomModelForm';
import {
  ChatCard_endpoint$data,
  ChatCard_endpoint$key,
} from './__generated__/ChatCard_endpoint.graphql';
import { createOpenAI } from '@ai-sdk/openai';
import { useChat } from '@ai-sdk/react';
import { extractReasoningMiddleware, streamText, wrapLanguageModel } from 'ai';
import { Alert, Card, CardProps, FormInstance } from 'antd';
import { createStyles } from 'antd-style';
import graphql from 'babel-plugin-relay/macro';
import { isEmpty } from 'lodash';
import _ from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFragment } from 'react-relay';

interface ChatCardProps extends CardProps, ChatLifecycleEventType {
  chat: ChatType;
  selectedEndpoint: ChatCard_endpoint$key | null;
  closable?: boolean;
  fetchOnClient?: boolean;
}

const useStyles = createStyles(({ token, css }) => ({
  chatCard: css`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  `,
  body: css`
    background-color: ${token.colorFillQuaternary};
    border-radius: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
    height: 50%;
    position: relative;
  `,
  actions: css`
    padding-left: ${token.paddingContentHorizontal};
    padding-right: ${token.paddingContentHorizontal};
  `,
  header: css`
    zindex: 1;
  `,
  alert: css`
    margin: ${token.marginSM};
  `,
}));

function useEndpoint(selectedEndpoint?: ChatCard_endpoint$key | null) {
  const [endpointKey, setEndpoint] = useState<ChatCard_endpoint$key | null>(
    selectedEndpoint || null,
  );
  const endpoint = useFragment(
    graphql`
      fragment ChatCard_endpoint on Endpoint {
        endpoint_id
        url
      }
    `,
    endpointKey,
  );

  return { endpoint, setEndpoint } as const;
}

function useModels(
  provider: ChatProviderType,
  fetchKey: string,
  endpoint?: ChatCard_endpoint$data | null,
) {
  const { data: modelsResult } = useSuspenseTanQuery<{
    data: Array<Model>;
  }>({
    queryKey: ['models', fetchKey, endpoint?.endpoint_id],
    queryFn: () => {
      return endpoint?.url
        ? fetch(
            new URL(
              provider.basePath + '/models',
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

  const selectedModelId = useMemo(
    () =>
      provider.modelId &&
      _.includes(_.map(modelsResult?.data, 'id'), provider.modelId)
        ? provider.modelId
        : (modelsResult?.data?.[0]?.id ?? 'custom'),
    [modelsResult?.data, provider.modelId],
  );

  const [modelId, setModelId] = useState<string>(selectedModelId);

  useEffect(() => {
    setModelId(selectedModelId);
  }, [selectedModelId]);

  return { models, modelId, setModelId } as const;
}

function useAgents(provider: ChatProviderType) {
  const { agents } = useAIAgent();
  const [agent, setAgent] = useState<AIAgent | undefined>(undefined);

  const selectedAgent = useMemo(() => {
    return agents.find((a) => a.id === provider.agentId);
  }, [agents, provider.agentId]);

  useEffect(() => {
    setAgent(selectedAgent);
  }, [selectedAgent]);

  return { agents, agent, setAgent } as const;
}

const ChatHeader = React.memo(PureChatHeader, (prev, next) => {
  if (prev.modelId !== next.modelId) return false;
  if (prev.endpoint !== next.endpoint) return false;
  if (prev.agent !== next.agent) return false;
  if (prev.fetchKey !== next.fetchKey) return false;
  if (prev.sync !== next.sync) return false;
  if (prev.closable !== next.closable) return false;
  return true;
});

const ChatInput = React.memo(PureChatInput, (prev, next) => {
  if (prev.input !== next.input) return false;
  if (prev.sync !== next.sync) return false;
  if (prev.isLoading !== next.isLoading) return false;
  return true;
});

const ChatCard: React.FC<ChatCardProps> = ({
  chat,
  selectedEndpoint,
  closable,
  fetchOnClient,
  onRequestClose,
  onCreateNewChat,
}) => {
  const {
    styles: { chatCard: chatCardStyle, alert: alertStyle, ...chatCardStyles },
  } = useStyles();
  const formRef = useRef<FormInstance>(null);
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [startTime, setStartTime] = useState<number | null>(null);

  const { endpoint, setEndpoint } = useEndpoint(selectedEndpoint);
  const { models, modelId, setModelId } = useModels(
    chat.provider,
    fetchKey,
    endpoint,
  );
  const { agents, agent, setAgent } = useAgents(chat.provider);
  const [sync, setSync] = useState(chat.sync);

  const baseURL = endpoint?.url
    ? new URL(chat.provider.basePath, endpoint?.url ?? undefined).toString()
    : undefined;

  const allowCustomModel = isEmpty(models);
  const providerSettings = {
    baseURL: allowCustomModel
      ? formRef.current?.getFieldValue('baseURL')
      : baseURL,
    modelId: allowCustomModel
      ? formRef.current?.getFieldValue('modelId')
      : modelId,
    apiKey: allowCustomModel
      ? formRef.current?.getFieldValue('token')
      : chat.provider.apiKey,
  };

  const {
    error,
    messages,
    input,
    setInput,
    stop,
    isLoading,
    append,
    setMessages,
  } = useChat({
    id: `${chat.id}-${endpoint?.endpoint_id}-${agent?.id ?? 'none'}-${modelId}`,
    api: baseURL,
    credentials: chat.provider.credentials,
    body: {
      modelId: modelId,
    },
    experimental_throttle: 100,
    fetch: async (input, init) => {
      if (fetchOnClient || modelId === 'custom') {
        const body = JSON.parse(init?.body as string);
        const provider = createOpenAI({
          baseURL: providerSettings.baseURL,
          apiKey: providerSettings.apiKey || 'dummy',
        });
        const result = streamText({
          abortSignal: init?.signal || undefined,
          model: wrapLanguageModel({
            model: provider(providerSettings.modelId),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
          }),
          messages: body?.messages,
          system: agent ? (agent.config.system_prompt ?? '') : '',
        });

        setStartTime(Date.now());

        return result.toDataStreamResponse({
          sendReasoning: true,
        });
      } else {
        return fetch(input, init);
      }
    },
  });

  return (
    <Card
      bordered
      className={chatCardStyle}
      classNames={chatCardStyles}
      title={
        <ChatHeader
          chat={chat}
          allowCustomModel={allowCustomModel}
          models={models}
          modelId={modelId}
          setModelId={setModelId}
          endpoint={endpoint}
          setEndpoint={setEndpoint}
          agents={agents}
          agent={agent}
          setAgent={setAgent}
          sync={sync}
          setSync={setSync}
          fetchKey={fetchKey}
          closable={closable}
          onCreateNewChat={onCreateNewChat}
          onRequestClose={onRequestClose}
          setMessages={setMessages}
        />
      }
    >
      <CustomModelForm
        modelId={modelId}
        baseURL={baseURL}
        formRef={formRef}
        allowCustomModel={allowCustomModel}
        alert={
          formRef && (
            <CustomModelAlert onClick={() => updateFetchKey(baseURL)} />
          )
        }
      />
      {!_.isEmpty(error?.message) ? (
        <Alert
          message={error?.message}
          type="error"
          showIcon
          className={alertStyle}
          closable
        />
      ) : null}
      <ChatMessages
        messages={messages}
        input={input}
        isLoading={isLoading}
        startTime={startTime}
      />
      <ChatInput
        sync={sync}
        input={input}
        setInput={setInput}
        stop={stop}
        append={append}
        isLoading={isLoading}
      />
    </Card>
  );
};

export default ChatCard;
