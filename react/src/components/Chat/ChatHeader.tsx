import { ChatHeader_Endpoint$key } from '../../__generated__/ChatHeader_Endpoint.graphql';
import { filterEmptyItem } from '../../helper';
import { useWebUINavigate } from '../../hooks';
import { AIAgent } from '../../hooks/useAIAgent';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import Flex from '../Flex';
import AIAgentSelect from './AIAgentSelect';
import type { ChatModel, ChatParameters } from './ChatModel';
import { ChatParametersSliders } from './ChatParametersSliders';
import EndpointSelect, { EndpointSelectProps } from './EndpointSelect';
import ModelSelect from './ModelSelect';
import {
  CloseOutlined,
  ControlOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { Dropdown, Button, theme, MenuProps, Popover, Tooltip } from 'antd';
import { isEmpty } from 'lodash';
import {
  ScaleIcon,
  EraserIcon,
  ToggleRightIcon,
  ToggleLeftIcon,
  ArrowRightLeftIcon,
} from 'lucide-react';
import React, { startTransition, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SyncSwitchProps {
  sync: boolean;
  onClick: (sync: boolean) => void;
}

const SyncSwitch: React.FC<SyncSwitchProps> = ({ sync, onClick }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  return (
    <>
      <Tooltip title={t('chatui.SyncInput')}>
        <Button
          type="text"
          icon={sync ? <ToggleRightIcon /> : <ToggleLeftIcon />}
          onClick={() => onClick(!sync)}
          style={{
            marginLeft: 8,
            color: sync ? token.colorPrimary : undefined,
          }}
        />
      </Tooltip>
    </>
  );
};

interface ChatHeaderProps {
  showCompareMenuItem?: boolean;
  closable?: boolean;
  cloneable?: boolean;
  models: ChatModel[];
  modelId: string;
  onChangeModel: (modelId: string) => void;
  endpointFrgmt?: ChatHeader_Endpoint$key | null;
  onChangeEndpoint: EndpointSelectProps['onChange'];
  agents: AIAgent[];
  agent?: AIAgent;
  onChangeAgent: (agent: AIAgent) => void;
  sync: boolean;
  onChangeSync: (sync: boolean) => void;
  fetchKey: string;
  onClearMessage?: () => void;
  onRemoveChat?: () => void;
  onAddChat?: () => void;
  parameters: ChatParameters;
  usingParameters: boolean;
  onChangeParameter: (
    usingParameters: boolean,
    parameters: ChatParameters,
  ) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  showCompareMenuItem,
  closable,
  cloneable,
  models,
  modelId,
  onChangeModel,
  endpointFrgmt,
  onChangeEndpoint,
  agent,
  onChangeAgent,
  sync,
  onChangeSync,
  onRemoveChat,
  onAddChat,
  fetchKey,
  parameters,
  usingParameters,
  onChangeParameter,
  onClearMessage,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();

  const [isPendingEndpointTransition, startEndpointTransition] =
    useTransition();
  const [isPendingAgentTransition, startAgentTransition] = useTransition();

  // Using fragment instead of just endpoint_id to support future EndpointSelect extensions
  const endpoint = useFragment(
    graphql`
      fragment ChatHeader_Endpoint on Endpoint {
        endpoint_id
      }
    `,
    endpointFrgmt,
  );

  const items: MenuProps['items'] = filterEmptyItem([
    showCompareMenuItem && {
      key: 'compare',
      label: t('chatui.CompareWithOtherModels'),
      icon: <ScaleIcon />,
      onClick: () => {
        webuiNavigate({
          pathname: '/serving',
          search: new URLSearchParams({
            tab: 'chatting',
            endpointId: endpoint?.endpoint_id ?? '',
            modelId: modelId,
          }).toString(),
        });
      },
    },
    showCompareMenuItem && {
      type: 'divider',
    },
    {
      key: 'clear',
      label: t('chatui.DeleteChatHistory'),
      icon: <EraserIcon />,
      onClick: () => {
        onClearMessage?.();
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
        onRemoveChat?.();
      },
    },
  ]);

  const [experimentalAIAgents] = useBAISettingUserState(
    'experimental_ai_agents',
  );

  return (
    <Flex
      direction="row"
      justify="start"
      wrap="wrap"
      gap="xs"
      style={{
        minHeight: '56px',
        width: '100%',
        paddingTop: token.paddingXS,
        paddingBottom: token.paddingXS,
      }}
    >
      <Flex
        wrap="wrap"
        align="start"
        gap="xs"
        style={{
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 'auto',
        }}
      >
        {experimentalAIAgents && (
          <AIAgentSelect
            loading={isPendingAgentTransition}
            value={agent?.id}
            onChange={(_, agent: any) => {
              startAgentTransition(() => {
                onChangeAgent(agent);
              });
            }}
          />
        )}
        <EndpointSelect
          fetchKey={fetchKey}
          loading={isPendingEndpointTransition}
          onChange={(id) => {
            startEndpointTransition(() => {
              onChangeEndpoint?.(id);
            });
          }}
          value={endpoint?.endpoint_id}
          popupMatchSelectWidth={false}
        />
        {!isEmpty(models) && (
          <ModelSelect
            models={models}
            value={modelId}
            onChange={(modelId) => {
              startTransition(() => {
                onChangeModel(modelId);
              });
            }}
          />
        )}
      </Flex>
      <Flex style={{ marginRight: token.marginSM * -1, zIndex: 1 }}>
        {closable && (
          <SyncSwitch
            sync={sync}
            onClick={(checked) => {
              startTransition(() => {
                onChangeSync(checked);
              });
            }}
          />
        )}
        <Popover
          content={
            <ChatParametersSliders
              parameters={parameters}
              usingParameters={usingParameters}
              onChangeParameter={(usingParameters, parameters) => {
                startTransition(() => {
                  onChangeParameter(usingParameters, parameters);
                });
              }}
            />
          }
          trigger="click"
          placement="bottom"
          style={{
            padding: token.paddingXS,
          }}
        >
          <Tooltip title={t('chatui.chat.parameter.Title')}>
            <Button
              type="text"
              icon={
                <ControlOutlined
                  style={{
                    color: usingParameters ? token.colorPrimary : undefined,
                  }}
                />
              }
            />
          </Tooltip>
        </Popover>
        {cloneable && (
          <Tooltip title={t('chatui.CreateCompareChat')}>
            <Button
              type="text"
              onClick={() => onAddChat?.()}
              icon={<ArrowRightLeftIcon />}
            />
          </Tooltip>
        )}
        <Dropdown menu={{ items }} trigger={['click']}>
          <Button
            type="text"
            onClick={(e) => e.preventDefault()}
            icon={<MoreOutlined />}
            style={{ color: token.colorTextSecondary }}
          />
        </Dropdown>
      </Flex>
    </Flex>
  );
};

export default ChatHeader;
