import { filterEmptyItem } from '../../helper';
import { useWebUINavigate } from '../../hooks';
import { AIAgent } from '../../hooks/useAIAgent';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import EndpointsIcon from '../BAIIcons/EndpointsIcon';
import ModelServiceIcon from '../BAIIcons/ModelServiceIcon';
import BAILink from '../BAILink';
import BAIModal from '../BAIModal';
import BAISelect from '../BAISelect';
import Flex from '../Flex';
import AIAgentSelect from './AIAgentSelect';
import { BAIModel, ChatParameters } from './ChatModel';
import { ChatParametersSliders } from './ChatParametersSliders';
import EndpointSelect, { EndpointSelectProps } from './EndpointSelect';
import ModelSelect from './ModelSelect';
import { ChatHeader_Endpoint$key } from './__generated__/ChatHeader_Endpoint.graphql';
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
  Form,
  Input,
  Divider,
  Select,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { isEmpty } from 'lodash';
import {
  Scale as ScaleIcon,
  Eraser as EraserIcon,
  SlidersHorizontalIcon,
} from 'lucide-react';
import React, { startTransition, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

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

  const [openConfiguration, setOpenConfiguration] = useState(false);
  return (
    <Flex
      direction="row"
      justify="start"
      align="start"
      wrap="wrap"
      gap="xs"
      style={{
        // minHeight: '56px',
        width: '100%',
        paddingTop: token.paddingXS,
        paddingBottom: token.paddingXS,
      }}
    >
      <Flex
        wrap="wrap"
        align="start"
        gap="xxs"
        direction="column"
        style={{
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 'auto',
        }}
      >
        <Flex gap={'xs'}>
          <Flex>
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
            <Button
              type="text"
              icon={
                <SlidersHorizontalIcon
                  style={{
                    color: usingParameters ? token.colorPrimary : undefined,
                  }}
                />
              }
              onClick={() => setOpenConfiguration(true)}
            />
          </Flex>
          <Divider type="vertical" />
          <BAISelect
            mode="tags"
            placeholder="MCP Servers"
            size="small"
            style={{ minWidth: 130 }}
            popupMatchSelectWidth={false}
            // onChange={handleChange}
            header="MCP Servers"
            options={[
              {
                label: 'Playwright',
                value: 'playwright',
              },
              {
                label: 'PostGresQL',
                value: 'postgresql',
              },
            ]}
          />
        </Flex>
        <Flex
          gap={'xs'}
          wrap="wrap"
          style={{
            flexShrink: 1,
          }}
        >
          <EndpointSelect
            prefix={<EndpointsIcon />}
            fetchKey={fetchKey}
            loading={isPendingEndpointTransition}
            onChange={(id) => {
              startEndpointTransition(() => {
                onChangeEndpoint?.(id);
              });
            }}
            value={endpoint?.endpoint_id}
            popupMatchSelectWidth={false}
            size="small"
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
              size="small"
            />
          )}
        </Flex>
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
      <BAIModal
        title="Chat prompt configuration"
        open={openConfiguration}
        onOk={() => {}}
        onCancel={() => setOpenConfiguration(false)}
        // okButtonProps={{

        // }}
        footer={
          <Flex justify="end" gap={'xs'}>
            <Button onClick={() => setOpenConfiguration(false)}>Cancel</Button>
            <Dropdown.Button
              type="primary"
              menu={{
                items: [
                  {
                    key: 'duplicate',
                    label: 'Duplicate',
                  },
                ],
                onClick: () => {},
              }}
              style={{
                width: 'auto',
              }}
            >
              Save
            </Dropdown.Button>
          </Flex>
        }
      >
        <Flex direction="column" gap={'xs'} align="stretch">
          <Form layout="vertical">
            <Form.Item label={'Title'}>
              <Input value={agent?.meta.title} />
            </Form.Item>
            <Form.Item label="Prompt">
              <Input.TextArea value={agent?.config.system_prompt || ''} />
            </Form.Item>
          </Form>
          <ChatParametersSliders
            parameters={parameters}
            onChangeParameter={(usingParameters, parameters) => {
              startTransition(() => {
                onChangeParameter(usingParameters, parameters);
              });
            }}
          />
          {/* <Divider style={{ marginBlock: token.marginSM }} />
          <Flex justify="between">
            <Button type="text" style={{ padding: 0 }}>
              Duplicate
            </Button>
            <Button
              type="primary"
              onClick={() => {
                startTransition(() => {
                  onChangeParameter(false, parameters);
                });
              }}
            >
              {t('chatui.Save')}
            </Button>
          </Flex> */}
        </Flex>
      </BAIModal>
    </Flex>
  );
};

export default ChatHeader;
