import { filterEmptyItem } from '../../helper';
import { useWebUINavigate } from '../../hooks';
import { AIAgent } from '../../hooks/useAIAgent';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import Flex from '../Flex';
import AIAgentSelect from './AIAgentSelect';
import { BAIModel, ChatParameter } from './ChatModel';
import EndpointSelect, { EndpointSelectProps } from './EndpointSelect';
import ModelSelect from './ModelSelect';
import { ChatHeader_Endpoint$key } from './__generated__/ChatHeader_Endpoint.graphql';
import {
  CloseOutlined,
  ControlOutlined,
  InfoCircleOutlined,
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
  Slider,
  Row,
  Col,
  Collapse,
  Alert,
} from 'antd';
import { createStyles } from 'antd-style';
import graphql from 'babel-plugin-relay/macro';
import { t } from 'i18next';
import { isEmpty } from 'lodash';
import { Scale as ScaleIcon, Eraser as EraserIcon } from 'lucide-react';
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
  parameter: ChatParameter;
  onChangeParameter: (parameter: ChatParameter) => void;
}

type ChatParameterChangeEventHander = (event: {
  name: string;
  value: number;
}) => void;

interface ChatParameterProps {
  name: string;
  label: string;
  max: number;
  min: number;
  step: number;
  value?: number;
  description?: string;
  onChange?: ChatParameterChangeEventHander;
}

const ChatParameterSlider = ({
  name,
  label,
  max,
  min,
  step,
  value,
  description,
  onChange,
}: ChatParameterProps) => {
  const { token } = theme.useToken();
  const [inputValue, setInputValue] = useState(value ?? min);

  return (
    <>
      <Row justify="space-between" style={{ width: '240px' }}>
        <Col span={12}>
          <Typography.Text
            style={{ fontSize: token.fontSizeSM, marginLeft: token.marginXXS }}
            strong={true}
          >
            {label}
          </Typography.Text>
          {description && (
            <Popover content={description} trigger="hover">
              <Button type="link" icon={<InfoCircleOutlined />} size="small" />
            </Popover>
          )}
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          <Typography.Text
            style={{ fontSize: token.fontSizeSM, marginRight: token.marginXXS }}
            strong={true}
          >
            {inputValue}
          </Typography.Text>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Slider
            min={min}
            max={max}
            value={inputValue}
            onChange={(value) => {
              onChange?.({
                name,
                value,
              });
              setInputValue(value);
            }}
            step={step ?? null}
            style={{
              marginLeft: token.marginXXS,
              marginRight: token.marginXXS,
            }}
          />
        </Col>
      </Row>
    </>
  );
};

const defaultChatParameters: Record<
  string,
  Omit<ChatParameterProps, 'name' | 'value'>
> = {
  maxTokens: {
    label: 'Max Tokens',
    min: 0,
    max: 16384,
    step: 1,
    description: t('chatui.chat.parameter.maxTokens'),
  },
  temperature: {
    label: 'Temperature',
    min: 0.0,
    max: 1,
    step: 0.01,
    description: t('chatui.chat.parameter.temperature'),
  },
  topP: {
    label: 'Top P',
    min: 0.0,
    max: 1,
    step: 0.01,
    description: t('chatui.chat.parameter.topP'),
  },
};

const advancedChatParameters: Record<
  string,
  Omit<ChatParameterProps, 'name' | 'value'>
> = {
  topK: {
    label: 'Top K',
    min: 1,
    max: 500,
    step: 1,
    description: t('chatui.chat.parameter.topK'),
  },
  frequencyPenalty: {
    label: 'Frequency Penalty',
    min: 0,
    max: 2,
    step: 0.01,
    description: t('chatui.chat.parameter.frequencyPenalty'),
  },
  presencePenalty: {
    label: 'Presence Penalty',
    min: 0,
    max: 2,
    step: 0.01,
    description: t('chatui.chat.parameter.presencePenalty'),
  },
};

const useStyles = createStyles(({ css, token }) => ({
  collapse: css`
    border: none !important;
    border-radius: 0 !important;
    background-color: transparent !important;
    .ant-collapse-content {
      border-top: none !important;
    }
    .ant-collapse-content-box {
      padding: 0 !important;
    }
    .ant-collapse-header {
      padding-left: 0 !important;
    }
  `,
}));

const ChatParameterSliders = ({
  parameter,
  onChange,
}: {
  parameter: ChatParameter;
  onChange: ChatParameterChangeEventHander;
}) => {
  const { styles } = useStyles();
  return (
    <>
      {Object.entries(defaultChatParameters).map(([paramName, param]) => (
        // @FIXME: use factory function
        <ChatParameterSlider
          key={paramName}
          name={paramName}
          value={parameter[paramName as keyof ChatParameter]}
          onChange={onChange}
          {...param}
        />
      ))}
      <Collapse
        items={[
          {
            key: 'Advanced Parameters',
            label: 'Advanced Parameters',
            style: {
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 'none',
            },
            children: (
              <>
                <div>
                  <Alert
                    type="warning"
                    showIcon
                    message={
                      // @FIXME: use t
                      'Supported settings may vary depending on the model.'
                    }
                    style={{
                      textWrap: 'wrap',
                      maxWidth: '240px',
                      marginBottom: '8px',
                    }}
                  />
                </div>
                {Object.entries(advancedChatParameters).map(
                  ([paramName, param]) => (
                    <ChatParameterSlider
                      key={paramName}
                      name={paramName}
                      // @FIXME: without type cast
                      value={parameter[paramName as keyof ChatParameter]}
                      onChange={onChange}
                      {...param}
                    />
                  ),
                )}
              </>
            ),
          },
        ]}
        className={styles.collapse}
      />
    </>
  );
};

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
  parameter,
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
            <ChatParameterSliders
              parameter={parameter}
              onChange={({ name, value }) => {
                startTransition(() => {
                  onChangeParameter({
                    ...parameter,
                    [name]: value,
                  });
                });
              }}
            />
          }
          trigger="click"
          placement="bottom"
        >
          <Button icon={<ControlOutlined />} />
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
