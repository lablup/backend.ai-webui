import { filterEmptyItem } from '../../helper';
import { useUpdatableState, useWebUINavigate } from '../../hooks';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { ChatType } from '../../pages/ChatProvider';
import Flex from '../Flex';
import AIAgentSelect from './AIAgentSelect';
import EndpointSelect from './EndpointSelect';
import ModelSelect from './ModelSelect';
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

interface ChatHeaderProps {
  chat: ChatType;
  modelId?: string;
  setModelId?: (modelId: string) => void;
  endpointId?: string;
  models: any[];
  allowCustomModel?: boolean;
  showCompareMenuItem?: boolean;
  endpoint?: any;
  setEndpointFrgmt: (endpoint: any) => void;
  setPromisingEndpoint: (endpoint: any) => void;
  promisingEndpoint?: any;
  closable?: boolean;
  onClickNewChat?: () => void;
  onClickChatSync?: (sync: boolean) => void;
  onClickClear?: () => void;
}

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

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  modelId,
  setModelId,
  models,
  allowCustomModel,
  showCompareMenuItem,
  endpoint,
  setEndpointFrgmt,
  setPromisingEndpoint,
  promisingEndpoint,
  endpointId,
  closable,
  onClickNewChat,
  onClickChatSync,
  onClickClear,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();

  const [fetchKey] = useUpdatableState('first');

  const [agentId, setAgentId] = useState<string | undefined>();

  const items: MenuProps['items'] = filterEmptyItem([
    showCompareMenuItem && {
      key: 'compare',
      label: t('chatui.CompareWithOtherModels'),
      icon: <Scale />,
      onClick: () => {
        webuiNavigate(
          `/serving?tab=chatting&endpointId=${endpointId}&modelId=${modelId}`,
        );
      },
    },
    showCompareMenuItem && {
      type: 'divider',
    },
    {
      key: 'clear',
      danger: true,
      label: t('chatui.DeleteChatHistory'),
      icon: <DeleteOutlined />,
      onClick: () => {
        onClickClear?.();
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
            value={agentId}
            // @ts-ignore
            onChange={(_, agent) => {
              // @ts-ignore
              setAgentId(agent);
            }}
          />
        )}
        <EndpointSelect
          fetchKey={fetchKey}
          loading={promisingEndpoint?.endpoint_id !== endpoint?.endpoint_id}
          onChange={(_, endpoint) => {
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
        <ModelSelect
          models={models}
          value={modelId}
          onChange={setModelId}
          allowCustomModel={allowCustomModel}
        />
        <Dropdown menu={{ items }} trigger={['click']}>
          <Button
            type="link"
            onClick={(e) => e.preventDefault()}
            icon={<MoreOutlined />}
            style={{ color: token.colorTextSecondary, width: token.sizeMS }}
          />
        </Dropdown>
      </Flex>
      <Flex style={CardExtraStyle} justify="between">
        <Flex direction="row" gap={'xs'} wrap="wrap" style={{ flexShrink: 1 }}>
          <Flex gap={'xs'}>
            <Typography.Text type="secondary">
              {t('chatui.SyncInput')}
            </Typography.Text>
            <Switch
              value={chat.sync}
              onClick={(v) => {
                onClickChatSync?.(v);
              }}
            />
            <Button
              onClick={() => {
                onClickNewChat?.();
              }}
              icon={<PlusOutlined />}
            />
          </Flex>
        </Flex>
        {closable ? (
          <Popconfirm
            title={t('chatui.DeleteChattingSession')}
            description={t('chatui.DeleteChattingSessionDescription')}
            onConfirm={() => {
              // @FIXME
              // onRequestClose?.();
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
        ) : undefined}
      </Flex>
    </Flex>
  );
};

export default ChatHeader;
