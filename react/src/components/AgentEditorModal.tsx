/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  AgentEndpointBinding,
  AgentProfile,
  AgentSettingsOverrides,
  AIAgent,
  ModelPreferences,
  ToolConfig,
  ToolPermission,
  useAIAgent,
} from '../hooks/useAIAgent';
import {
  App,
  Alert,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  Typography,
} from 'antd';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  generateRandomString,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;

type ConnectionType = 'backendai' | 'external';

interface AgentFormValues {
  name: string;
  icon: string;
  description: string;
  tags: string[];
  systemPrompt: string;
  instructions: string;
  preferredModelId: string;
  // Connection (sidecar)
  connectionType: ConnectionType;
  endpoint: string;
  endpointId: string;
  endpointUrl: string;
  apiKey: string;
}

const TOOL_PERMISSIONS: ToolPermission[] = [
  'always_allow',
  'ask_once',
  'ask_always',
  'never_allow',
];

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
  const { message } = App.useApp();
  const [form] = Form.useForm<AgentFormValues>();
  const { upsertAgent, upsertEndpointBinding, getEndpointBinding } =
    useAIAgent();

  const isEditing = !!agent;
  const isBuiltin = !!agent?.isBuiltin && !agent?.isCustom;
  // Built-in agents are read-only; the OK action becomes "Save as Copy" which
  // clones the profile into a custom one. Without this the modal is a dead-end.
  const okLabel = isBuiltin
    ? t('aiAgent.SaveAsCopy')
    : isEditing
      ? t('button.Update')
      : t('button.Create');

  const existingBinding = agent ? getEndpointBinding(agent.id) : undefined;

  // Tool / model / settings sections are read-only until the chat UI supports
  // tool calling. They're displayed so users can see what the catalog profile
  // declares, but cannot be edited here.
  const toolConfig: ToolConfig = agent?.toolConfig ?? {};
  const modelPreferences: ModelPreferences = agent?.modelPreferences ?? {};
  const settingsOverrides: AgentSettingsOverrides =
    agent?.settingsOverrides ?? {};

  const initialValues: Partial<AgentFormValues> = agent
    ? {
        name: agent.name,
        icon: agent.icon ?? '',
        description: agent.description ?? '',
        tags: agent.tags ?? [],
        systemPrompt: agent.systemPrompt ?? '',
        instructions: agent.instructions ?? '',
        preferredModelId: agent.modelPreferences?.preferredModelId ?? '',
        connectionType: existingBinding?.endpoint_url
          ? 'external'
          : 'backendai',
        endpoint: existingBinding?.endpoint ?? '',
        endpointId: existingBinding?.endpoint_id ?? '',
        endpointUrl: existingBinding?.endpoint_url ?? '',
        apiKey: existingBinding?.endpoint_token ?? '',
      }
    : {
        icon: '🤖',
        tags: [],
        instructions: '',
        preferredModelId: '',
        connectionType: 'external',
      };

  const connectionType = Form.useWatch('connectionType', form);

  const buildProfile = (values: AgentFormValues): AgentProfile => {
    const now = new Date().toISOString();
    // When cloning a built-in, mint a new id and clear builtin flags so the
    // result becomes an editable custom agent.
    const base: AgentProfile =
      agent && !isBuiltin
        ? {
            ...agent,
            name: values.name,
            icon: values.icon || '🤖',
            description: values.description || '',
            tags: values.tags?.length ? values.tags : [],
            systemPrompt: values.systemPrompt,
            instructions: values.instructions || '',
            modelPreferences: {
              ...(agent.modelPreferences ?? {}),
              preferredModelId: values.preferredModelId || null,
            },
            updatedAt: now,
          }
        : agent && isBuiltin
          ? {
              ...agent,
              id: generateRandomString(),
              name: values.name,
              icon: values.icon || agent.icon || '🤖',
              description: values.description || agent.description || '',
              tags: values.tags?.length ? values.tags : (agent.tags ?? []),
              systemPrompt: values.systemPrompt,
              instructions: values.instructions || agent.instructions || '',
              modelPreferences: {
                ...(agent.modelPreferences ?? {}),
                preferredModelId: values.preferredModelId || null,
              },
              isBuiltin: false,
              isCommunity: false,
              sourceUrl: null,
              createdAt: now,
              updatedAt: now,
            }
          : {
              id: generateRandomString(),
              name: values.name,
              description: values.description || '',
              version: '1.0.0',
              author: '',
              icon: values.icon || '🤖',
              category: 'custom_agent',
              systemPrompt: values.systemPrompt,
              instructions: values.instructions || '',
              toolConfig: {},
              modelPreferences: {
                preferredModelId: values.preferredModelId || null,
              },
              settingsOverrides: {},
              translations: {},
              tags: values.tags ?? [],
              isBuiltin: false,
              isCommunity: false,
              sourceUrl: null,
              createdAt: now,
              updatedAt: now,
            };
    return base;
  };

  const buildBinding = (
    values: AgentFormValues,
  ): AgentEndpointBinding | null => {
    const isExternal = values.connectionType === 'external';
    if (isExternal) {
      if (!values.endpointUrl) return null;
      return {
        endpoint: values.endpointUrl,
        endpoint_url: values.endpointUrl,
        endpoint_token: values.apiKey || undefined,
      };
    }
    if (!values.endpoint && !values.endpointId) return null;
    return {
      endpoint: values.endpoint,
      endpoint_id: values.endpointId,
    };
  };

  return (
    <BAIModal
      destroyOnHidden
      title={isEditing ? t('aiAgent.EditAgent') : t('aiAgent.CreateAgent')}
      okText={okLabel}
      width={760}
      onCancel={() => onRequestClose(false)}
      onOk={() => {
        form.validateFields().then(
          (values) => {
            try {
              const profile = buildProfile(values);
              upsertAgent({ ...profile, isCustom: true });
              upsertEndpointBinding(profile.id, buildBinding(values));
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
      {isBuiltin && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          title={t('aiAgent.BuiltinReadonlyTitle')}
          description={t('aiAgent.BuiltinReadonlyDescription')}
        />
      )}
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={initialValues}
      >
        <Form.Item
          label={t('aiAgent.Name')}
          name="name"
          rules={[{ required: true, message: t('aiAgent.NameRequired') }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={t('aiAgent.Icon')} name="icon">
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
          <TextArea rows={6} />
        </Form.Item>

        <Form.Item
          label={t('aiAgent.Instructions')}
          name="instructions"
          tooltip={t('aiAgent.InstructionsTooltip')}
        >
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label={t('aiAgent.PreferredModelId')}
          name="preferredModelId"
          tooltip={t('aiAgent.PreferredModelIdTooltip')}
        >
          <Input placeholder={t('aiAgent.PreferredModelIdPlaceholder')} />
        </Form.Item>

        <Divider titlePlacement="left">{t('aiAgent.Connection')}</Divider>

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
            <Form.Item label={t('aiAgent.EndpointName')} name="endpoint">
              <Input />
            </Form.Item>
            <Form.Item label={t('aiAgent.EndpointId')} name="endpointId">
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
                {
                  required: true,
                  message: t('aiAgent.EndpointUrlRequired'),
                },
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

        <Divider titlePlacement="left">{t('aiAgent.ToolConfig')}</Divider>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          title={t('aiAgent.ToolCallingComingSoonTitle')}
          description={t('aiAgent.ToolCallingComingSoonDescription')}
        />

        <Form.Item label={t('aiAgent.EnabledTools')}>
          <Select
            mode="tags"
            value={toolConfig.enabledTools ?? []}
            open={false}
            suffixIcon={null}
            disabled
          />
        </Form.Item>
        <Form.Item label={t('aiAgent.DisabledTools')}>
          <Select
            mode="tags"
            value={toolConfig.disabledTools ?? []}
            open={false}
            suffixIcon={null}
            disabled
          />
        </Form.Item>
        <Form.Item label={t('aiAgent.ToolPermissionOverrides')}>
          <ToolPermissionsTable
            permissions={toolConfig.toolPermissionOverrides ?? {}}
          />
        </Form.Item>

        <Divider titlePlacement="left">{t('aiAgent.ModelPreferences')}</Divider>

        <Form.Item label={t('aiAgent.MinContextWindow')}>
          <InputNumber
            value={modelPreferences.minContextWindow ?? undefined}
            style={{ width: '100%' }}
            disabled
            placeholder={t('aiAgent.NotConfigured')}
          />
        </Form.Item>
        <BAIFlex gap="md" align="center">
          <Typography.Text>{t('aiAgent.RequiresToolCalling')}</Typography.Text>
          <Switch
            checked={modelPreferences.requiresToolCalling ?? false}
            disabled
          />
        </BAIFlex>
        <BAIFlex gap="md" align="center" style={{ marginTop: 8 }}>
          <Typography.Text>{t('aiAgent.RequiresVision')}</Typography.Text>
          <Switch checked={modelPreferences.requiresVision ?? false} disabled />
        </BAIFlex>

        <Divider titlePlacement="left">
          {t('aiAgent.SettingsOverrides')}
        </Divider>

        <Form.Item label={t('aiAgent.MaxIterations')}>
          <InputNumber
            value={settingsOverrides.maxIterations ?? undefined}
            style={{ width: '100%' }}
            disabled
            placeholder={t('aiAgent.NotConfigured')}
          />
        </Form.Item>
        <Form.Item label={t('aiAgent.MaxToolCalls')}>
          <InputNumber
            value={settingsOverrides.maxToolCalls ?? undefined}
            style={{ width: '100%' }}
            disabled
            placeholder={t('aiAgent.NotConfigured')}
          />
        </Form.Item>
        <Form.Item label={t('aiAgent.DefaultTimeoutSeconds')}>
          <InputNumber
            value={settingsOverrides.defaultTimeout ?? undefined}
            style={{ width: '100%' }}
            disabled
            placeholder={t('aiAgent.NotConfigured')}
          />
        </Form.Item>
        <Form.Item label={t('aiAgent.ContextCompressionThreshold')}>
          <InputNumber
            value={settingsOverrides.contextCompressionThreshold ?? undefined}
            style={{ width: '100%' }}
            disabled
            placeholder={t('aiAgent.NotConfigured')}
          />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

interface ToolPermissionsTableProps {
  permissions: Record<string, ToolPermission>;
}

const ToolPermissionsTable: React.FC<ToolPermissionsTableProps> = ({
  permissions,
}) => {
  'use memo';

  const { t } = useTranslation();
  const entries = Object.entries(permissions);

  if (entries.length === 0) {
    return (
      <Typography.Text type="secondary">
        {t('aiAgent.NoToolPermissions')}
      </Typography.Text>
    );
  }

  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      {entries.map(([tool, permission]) => (
        <BAIFlex key={tool} gap="sm" align="center" justify="between">
          <Typography.Text code>{tool}</Typography.Text>
          <Select
            value={permission}
            options={TOOL_PERMISSIONS.map((p) => ({
              label: p,
              value: p,
            }))}
            disabled
            style={{ minWidth: 160 }}
          />
        </BAIFlex>
      ))}
    </BAIFlex>
  );
};

export default AgentEditorModal;
