import { useUpdatableState } from '../../hooks';
import { useSuspenseTanQuery } from '../../hooks/reactQueryAlias';
import ChatBody from './ChatBody';
// import Flex from '../Flex';
// import ChatBody from './ChatBody';
import ChatHeader from './ChatHeader';
import { Model } from './ChatUIModal';
import { CustomModelForm, CustomModelAlert } from './CustomModelForm';
import { ChatCard_endpoint$key } from './__generated__/ChatCard_endpoint.graphql';
import { AttachmentsProps } from '@ant-design/x';
import { Card, CardProps, FormInstance, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { atom, useAtom } from 'jotai';
import _, { isEmpty } from 'lodash';
import React, { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

const synchronizedMessageState = atom<string>('');
const synchronizedAttachmentState = atom<AttachmentsProps['items']>();
const chatSubmitKeyInfoState = atom<{ id: string; key: string } | undefined>(
  undefined,
);

function useSynconizedMessage() {
  const [synchronizedMessage, setSynchronizedMessage] = useAtom(
    synchronizedMessageState,
  );
  const [synchronizedAttachment, setSynchronizedAttachment] = useAtom(
    synchronizedAttachmentState,
  );

  const [chatSubmitKeyInfo, setChatSubmitKeyInfo] = useAtom(
    chatSubmitKeyInfoState,
  );

  const submitId = useId();

  return {
    synchronizedMessage,
    setSynchronizedMessage,
    synchronizedAttachment,
    setSynchronizedAttachment,
    chatSubmitKeyInfo,
    setChatSubmitKeyInfo,
    submitId,
  };
}

export type BAIModel = {
  id: string;
  label?: string;
  name?: string;
  group?: string;
  created?: string;
  description?: string;
};

interface ChatCardProps extends CardProps {
  basePath?: string;
  closable?: boolean;
  defaultModelId?: string;
  defaultEndpoint?: ChatCard_endpoint$key;
  defaultAgentId?: string;
  isSynchronous?: boolean;
  onRequestClose?: () => void;
  onModelChange?: (modelId: string) => void;
}

function useChatCardStyles() {
  const { token } = theme.useToken();

  return {
    style: {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    styles: {
      body: {
        backgroundColor: token.colorFillQuaternary,
        borderRadius: 0,
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        padding: 0,
        height: '50%',
        position: 'relative' as React.CSSProperties['position'],
      },
      actions: {
        paddingLeft: token.paddingContentHorizontal,
        paddingRight: token.paddingContentHorizontal,
      },
      header: {
        zIndex: 1,
      },
    },
  };
}

const ChatCard: React.FC<ChatCardProps> = ({
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
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [endpointFrgmt, setEndpointFrgmt] =
    useState<ChatCard_endpoint$key | null>(defaultEndpoint || null);
  const endpoint = useFragment(
    graphql`
      fragment ChatCard_endpoint on Endpoint {
        endpoint_id
        url
      }
    `,
    endpointFrgmt,
  );
  const [promisingEndpoint, setPromisingEndpoint] = useState(endpoint);

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

  const modelId =
    defaultModelId &&
    _.includes(_.map(modelsResult?.data, 'id'), defaultModelId)
      ? defaultModelId
      : (modelsResult?.data?.[0]?.id ?? 'custom');

  const [agentId, setAgentId] = useState<string | undefined>();

  // const submitId = useId();

  useEffect(() => {
    setAgentId(defaultAgentId);
  }, [defaultAgentId]);

  const customModelFormRef = useRef<FormInstance>(null);

  const baseURL = endpoint?.url
    ? new URL(basePath, endpoint?.url ?? undefined).toString()
    : undefined;

  const isEmptyModel = isEmpty(models);

  const { style, styles } = useChatCardStyles();

  return (
    <Card
      bordered
      style={style}
      styles={{ ...styles }}
      title={
        <ChatHeader
          setModelId={onModelChange}
          models={models}
          setEndpointFrgmt={setEndpointFrgmt}
          setPromisingEndpoint={setPromisingEndpoint}
          closable={closable}
        />
      }
    >
      <CustomModelForm
        baseURL={baseURL}
        customModelFormRef={customModelFormRef}
        allowCustomModel={isEmptyModel}
        alert={
          isEmptyModel && <CustomModelAlert onClick={() => updateFetchKey()} />
        }
      />
      <ChatBody baseURL={baseURL} agentId={agentId} modelId={modelId} />
    </Card>
  );
};

export default ChatCard;
