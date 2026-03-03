/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AIAgent, useAIAgent } from '../hooks/useAIAgent';
import {
  ChatParameterSliderFormItem,
  chatParameters,
} from './Chat/ChatParametersSliders';
import {
  App,
  Divider,
  Form,
  Input,
  Radio,
  Select,
  Switch,
  theme,
  Typography,
} from 'antd';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  generateRandomString,
} from 'backend.ai-ui';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;

type ConnectionType = 'backendai' | 'external';

interface AgentFormValues {
  title: string;
  avatar: string;
  description: string;
  tags: string[];
  systemPrompt: string;
  connectionType: ConnectionType;
  endpoint: string;
  endpointId: string;
  endpointUrl: string;
  apiKey: string;
  defaultModel: string;
  // LLM parameters - names match ChatParameters keys
  useParams: boolean;
  maxOutputTokens: number | undefined;
  temperature: number;
  topP: number;
  topK: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

interface AgentEditorModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  agent?: AIAgent;
  onRequestClose: (success: boolean) => void;
}

const AgentEditorModal: React.FC<AgentEditorModalProps> = ({
  agent,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [form] = Form.useForm<AgentFormValues>();
  const { upsertAgent } = useAIAgent();

  const isEditing = !!agent;

  const initialValues: Partial<AgentFormValues> = useMemo(() => {
    if (agent) {
      return {
        title: agent.meta.title,
        avatar: agent.meta.avatar ?? '',
        description: agent.meta.descriptions ?? '',
        tags: agent.meta.tags ?? [],
        systemPrompt: agent.config.system_prompt,
        connectionType: agent.endpoint_url ? 'external' : 'backendai',
        endpoint: agent.endpoint ?? '',
        endpointId: agent.endpoint_id ?? '',
        endpointUrl: agent.endpoint_url ?? '',
        apiKey: agent.endpoint_token ?? '',
        defaultModel: agent.config.default_model ?? '',
        useParams: !!agent.params,
        maxOutputTokens: agent.params?.max_tokens ?? 4096,
        temperature: agent.params?.temperature ?? 0.7,
        topP: agent.params?.top_p ?? 1,
        topK: 1,
        frequencyPenalty: agent.params?.frequency_penalty ?? 0,
        presencePenalty: agent.params?.presence_penalty ?? 0,
      };
    }
    return {
      avatar: '🤖',
      tags: [],
      connectionType: 'external',
      useParams: false,
      maxOutputTokens: 4096,
      temperature: 0.7,
      topP: 1,
      topK: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    };
  }, [agent]);

  const connectionType = Form.useWatch('connectionType', form);
  const useParamsEnabled = Form.useWatch('useParams', form);

  return (
    <BAIModal
      destroyOnHidden
      title={isEditing ? t('aiAgent.EditAgent') : t('aiAgent.CreateAgent')}
      okText={isEditing ? t('button.Update') : t('button.Create')}
      width={720}
      onCancel={() => onRequestClose(false)}
      onOk={() => {
        form.validateFields().then(
          (values) => {
            const isExternal = values.connectionType === 'external';
            const newAgent: AIAgent = {
              id: agent?.id ?? generateRandomString(),
              endpoint: isExternal
                ? (values.endpointUrl ?? '')
                : values.endpoint,
              endpoint_id: isExternal ? '' : values.endpointId,
              endpoint_url: isExternal ? values.endpointUrl : undefined,
              endpoint_token: isExternal ? values.apiKey : undefined,
              config: {
                system_prompt: values.systemPrompt,
                default_model: values.defaultModel || undefined,
              },
              meta: {
                title: values.title,
                avatar: values.avatar || '🤖',
                descriptions: values.description || undefined,
                tags: values.tags?.length ? values.tags : undefined,
              },
              params: values.useParams
                ? {
                    temperature: values.temperature,
                    max_tokens: values.maxOutputTokens,
                    top_p: values.topP,
                    frequency_penalty: values.frequencyPenalty,
                    presence_penalty: values.presencePenalty,
                  }
                : undefined,
            };
            try {
              upsertAgent(newAgent);
              onRequestClose(true);
            } catch {
              message.error(t('aiAgent.SaveFailed'));
            }
          },
          () => {
            // form validation failed — inline errors are shown by the Form
          },
        );
      }}
      {...modalProps}
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={initialValues}
      >
        <Form.Item
          label={t('aiAgent.Title')}
          name="title"
          rules={[{ required: true, message: t('aiAgent.TitleRequired') }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={t('aiAgent.Avatar')} name="avatar">
          <Input placeholder="🤖" />
        </Form.Item>

        <Form.Item label={t('aiAgent.Description')} name="description">
          <TextArea rows={2} />
        </Form.Item>

        <Form.Item label={t('aiAgent.Tags')} name="tags">
          <Select
            mode="tags"
            tokenSeparators={[',', ' ']}
            open={false}
            suffixIcon={null}
          />
        </Form.Item>

        <Form.Item
          label={t('aiAgent.SystemPrompt')}
          name="systemPrompt"
          rules={[
            { required: true, message: t('aiAgent.SystemPromptRequired') },
          ]}
          tooltip={t('aiAgent.SystemPromptTooltip')}
        >
          <TextArea rows={5} />
        </Form.Item>

        <Form.Item label={t('aiAgent.ConnectionType')} name="connectionType">
          <Radio.Group>
            <Radio.Button value="backendai">
              {t('aiAgent.BackendAIEndpoint')}
            </Radio.Button>
            <Radio.Button value="external">
              {t('aiAgent.ExternalEndpoint')}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {connectionType === 'backendai' && (
          <>
            <Form.Item
              label={t('aiAgent.EndpointName')}
              name="endpoint"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={t('aiAgent.EndpointId')}
              name="endpointId"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </>
        )}

        {connectionType === 'external' && (
          <>
            <Form.Item
              label={t('aiAgent.EndpointUrl')}
              name="endpointUrl"
              rules={[
                { required: true },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    try {
                      new URL(value);
                      return Promise.resolve();
                    } catch {
                      return Promise.reject(new Error(t('aiAgent.InvalidUrl')));
                    }
                  },
                },
              ]}
            >
              <Input placeholder="https://api.example.com/v1" />
            </Form.Item>
            <Form.Item label={t('aiAgent.ApiKey')} name="apiKey">
              <Input.Password
                autoComplete="new-password"
                placeholder={t('aiAgent.ApiKeyPlaceholder')}
              />
            </Form.Item>
          </>
        )}

        <Form.Item label={t('aiAgent.DefaultModel')} name="defaultModel">
          <Input placeholder={t('aiAgent.DefaultModelPlaceholder')} />
        </Form.Item>

        <BAIFlex align="center" justify="between">
          <Typography.Text strong>{t('aiAgent.LLMParameters')}</Typography.Text>
          <Form.Item name="useParams" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </BAIFlex>
        <Divider style={{ marginBlock: token.marginSM }} />
        {Object.entries(chatParameters).map(([id, params]) => (
          <ChatParameterSliderFormItem
            disabled={!useParamsEnabled}
            key={id}
            id={id}
            {...params}
          />
        ))}
      </Form>
    </BAIModal>
  );
};

export default AgentEditorModal;
