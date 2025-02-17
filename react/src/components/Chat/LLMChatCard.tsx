'use client';

import { filterEmptyItem } from '../../helper';
import { useWebUINavigate } from '../../hooks';
import { useTokenCount } from '../../hooks/useTokenizer';
import Flex from '../Flex';
import ChatSender from './ChatSender';
import ModelSelect from './ModelSelect';
import VirtualChatMessageList from './VirtualChatMessageList';
import { createOpenAI } from '@ai-sdk/openai';
import { useChat } from '@ai-sdk/react';
import {
  CloudUploadOutlined,
  DeleteOutlined,
  LinkOutlined,
  MoreOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { Attachments, AttachmentsProps, Sender } from '@ant-design/x';
import { useControllableValue } from 'ahooks';
import { streamText } from 'ai';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardProps,
  Dropdown,
  Form,
  FormInstance,
  Input,
  MenuProps,
  Tag,
  theme,
  Typography,
} from 'antd';
import _ from 'lodash';
import { Scale } from 'lucide-react';
import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  showCompareMenuItem?: boolean;
  modelToken?: string;
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
  showCompareMenuItem,
  modelToken,
  ...cardProps
}) => {
  const webuiNavigate = useWebUINavigate();
  const [isOpenAttachments, setIsOpenAttachments] = useState(false);

  const [modelId, setModelId] = useControllableValue(cardProps, {
    valuePropName: 'modelId',
    trigger: 'onModelChange',
    defaultValue: models?.[0]?.id,
  });

  const customModelFormRef = useRef<FormInstance>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    error,
    input,
    setInput,
    stop,
    isLoading,
    append,
    setMessages,
    // ...chatHelpers,
  } = useChat({
    api: baseURL,
    headers,
    credentials,
    body: {
      modelId: modelId,
    },
    fetch: async (input, init) => {
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
        const result = await streamText({
          abortSignal: init?.signal || undefined,
          model: provider(
            allowCustomModel
              ? customModelFormRef.current?.getFieldValue('modelId')
              : modelId,
          ),
          messages: body?.messages,
        });
        setStartTime(Date.now());
        return result.toDataStreamResponse();
      } else {
        return fetch(input, init);
      }
    },
  });
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const [startTime, setStartTime] = useState<number | null>(null);

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

  const inputTokenCount = useTokenCount(input);

  const allChatMessageString = useMemo(() => {
    return _.map(messages, (message) => message?.content).join('');
  }, [messages]);
  const chatsTokenCount = useTokenCount(allChatMessageString);
  const totalTokenCount = inputTokenCount + chatsTokenCount;

  const lastAssistantMessageString = useMemo(() => {
    const lastAssistantMessage = _.last(messages);
    if (lastAssistantMessage?.role === 'assistant') {
      return lastAssistantMessage?.content;
    } else {
      return '';
    }
  }, [messages]);

  const lastAssistantTokenCount = useTokenCount(lastAssistantMessageString);
  const tokenPerSecond = useMemo(() => {
    return lastAssistantTokenCount > 0 && startTime
      ? lastAssistantTokenCount / ((Date.now() - startTime) / 1000)
      : 0;
  }, [lastAssistantTokenCount, startTime]);

  const [files, setFiles] = useState<AttachmentsProps['items']>([]);

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
        setMessages([]);
      },
    },
  ]);

  return (
    <Card
      ref={cardRef}
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
        <ChatSender
          autoFocus
          value={input}
          placeholder="Say something..."
          header={
            <Sender.Header
              closable={false}
              title={t('chatui.Attachments')}
              open={!!isOpenAttachments && !_.isEmpty(files)}
              onOpenChange={setIsOpenAttachments}
              styles={{
                content: {
                  padding: 0,
                },
              }}
            >
              <Attachments
                beforeUpload={() => false}
                getDropContainer={() => cardRef.current}
                accept="image/*,text/*"
                items={files}
                onChange={({ fileList }) => setFiles(fileList)}
                placeholder={(type) =>
                  type === 'drop'
                    ? {
                        title: t('chatui.DropFileHere'),
                      }
                    : {
                        icon: <CloudUploadOutlined />,
                        title: t('chatui.UploadFiles'),
                        description: t('chatui.UploadFilesDescription'),
                      }
                }
              />
            </Sender.Header>
          }
          prefix={
            <Attachments
              beforeUpload={() => false}
              getDropContainer={() => cardRef.current}
              accept="image/*,text/*"
              items={files}
              onChange={({ fileList }) => {
                setFiles(fileList);
                setIsOpenAttachments(true);
              }}
              placeholder={(type) =>
                type === 'drop'
                  ? {
                      title: t('chatui.DropFileHere'),
                    }
                  : {
                      icon: <CloudUploadOutlined />,
                      title: t('chatui.UploadFiles'),
                      description: t('chatui.UploadFilesDescription'),
                    }
              }
            >
              <Badge dot={!_.isEmpty(files) && !isOpenAttachments}>
                <Button type="text" icon={<LinkOutlined />} />
              </Badge>
            </Attachments>
          }
          onChange={(v: string) => {
            setInput(v);
            if (onInputChange) {
              onInputChange(v);
            }
          }}
          loading={isLoading}
          onStop={() => {
            stop();
          }}
          onSend={() => {
            if (input || !_.isEmpty(files)) {
              const fileList = _.map(
                files,
                (item) => item.originFileObj as File,
              );
              // Filter after converting to `File`
              const fileListArray = _.filter(fileList, Boolean);
              const dataTransfer = new DataTransfer();
              _.forEach(fileListArray, (file) => {
                dataTransfer.items.add(file);
              });

              append(
                {
                  role: 'user',
                  content: input,
                },
                {
                  experimental_attachments: dataTransfer.files,
                },
              );

              setTimeout(() => {
                setInput('');
                setFiles([]);
                setIsOpenAttachments(false);
              }, 0);
              onSubmitChange?.();
            }
          }}
          style={{ flex: 1 }}
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
            token: modelToken,
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
      {!_.isEmpty(error?.message) ? (
        <Alert
          message={error?.message}
          type="error"
          showIcon
          style={{
            margin: token.marginSM,
          }}
          closable
        />
      ) : null}
      <VirtualChatMessageList messages={messages} isStreaming={isLoading} />
      <Flex justify="end" align="end" style={{ margin: token.marginSM }}>
        <Tag>
          <Flex gap={'xs'}>
            <RocketOutlined />
            <Flex gap={'xxs'}>
              <Typography.Text>{tokenPerSecond.toFixed(2)}</Typography.Text>
              <Typography.Text type="secondary">tok/s</Typography.Text>
            </Flex>
            <Flex gap={'xxs'}>
              <Typography.Text>{totalTokenCount}</Typography.Text>
              <Typography.Text type="secondary">total tokens</Typography.Text>
            </Flex>
          </Flex>
        </Tag>
      </Flex>
    </Card>
  );
};

export default LLMChatCard;
