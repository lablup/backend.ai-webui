'use client';

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
  Button,
  Card,
  CardProps,
  Dropdown,
  Form,
  Input,
  MenuProps,
  theme,
} from 'antd';
import React from 'react';
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
  onAgentChange?: (agentId: string) => void;
  onModelChange?: (modelId: string) => void;
  baseURL?: string;
  apiKey?: string;
  headers?: Record<string, string> | Headers;
  credentials?: RequestCredentials;
  fetchOnClient?: boolean;
  allowCustomModel?: boolean;
  alert?: React.ReactNode;
  leftExtra?: React.ReactNode;
}

const LLMChatCard: React.FC<LLMChatCardProps> = ({
  models = [],
  baseURL,
  headers,
  credentials,
  apiKey,
  fetchOnClient,
  allowCustomModel,
  alert,
  leftExtra,
  ...cardProps
}) => {
  const [modelId, setModelId] = useControllableValue(cardProps, {
    valuePropName: 'modelId',
    trigger: 'onModelChange',
    defaultValue: models[0]?.id,
  });

  const [customModelForm] = Form.useForm();

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
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    stop,
    isLoading,
    append,
    setMessages,
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
            ? customModelForm.getFieldValue('baseURL')
            : baseURL,
          apiKey:
            (allowCustomModel
              ? customModelForm.getFieldValue('token')
              : apiKey) || 'dummy',
        });
        return streamText({
          model: provider(
            allowCustomModel
              ? customModelForm.getFieldValue('modelId')
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

  const items: MenuProps['items'] = [
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
          backgroundColor: '#f5f5f5',
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
      }}
      actions={[
        <form key="input" onSubmit={handleSubmit}>
          <ChatInput
            autoFocus
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
            loading={isLoading}
            onClickStop={stop}
            onClickSubmit={() => {
              append({
                role: 'user',
                content: input,
              });
              setTimeout(() => {
                setInput('');
              }, 0);
            }}
          />
        </form>,
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
          form={customModelForm}
          layout="horizontal"
          size="small"
          requiredMark="optional"
          style={{ flex: 1 }}
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
      <VirtualChatMessageList messages={messages} isStreaming={isLoading} />
    </Card>
  );
};

export default LLMChatCard;
