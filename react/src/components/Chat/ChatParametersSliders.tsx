import InputNumberWithSlider from '../InputNumberWithSlider';
import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import { DEFAULT_CHAT_PARAMETERS, type ChatParameters } from './ChatModel';
import {
  ConfigProvider,
  Divider,
  Flex,
  Form,
  Switch,
  theme,
  Typography,
} from 'antd';
import { t } from 'i18next';
import { useRef, useState } from 'react';

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
        <Flex justify="between" style={{ width: '240px' }}>
          <Flex gap={'xxs'}>
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
          </Flex>
        </Flex>
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
  onChangeParameter,
}: {
  parameters: ChatParameters;
  onChangeParameter: (
    usingParameters: boolean,
    parameters: ChatParameters,
  ) => void;
}) => {
  const { token } = theme.useToken();
  const [enabled, setEnabled] = useState(false);
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
          onChangeParameter(enabled, {
            ...currentParameters.current,
          });
        }}
      >
        <Flex align="center" justify="space-between">
          <Typography.Text
            style={{ fontSize: token.fontSizeLG, marginLeft: token.marginXXS }}
          >
            {t('chatui.chat.parameter.Title')}
          </Typography.Text>
          <Switch
            checked={enabled}
            onChange={() => {
              setEnabled(!enabled);
              onChangeParameter(!enabled, {
                ...currentParameters.current,
              });
            }}
          />
        </Flex>
        <Divider
          style={{
            marginBlock: token.marginSM,
          }}
        />
        {Object.entries(chatParameters).map(([id, params]) => (
          <ChatParameterSliderFormItem
            disabled={!enabled}
            key={id}
            id={id}
            {...params}
          />
        ))}
      </Form>
    </ConfigProvider>
  );
};
