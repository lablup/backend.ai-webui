import { filterEmptyItem } from '../../helper';
import { useWebUINavigate } from '../../hooks';
import { AIAgent } from '../../hooks/useAIAgent';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import Flex from '../Flex';
import AIAgentSelect from './AIAgentSelect';
import { BAIModel, ChatLifecycleEventType, ChatType } from './ChatModel';
import EndpointSelect from './EndpointSelect';
import ModelSelect from './ModelSelect';
import {
  ChatCard_endpoint$data,
  ChatCard_endpoint$key,
} from './__generated__/ChatCard_endpoint.graphql';
import { Message } from '@ai-sdk/react';
import {
  CloseOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Dropdown,
  Button,
  theme,
  MenuProps,
  Popconfirm,
  Typography,
  Switch,
} from 'antd';
import { Scale } from 'lucide-react';
import React, { useState, startTransition } from 'react';
import { useTranslation } from 'react-i18next';

const CardHeadStyle = {
  minHeight: '56px',
  width: '100%',
};

const CardTitleStyle = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  flexGrow: 1,
};

const CardExtraStyle = {
  marginInlineStart: 'auto',
  color: '#141414',
};

interface ChatHeaderProps extends ChatLifecycleEventType {
  chat: ChatType;
  showCompareMenuItem?: boolean;
  allowCustomModel?: boolean;
  closable?: boolean;
  models: BAIModel[];
  modelId: string;
  setModelId: (modelId: string) => void;
  endpoint?: ChatCard_endpoint$data | null;
  setEndpoint: (endpoint: ChatCard_endpoint$key) => void;
  agents: AIAgent[];
  agent?: AIAgent;
  setAgent: (agent: AIAgent) => void;
  sync: boolean;
  setSync: (sync: boolean) => void;
  fetchKey: string;
  setMessages: (messages: Message[]) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  showCompareMenuItem,
  allowCustomModel,
  closable,
  models,
  modelId,
  setModelId,
  endpoint,
  setEndpoint,
  agents,
  agent,
  setAgent,
  sync,
  setSync,
  onRequestClose,
  onCreateNewChat,
  fetchKey,
  setMessages,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();

  const [promisingEndpoint, setPromisingEndpoint] = useState(endpoint);

  const items: MenuProps['items'] = filterEmptyItem([
    showCompareMenuItem && {
      key: 'compare',
      label: t('chatui.CompareWithOtherModels'),
      icon: <Scale />,
      onClick: () => {
        webuiNavigate(
          `/serving?tab=chatting&endpointId=${endpoint?.endpoint_id}&modelId=${modelId}`,
        );
      },
    },
    showCompareMenuItem && {
      type: 'divider',
    },
    {
      key: 'clear',
      label: t('chatui.DeleteChatHistory'),
      icon: <DeleteOutlined />,
      onClick: () => {
        setMessages([]);
      },
    },
    closable && {
      type: 'divider',
    },
    closable && {
      key: 'close',
      danger: true,
      label: t('chatui.DeleteChattingSession'),
      icon: <CloseOutlined />,
      onClick: () => {
        onRequestClose?.(chat);
      },
    },
  ]);

  const [experimentalAIAgents] = useBAISettingUserState(
    'experimental_ai_agents',
  );

  return (
    <Flex direction="row" style={CardHeadStyle} align="center">
      <Flex style={CardTitleStyle} gap="xs">
        {experimentalAIAgents && (
          <AIAgentSelect
            agents={agents}
            selectedAgent={agent}
            value={agent?.id}
            onChange={(_, agent: any) => {
              startTransition(() => {
                setAgent(agent);
              });
            }}
          />
        )}
        <EndpointSelect
          fetchKey={fetchKey}
          loading={promisingEndpoint?.endpoint_id !== endpoint?.endpoint_id}
          onChange={(_, endpoint: any) => {
            setPromisingEndpoint(endpoint);
            startTransition(() => {
              setEndpoint(endpoint);
            });
          }}
          value={endpoint?.endpoint_id}
          popupMatchSelectWidth={false}
        />
        <ModelSelect
          models={models}
          value={modelId}
          onChange={(modelId) => {
            startTransition(() => {
              setModelId(modelId);
            });
          }}
          allowCustomModel={allowCustomModel}
        />
      </Flex>
      <Flex style={CardExtraStyle} justify="between">
        <Flex direction="row" gap={'xs'} wrap="wrap" style={{ flexShrink: 1 }}>
          <Flex gap={'xs'}>
            {sync && (
              <Typography.Text type="secondary">
                {t('chatui.SyncInput')}
              </Typography.Text>
            )}
            <Switch
              value={sync}
              onClick={(checked) => {
                startTransition(() => {
                  setSync(checked);
                });
              }}
            />
            <Button
              onClick={() => onCreateNewChat?.()}
              icon={<PlusOutlined />}
            />
          </Flex>
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button
              type="link"
              onClick={(e) => e.preventDefault()}
              icon={<MoreOutlined />}
              style={{ color: token.colorTextSecondary, width: token.sizeMS }}
            />
          </Dropdown>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ChatHeader;
