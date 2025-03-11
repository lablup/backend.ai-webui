import { useUpdatableState } from '../../hooks';
import { useSuspenseTanQuery } from '../../hooks/reactQueryAlias';
import Flex from '../Flex';
import ChatBody from './ChatBody';
import ChatTitle from './ChatTitle';
import { Model } from './ChatUIModal';
import CustomModelForm from './CustomModelForm';
import { ChatCard_endpoint$key } from './__generated__/ChatCard_endpoint.graphql';
import { ReloadOutlined } from '@ant-design/icons';
import { AttachmentsProps } from '@ant-design/x';
import { Alert, Button, CardProps, FormInstance } from 'antd';
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

  const ChatCardStyle = {
    borderRadius: '8px',
    border: '1px solid #f0f0f0',
    // width: '100%',
    // flex: 1,
    flexGrow: 1,
  };

  const ChatHeaderStyle = {
    margin: 0,
    padding: 0,
    borderBottom: '1px solid #f0f0f0',
    zIndex: 1,
    // width: '100%'
  };

  const ChatBodyStyle = {
    margin: 0,
    borderRadius: 0,
    flex: '1 1 0%',
    padding: 0,
    height: '50%',
    position: 'relative' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  };

  const customModelFormRef = useRef<FormInstance>(null);

  const baseURL = endpoint?.url
    ? new URL(basePath, endpoint?.url ?? undefined).toString()
    : undefined;

  const isEmptyModel = isEmpty(models);

  return (
    <Flex style={ChatCardStyle} direction="column" align="stretch">
      <Flex style={ChatHeaderStyle} align="center">
        <ChatTitle
          setModelId={onModelChange}
          models={models}
          setEndpointFrgmt={setEndpointFrgmt}
          setPromisingEndpoint={setPromisingEndpoint}
          closable={closable}
        />
        <CustomModelForm
          baseURL={baseURL}
          customModelFormRef={customModelFormRef}
          allowCustomModel={isEmptyModel}
          // move to the component, expose on click event
          // only pass isEmptyModel
          alert={
            isEmptyModel && (
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
        />
      </Flex>
      <Flex style={ChatBodyStyle} direction="column" align="stretch">
        <ChatBody baseURL={baseURL} agentId={agentId} modelId={modelId} />
      </Flex>
    </Flex>
  );
};

export default ChatCard;
