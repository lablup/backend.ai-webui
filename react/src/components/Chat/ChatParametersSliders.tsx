/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIFormItem from '../BAIFormItem';
import InputNumberWithSlider from '../InputNumberWithSlider';
import BAIQuestionIconWithTooltipAstryx from '../astryx-bui/BAIQuestionIconWithTooltipAstryx';
import { DEFAULT_CHAT_PARAMETERS, type ChatParameters } from './ChatModel';
import { Divider } from '@astryxdesign/core/Divider';
import { Switch } from '@astryxdesign/core/Switch';
import { Text } from '@astryxdesign/core/Text';
// `Form` state engine stays (SHIM); visuals are BAIFormItem.
import { Form } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { t } from 'i18next';
import { useRef } from 'react';

type ChatParameterChangeEventHandler = (event: {
  id: string;
  value: number;
}) => void;

interface ChatParameterSliderData {
  label: string;
  max: number;
  min: number;
  step: number;
  value?: number;
  description?: string;
}

interface ChatParameterSliderFormItemProps extends ChatParameterSliderData {
  id: string;
  onChange?: ChatParameterChangeEventHandler;
}

export const ChatParameterSliderFormItem = ({
  id,
  label,
  max,
  min,
  step,
  description,
  disabled,
}: ChatParameterSliderFormItemProps & { disabled: boolean }) => {
  return (
    <BAIFormItem
      label={
        <BAIFlex justify="between">
          <BAIFlex gap={'xxs'}>
            <Text style={{ fontSize: 'var(--font-size-sm)' }}>{label}</Text>
            {description && (
              <BAIQuestionIconWithTooltipAstryx title={description} />
            )}
          </BAIFlex>
        </BAIFlex>
      }
      name={id}
    >
      {/* FRONTIER (shared component, ticket-16 precedent): InputNumberWithSlider
          is used across Chat/Sessions/Deployments areas and none has
          converted it yet — kept antd-shaped here, same as
          ModelCardDeployModal. */}
      <InputNumberWithSlider
        disabled={disabled}
        min={min}
        max={max}
        step={step ?? null}
      />
    </BAIFormItem>
  );
};

export const chatParameters: Record<string, ChatParameterSliderData> = {
  maxOutputTokens: {
    label: t('chatui.chat.parameter.label.MaxTokens'),
    min: 50,
    max: 16384,
    step: 1,
    description: t('chatui.chat.parameter.MaxTokens'),
  },
  temperature: {
    label: t('chatui.chat.parameter.label.Temperature'),
    min: 0.0,
    max: 1,
    step: 0.01,
    description: t('chatui.chat.parameter.Temperature'),
  },
  topP: {
    label: t('chatui.chat.parameter.label.TopP'),
    min: 0.0,
    max: 1,
    step: 0.01,
    description: t('chatui.chat.parameter.TopP'),
  },
  topK: {
    label: t('chatui.chat.parameter.label.TopK'),
    min: 1,
    max: 500,
    step: 1,
    description: t('chatui.chat.parameter.TopK'),
  },
  frequencyPenalty: {
    label: t('chatui.chat.parameter.label.FrequencyPenalty'),
    min: 0,
    max: 2,
    step: 0.01,
    description: t('chatui.chat.parameter.FrequencyPenalty'),
  },
  presencePenalty: {
    label: t('chatui.chat.parameter.label.PresencePenalty'),
    min: 0,
    max: 2,
    step: 0.01,
    description: t('chatui.chat.parameter.PresencePenalty'),
  },
};

export const ChatParametersSliders = ({
  parameters,
  usingParameters,
  onChangeParameter,
}: {
  parameters: ChatParameters;
  usingParameters: boolean;
  onChangeParameter: (
    usingParameters: boolean,
    parameters: ChatParameters,
  ) => void;
}) => {
  const currentParameters = useRef<ChatParameters>(
    Object.keys(parameters).length > 0 ? parameters : DEFAULT_CHAT_PARAMETERS,
  );

  return (
    // PILOT-DECISION: the antd `ConfigProvider` Form component-token override
    // (`verticalLabelPadding: 0`, `itemMarginBottom`) tightened antd
    // `Form.Item`'s own spacing. `BAIFormItem` no longer renders antd's
    // spacing at all (MAPPING.md §"SHIM" — the engine stays, the visuals are
    // ours), so the override is moot; the equivalent hook is BAIFormItem's
    // own `--bai-form-item-*` CSS custom properties, set here on the
    // container instead.
    <Form
      size="small"
      layout="vertical"
      requiredMark={false}
      style={
        {
          width: 240,
          '--bai-form-item-margin-bottom': 'var(--spacing-2, 8px)',
          '--bai-form-item-gap': '4px',
        } as React.CSSProperties
      }
      initialValues={
        Object.keys(parameters).length > 0
          ? parameters
          : DEFAULT_CHAT_PARAMETERS
      }
      onValuesChange={(values) => {
        currentParameters.current = {
          ...currentParameters.current,
          ...values,
        };
        onChangeParameter(usingParameters, {
          ...currentParameters.current,
        });
      }}
    >
      <BAIFlex align="center" justify="between">
        <Text style={{ fontSize: 'var(--font-size-lg)' }}>
          {t('chatui.chat.parameter.Title')}
        </Text>
        <Switch
          value={usingParameters}
          label={t('chatui.chat.parameter.Title')}
          isLabelHidden
          onChange={() => {
            onChangeParameter(!usingParameters, {
              ...currentParameters.current,
            });
          }}
        />
      </BAIFlex>
      <Divider style={{ marginBlock: 'var(--spacing-3, 12px)' }} />
      {Object.entries(chatParameters).map(([id, params]) => (
        <ChatParameterSliderFormItem
          disabled={!usingParameters}
          key={id}
          id={id}
          {...params}
        />
      ))}
    </Form>
  );
};
