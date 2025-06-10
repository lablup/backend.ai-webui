import { ChatHeader_Endpoint$key } from '../../__generated__/ChatHeader_Endpoint.graphql';
import { filterEmptyItem } from '../../helper';
import { useWebUINavigate } from '../../hooks';
import { AIAgent } from '../../hooks/useAIAgent';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import Flex from '../Flex';
import AIAgentSelect from './AIAgentSelect';
import { BAIModel, ChatParameters } from './ChatModel';
import { ChatParametersSliders } from './ChatParametersSliders';
import EndpointSelect, { EndpointSelectProps } from './EndpointSelect';
import ModelSelect from './ModelSelect';
import {
  CloseOutlined,
  ControlOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Dropdown,
  Button,
  theme,
  MenuProps,
  Typography,
  Switch,
  Popover,
} from 'antd';
import { isEmpty } from 'lodash';
import { Scale as ScaleIcon, Eraser as EraserIcon } from 'lucide-react';
import React, { startTransition, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SyncSwitchProps {
  sync: boolean;
  onClick: (sync: boolean) => void;
}

const SyncSwitch: React.FC<SyncSwitchProps> = ({ sync, onClick }) => {
  const { t } = useTranslation();
  return (
    <>
      {sync && (
        <Typography.Text type="secondary">
          {t('chatui.SyncInput')}
        </Typography.Text>
      )}
      <Switch checked={sync} onClick={onClick} />
    </>
  );
};

interface ChatHeaderProps {
  showCompareMenuItem?: boolean;
  closable?: boolean;
  models: BAIModel[];
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
  onClickDeleteChatHistory?: () => void;
  onClickClose?: () => void;
  onClickCreate?: () => void;
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
  models,
  modelId,
  onChangeModel,
  endpointFrgmt,
  onChangeEndpoint,
  agent,
  onChangeAgent,
  sync,
  onChangeSync,
  onClickClose,
  onClickCreate,
  fetchKey,
  onClickDeleteChatHistory,
  parameters,
  usingParameters,
  onChangeParameter,
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
        onClickDeleteChatHistory?.();
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
        onClickClose?.();
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
      <Flex gap={'xs'}>
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
          <Button
            icon={
              <ControlOutlined
                style={{
                  color: usingParameters ? token.colorPrimary : undefined,
                }}
              />
            }
          />
        </Popover>
        <Button onClick={() => onClickCreate?.()} icon={<PlusOutlined />} />
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
  );
};

export default ChatHeader;
