'use client';

import { useWebUINavigate } from '../../hooks';
import Flex from '../Flex';
import ChatInput from './ChatInput';
import ModelSelect from './ModelSelect';
import VirtualChatMessageList from './VirtualChatMessageList';
import { createOpenAI } from '@ai-sdk/openai';
import { useChat } from '@ai-sdk/react';
import { DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import { streamText } from 'ai';
import {
  Alert,
  Button,
  Card,
  CardProps,
  Dropdown,
  Form,
  FormInstance,
  Input,
  MenuProps,
  theme,
} from 'antd';
import _ from 'lodash';
import { Scale } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export type BAIModel = {
  id: string;
  label?: string;
  name?: string;
  group?: string;
  created?: string;
  description?: string;
};
type BAIAgent = {};
export interface LLMChatCardProps extends CardProps {
  models?: Array<BAIModel>;
  agents?: Array<BAIAgent>;
  modelId?: string;
  agentId?: string;
  endpointId?: string;
  baseURL?: string;
  apiKey?: string;
  headers?: Record<string, string> | Headers;
  credentials?: RequestCredentials;
  fetchOnClient?: boolean;
  allowCustomModel?: boolean;
  alert?: React.ReactNode;
  leftExtra?: React.ReactNode;
  inputMessage?: string;
  submitKey?: string;
  onAgentChange?: (agentId: string) => void;
  onModelChange?: (modelId: string) => void;
  onInputChange?: (input: string) => void;
  onSubmitChange?: () => void;
}

const LLMChatCard: React.FC<LLMChatCardProps> = ({
  models = [],
  endpointId,
  baseURL,
  headers,
  credentials,
  apiKey,
  fetchOnClient,
  allowCustomModel,
  alert,
  leftExtra,
  inputMessage,
  submitKey,
  onInputChange,
  onSubmitChange,
  ...cardProps
}) => {
  const webuiNavigate = useWebUINavigate();

  const [modelId, setModelId] = useControllableValue(cardProps, {
    valuePropName: 'modelId',
    trigger: 'onModelChange',
    defaultValue: models?.[0]?.id,
  });

  const customModelFormRef = useRef<FormInstance>(null);

  // const [userInput, setUserInput] = useControllableValue(cardProps,{
  //   valuePropName: "userInput",
  //   trigger: "onChangeUserInput",
  // });

  // useControllableValue(cardProps, {
  //   valuePropName: "agentId",
  //   trigger: "onAgentChange",
  // });

  const {
    messages,
    error,
    input,
    setInput,
    handleInputChange,
    stop,
    isLoading,
    append,
    setMessages,
    // ...chatHelpers
  } = useChat({
    api: baseURL,
    headers,
    credentials,
    body: {
      modelId: modelId,
    },
    streamMode: 'stream-data',
    fetch: (input, init) => {
      if (fetchOnClient || modelId === 'custom') {
        const body = JSON.parse(init?.body as string);
        const provider = createOpenAI({
          baseURL: allowCustomModel
            ? customModelFormRef.current?.getFieldValue('baseURL')
            : baseURL,
          apiKey:
            (allowCustomModel
              ? customModelFormRef.current?.getFieldValue('token')
              : apiKey) || 'dummy',
        });
        return streamText({
          abortSignal: init?.signal || undefined,
          model: provider(
            allowCustomModel
              ? customModelFormRef.current?.getFieldValue('modelId')
              : modelId,
          ),
          messages: body?.messages,
        }).then((result) => {
          return result.toAIStreamResponse();
        });
      } else {
        return fetch(input, init);
      }
    },
  });
  const { token } = theme.useToken();
  const { t } = useTranslation();

  // If the `inputMessage` prop exists, the `input` state has to follow it.
  useEffect(() => {
    if (!_.isUndefined(inputMessage)) {
      setInput(inputMessage);
    }
  }, [inputMessage, setInput]);

  useEffect(() => {
    if (!_.isUndefined(submitKey) && input) {
      append({
        role: 'user',
        content: input,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitKey]);

  const items: MenuProps['items'] = [
    {
      key: 'compare',
      label: t('chatui.CompareWithOtherModels'),
      icon: <Scale />,
      onClick: () => {
        webuiNavigate(
          `/serving?tab=chatting&endpointId=${endpointId}&modelId=${modelId}`,
        );
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'clear',
      danger: true,
      label: t('chatui.DeleteChatHistory'),
      icon: <DeleteOutlined />,
      onClick: () => {
        setMessages([]);
      },
    },
  ];

  return (
    <Card
      bordered
      extra={
        [
          // <Checkbox key="sync">Sync</Checkbox>,
          // <Button key="setting" type="text" icon={<SlidersHorizontalIcon/>}></Button>,
        ]
      }
      {...cardProps}
      title={
        <Flex direction="column" align="stretch" gap={'sm'}>
          <Flex direction="row" gap={'xs'}>
            {/* <Select
            options={[
              {
                label: "Default Agent",
                value: "default",
              },
            ]}
            value={"default"}
            popupMatchSelectWidth={false}
          ></Select> */}
            {leftExtra}
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
        </Flex>
      }
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      styles={{
        body: {
          backgroundColor: token.colorFillQuaternary,
          borderRadius: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          height: '50%',
          position: 'relative',
        },
        actions: {
          paddingLeft: token.paddingContentHorizontal,
          paddingRight: token.paddingContentHorizontal,
        },
        header: {
          zIndex: 1,
        },
      }}
      actions={[
        <ChatInput
          autoFocus
          value={input}
          placeholder="Say something..."
          onChange={(v) => {
            handleInputChange(v);
            if (onInputChange) {
              onInputChange(v.target.value);
            }
          }}
          loading={isLoading}
          onStop={() => {
            stop();
          }}
          onSend={() => {
            if (input) {
              append({
                role: 'user',
                content: input,
              });
              setTimeout(() => {
                setInput('');
              }, 0);
              if (onSubmitChange) {
                onSubmitChange();
              }
            }
          }}
        />,
      ]}
    >
      <Flex
        direction="row"
        style={{
          padding: token.paddingSM,
          paddingRight: token.paddingContentHorizontalLG,
          paddingLeft: token.paddingContentHorizontalLG,
          backgroundColor: token.colorBgContainer,
          display:
            (allowCustomModel && modelId === 'custom' && 'flex') || 'none',
        }}
      >
        <Form
          ref={customModelFormRef}
          layout="horizontal"
          size="small"
          requiredMark="optional"
          style={{ flex: 1 }}
          key={baseURL}
          initialValues={{
            baseURL: baseURL,
          }}
        >
          {alert ? (
            <div style={{ marginBottom: token.size }}>{alert}</div>
          ) : null}
          <Form.Item
            label="baseURL"
            name="baseURL"
            rules={[
              {
                type: 'url',
              },
              {
                required: true,
              },
            ]}
          >
            <Input placeholder="https://domain/v1" />
          </Form.Item>
          <Form.Item
            label="Model ID"
            name="modelId"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input placeholder="llm-model" />
          </Form.Item>
          <Form.Item label="Token" name="token">
            <Input />
          </Form.Item>
        </Form>
      </Flex>
      {/* <ChatMessageList messages={messages}  /> */}
      {!_.isEmpty((error as any)?.responseBody) ? (
        <Alert
          message={(error as any)?.responseBody}
          type="error"
          showIcon
          style={{
            margin: token.marginSM,
          }}
          closable
        />
      ) : null}
      <VirtualChatMessageList messages={messages} isStreaming={isLoading} />
    </Card>
  );
};

export default LLMChatCard;
