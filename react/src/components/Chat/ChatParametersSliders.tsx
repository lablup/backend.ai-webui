import InputNumberWithSlider from '../InputNumberWithSlider';
import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import { DEFAULT_CHAT_PARAMETERS, type ChatParameters } from './ChatModel';
import { ConfigProvider, Divider, Form, Switch, theme, Typography } from 'antd';
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

const ChatParameterSliderFormItem = ({
  id,
  label,
  max,
  min,
  step,
  description,
  disabled,
}: ChatParameterSliderFormItemProps & { disabled: boolean }) => {
  const { token } = theme.useToken();
  return (
    <Form.Item
      label={
        <BAIFlex justify="between" style={{ width: '240px' }}>
          <BAIFlex gap={'xxs'}>
            <Typography.Text
              style={{
                fontSize: token.fontSizeSM,
                marginRight: token.marginXXS,
              }}
            >
              {label}
            </Typography.Text>
            {description && (
              <QuestionIconWithTooltip title={description} trigger="hover" />
            )}
          </BAIFlex>
        </BAIFlex>
      }
      name={id}
    >
      <InputNumberWithSlider
        disabled={disabled}
        min={min}
        max={max}
        step={step ?? null}
      />
    </Form.Item>
  );
};

const chatParameters: Record<string, ChatParameterSliderData> = {
  maxTokens: {
    label: 'Max Tokens',
    min: 50,
    max: 16384,
    step: 1,
    description: t('chatui.chat.parameter.MaxTokens'),
  },
  temperature: {
    label: 'Temperature',
    min: 0.0,
    max: 1,
    step: 0.01,
    description: t('chatui.chat.parameter.Temperature'),
  },
  topP: {
    label: 'Top P',
    min: 0.0,
    max: 1,
    step: 0.01,
    description: t('chatui.chat.parameter.TopP'),
  },
  topK: {
    label: 'Top K',
    min: 1,
    max: 500,
    step: 1,
    description: t('chatui.chat.parameter.TopK'),
  },
  frequencyPenalty: {
    label: 'Frequency Penalty',
    min: 0,
    max: 2,
    step: 0.01,
    description: t('chatui.chat.parameter.FrequencyPenalty'),
  },
  presencePenalty: {
    label: 'Presence Penalty',
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
  const { token } = theme.useToken();
  const currentParameters = useRef<ChatParameters>(
    Object.keys(parameters).length > 0 ? parameters : DEFAULT_CHAT_PARAMETERS,
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            verticalLabelPadding: 0,
            itemMarginBottom: token.marginXXS,
          },
        },
      }}
    >
      <Form
        size="small"
        layout="vertical"
        requiredMark={false}
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
          <Typography.Text
            style={{ fontSize: token.fontSizeLG, marginLeft: token.marginXXS }}
          >
            {t('chatui.chat.parameter.Title')}
          </Typography.Text>
          <Switch
            checked={usingParameters}
            onChange={() => {
              onChangeParameter(!usingParameters, {
                ...currentParameters.current,
              });
            }}
          />
        </BAIFlex>
        <Divider
          style={{
            marginBlock: token.marginSM,
          }}
        />
        {Object.entries(chatParameters).map(([id, params]) => (
          <ChatParameterSliderFormItem
            disabled={!usingParameters}
            key={id}
            id={id}
            {...params}
          />
        ))}
      </Form>
    </ConfigProvider>
  );
};
