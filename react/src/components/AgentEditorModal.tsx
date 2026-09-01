/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
// `Form` state engine stays (SHIM); visuals are BAIFormItem.
import { Form } from '../form-engine';
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
import BAIFormItem from './BAIFormItem';
import {
  AstryxFormSegmented,
  AstryxFormTextArea,
  AstryxFormTextInput,
} from './astryxFormControls';
import { Banner } from '@astryxdesign/core/Banner';
import { Code } from '@astryxdesign/core/Code';
import { Divider } from '@astryxdesign/core/Divider';
import { Switch } from '@astryxdesign/core/Switch';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  generateRandomString,
} from 'backend.ai-ui';
import { isEmpty, map, split, trim } from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';

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

// PILOT-DECISION: antd `Select mode="tags"` (free-entry chip input, no
// dropdown — `open={false}`) maps to Astryx `Tokenizer` (MAPPING.md §3.1),
// which is a real composition (`SearchSource`, `tokenSeparators` has no
// equivalent). Simplified to a comma-separated `TextInput` for this single
// low-stakes field (agent catalog tags) — simplicity policy.
const AgentTagsInput: React.FC<{
  value?: string[];
  onChange?: (value: string[]) => void;
}> = ({ value, onChange }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <AstryxFormTextInput
      label={t('aiAgent.Tags')}
      placeholder={t('aiAgent.TagsPlaceholder')}
      value={(value ?? []).join(', ')}
      onChange={(text) =>
        onChange?.(
          map(split(text, /[,\s]+/), trim).filter((tag) => !isEmpty(tag)),
        )
      }
    />
  );
};

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
      ? t('button.Save')
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
        <Banner
          status="info"
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
        <BAIFormItem
          label={t('aiAgent.Name')}
          name="name"
          rules={[{ required: true, message: t('aiAgent.NameRequired') }]}
        >
          <AstryxFormTextInput label={t('aiAgent.Name')} />
        </BAIFormItem>

        <BAIFormItem label={t('aiAgent.Icon')} name="icon">
          <AstryxFormTextInput label={t('aiAgent.Icon')} placeholder="🤖" />
        </BAIFormItem>

        <BAIFormItem label={t('aiAgent.Description')} name="description">
          <AstryxFormTextArea label={t('aiAgent.Description')} rows={2} />
        </BAIFormItem>

        <BAIFormItem label={t('aiAgent.Tags')} name="tags">
          <AgentTagsInput />
        </BAIFormItem>

        <BAIFormItem
          label={t('aiAgent.SystemPrompt')}
          name="systemPrompt"
          rules={[
            { required: true, message: t('aiAgent.SystemPromptRequired') },
          ]}
          tooltip={t('aiAgent.SystemPromptTooltip')}
        >
          <AstryxFormTextArea label={t('aiAgent.SystemPrompt')} rows={6} />
        </BAIFormItem>

        <BAIFormItem
          label={t('aiAgent.Instructions')}
          name="instructions"
          tooltip={t('aiAgent.InstructionsTooltip')}
        >
          <AstryxFormTextArea label={t('aiAgent.Instructions')} rows={3} />
        </BAIFormItem>

        <BAIFormItem
          label={t('aiAgent.PreferredModelId')}
          name="preferredModelId"
          tooltip={t('aiAgent.PreferredModelIdTooltip')}
        >
          <AstryxFormTextInput
            label={t('aiAgent.PreferredModelId')}
            placeholder={t('aiAgent.PreferredModelIdPlaceholder')}
          />
        </BAIFormItem>

        {/* PILOT-DECISION: antd `Divider titlePlacement="left"` — the label
            position (as opposed to centered) has no destination on Astryx
            `Divider` (MAPPING.md §4 — `orientation="left"|"right"` is NONE).
            The label itself (`children`) survives. */}
        <Divider>{t('aiAgent.Connection')}</Divider>

        <BAIFormItem label={t('aiAgent.ConnectionType')} name="connectionType">
          <AstryxFormSegmented
            label={t('aiAgent.ConnectionType')}
            options={[
              { value: 'backendai', label: t('aiAgent.BackendAIEndpoint') },
              { value: 'external', label: t('aiAgent.ExternalEndpoint') },
            ]}
          />
        </BAIFormItem>

        {connectionType === 'backendai' && (
          <>
            <BAIFormItem label={t('aiAgent.EndpointName')} name="endpoint">
              <AstryxFormTextInput label={t('aiAgent.EndpointName')} />
            </BAIFormItem>
            <BAIFormItem label={t('aiAgent.EndpointId')} name="endpointId">
              <AstryxFormTextInput label={t('aiAgent.EndpointId')} />
            </BAIFormItem>
          </>
        )}

        {connectionType === 'external' && (
          <>
            <BAIFormItem
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
              <AstryxFormTextInput
                label={t('aiAgent.EndpointUrl')}
                placeholder="https://api.example.com/v1"
              />
            </BAIFormItem>
            <BAIFormItem label={t('aiAgent.ApiKey')} name="apiKey">
              <AstryxFormTextInput
                label={t('aiAgent.ApiKey')}
                type="password"
                placeholder={t('aiAgent.ApiKeyPlaceholder')}
              />
            </BAIFormItem>
          </>
        )}

        <Divider>{t('aiAgent.ToolConfig')}</Divider>
        <Banner
          status="info"
          style={{ marginBottom: 16 }}
          title={t('aiAgent.ToolCallingComingSoonTitle')}
          description={t('aiAgent.ToolCallingComingSoonDescription')}
        />

        {/* PILOT-DECISION: these fields are all `disabled` in the original —
            non-editable catalog display, not real form-bound inputs (no
            `name`). Simplified to plain read-only `ReadOnlyField` rows
            instead of disabled Select/InputNumber/Switch controls
            (simplicity policy — a disabled interactive control that can
            never be interacted with is just a styled label). */}
        <ReadOnlyField
          label={t('aiAgent.EnabledTools')}
          value={
            toolConfig.enabledTools?.length
              ? toolConfig.enabledTools.join(', ')
              : undefined
          }
          placeholder={t('aiAgent.NotConfigured')}
        />
        <ReadOnlyField
          label={t('aiAgent.DisabledTools')}
          value={
            toolConfig.disabledTools?.length
              ? toolConfig.disabledTools.join(', ')
              : undefined
          }
          placeholder={t('aiAgent.NotConfigured')}
        />
        <BAIFormItem label={t('aiAgent.ToolPermissionOverrides')}>
          <ToolPermissionsTable
            permissions={toolConfig.toolPermissionOverrides ?? {}}
          />
        </BAIFormItem>

        <Divider>{t('aiAgent.ModelPreferences')}</Divider>

        <ReadOnlyField
          label={t('aiAgent.MinContextWindow')}
          value={modelPreferences.minContextWindow ?? undefined}
          placeholder={t('aiAgent.NotConfigured')}
        />
        <BAIFlex gap="md" align="center">
          <Text>{t('aiAgent.RequiresToolCalling')}</Text>
          <Switch
            value={modelPreferences.requiresToolCalling ?? false}
            label={t('aiAgent.RequiresToolCalling')}
            isLabelHidden
            isDisabled
          />
        </BAIFlex>
        <BAIFlex gap="md" align="center" style={{ marginTop: 8 }}>
          <Text>{t('aiAgent.RequiresVision')}</Text>
          <Switch
            value={modelPreferences.requiresVision ?? false}
            label={t('aiAgent.RequiresVision')}
            isLabelHidden
            isDisabled
          />
        </BAIFlex>

        <Divider>{t('aiAgent.SettingsOverrides')}</Divider>

        <ReadOnlyField
          label={t('aiAgent.MaxIterations')}
          value={settingsOverrides.maxIterations ?? undefined}
          placeholder={t('aiAgent.NotConfigured')}
        />
        <ReadOnlyField
          label={t('aiAgent.MaxToolCalls')}
          value={settingsOverrides.maxToolCalls ?? undefined}
          placeholder={t('aiAgent.NotConfigured')}
        />
        <ReadOnlyField
          label={t('aiAgent.DefaultTimeoutSeconds')}
          value={settingsOverrides.defaultTimeout ?? undefined}
          placeholder={t('aiAgent.NotConfigured')}
        />
        <ReadOnlyField
          label={t('aiAgent.ContextCompressionThreshold')}
          value={settingsOverrides.contextCompressionThreshold ?? undefined}
          placeholder={t('aiAgent.NotConfigured')}
        />
      </Form>
    </BAIModal>
  );
};

interface ReadOnlyFieldProps {
  label: string;
  value?: React.ReactNode;
  placeholder?: string;
}

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
  placeholder,
}) => {
  'use memo';
  const hasValue = value !== undefined && value !== null && value !== '';
  return (
    <BAIFormItem label={label}>
      <Text color={hasValue ? undefined : 'secondary'}>
        {hasValue ? value : placeholder}
      </Text>
    </BAIFormItem>
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
    return <Text color="secondary">{t('aiAgent.NoToolPermissions')}</Text>;
  }

  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      {entries.map(([tool, permission]) => (
        <BAIFlex key={tool} gap="sm" align="center" justify="between">
          <Code>{tool}</Code>
          <Text color="secondary">{permission}</Text>
        </BAIFlex>
      ))}
    </BAIFlex>
  );
};

export default AgentEditorModal;
