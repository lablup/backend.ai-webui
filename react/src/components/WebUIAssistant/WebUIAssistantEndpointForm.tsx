/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import BAIFormItem from '../BAIFormItem';
import { normalizeCustomEndpointURL, type ChatModel } from '../Chat/ChatModel';
import { fetchOpenAIModels, type ModelsFetchError } from '../Chat/openAIModels';
import { Banner } from '@lablup/ui-common/Banner';
import { Button } from '@lablup/ui-common/Button';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFlex, BAITextInput } from 'backend.ai-ui';
import { useImperativeHandle, useState, type Ref } from 'react';
import { useTranslation } from 'react-i18next';

export type WebUIAssistantEndpointFormValues = {
  baseURL: string;
  apiKey?: string;
};

export interface WebUIAssistantEndpointFormHandle {
  /** Validates, probes `/models`, and resolves after `onSubmit` settles or the probe fails. */
  submit: () => Promise<void>;
}

interface WebUIAssistantEndpointFormProps {
  baseURL?: string;
  apiKey?: string;
  /** Called only after `/models` answered with at least one model. */
  onSubmit: (
    values: WebUIAssistantEndpointFormValues,
    models: ChatModel[],
  ) => Promise<void> | void;
  /** The connect modal's footer submits through this handle. */
  ref?: Ref<WebUIAssistantEndpointFormHandle>;
}

type ProbeFailure = ModelsFetchError | { kind: 'no-models' };

function suggestV1(baseURL: string) {
  const url = new URL(baseURL);
  return /\/v1$/.test(url.pathname) ? undefined : `${baseURL}/v1`;
}

/**
 * A URL and key typed in for the assistant's connect modal: probes `/models`
 * and explains a failure, laid out flush with the modal's other fields.
 */
const WebUIAssistantEndpointForm: React.FC<WebUIAssistantEndpointFormProps> = ({
  baseURL,
  apiKey,
  onSubmit,
  ref,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const [form] = Form.useForm<WebUIAssistantEndpointFormValues>();
  const [isBusy, setIsBusy] = useState(false);
  const [failure, setFailure] = useState<{
    error: ProbeFailure;
    baseURL: string;
  }>();

  const connect = async (values: WebUIAssistantEndpointFormValues) => {
    const normalized = normalizeCustomEndpointURL(values.baseURL) ?? '';
    const key = values.apiKey?.trim() || undefined;
    setIsBusy(true);
    setFailure(undefined);
    try {
      const result = await fetchOpenAIModels(normalized, key);
      if (result.error) {
        setFailure({ error: result.error, baseURL: normalized });
        return;
      }
      if (result.data.length === 0) {
        setFailure({ error: { kind: 'no-models' }, baseURL: normalized });
        return;
      }
      await onSubmit({ baseURL: normalized, apiKey: key }, result.data);
    } finally {
      setIsBusy(false);
    }
  };

  const submit = () => form.validateFields().then(connect, () => undefined);
  useImperativeHandle(ref, () => ({ submit }));

  const retryWithV1 = (url: string) => {
    form.setFieldsValue({ baseURL: url });
    connect({ baseURL: url, apiKey: form.getFieldValue('apiKey') });
  };

  const describeFailure = ({
    error,
    baseURL: failedURL,
  }: NonNullable<typeof failure>): {
    title: string;
    description?: string;
    retryURL?: string;
  } => {
    switch (error.kind) {
      case 'http':
        if (error.status === 401 || error.status === 403) {
          return {
            title: t('chatui.customEndpoint.error.Unauthorized'),
            description: t('chatui.customEndpoint.error.UnauthorizedHint'),
          };
        }
        if (error.status === 404) {
          const retryURL = suggestV1(failedURL);
          return {
            title: t('chatui.customEndpoint.error.NotFound'),
            description: retryURL
              ? t('chatui.customEndpoint.error.NotFoundSuggestV1', {
                  url: retryURL,
                })
              : t('chatui.customEndpoint.error.NotFoundHint'),
            retryURL,
          };
        }
        if (error.status >= 500) {
          return {
            title: t('chatui.customEndpoint.error.ServerError', {
              status: error.status,
            }),
          };
        }
        return {
          title: t('chatui.customEndpoint.error.Http', {
            status: error.status,
          }),
        };
      case 'timeout':
        return { title: t('chatui.customEndpoint.error.Timeout') };
      case 'network':
        return {
          title: t('chatui.customEndpoint.error.Network'),
          description: t('chatui.customEndpoint.error.NetworkHint'),
        };
      case 'invalid-response':
        return {
          title: t('chatui.customEndpoint.error.InvalidResponse'),
          description: t('chatui.customEndpoint.error.NotFoundHint'),
        };
      case 'no-models':
        return { title: t('chatui.customEndpoint.error.NoModels') };
    }
  };

  const failureView = failure ? describeFailure(failure) : undefined;

  return (
    <BAIFlex direction="column" align="stretch">
      <Form
        form={form}
        layout="vertical"
        size="small"
        key={baseURL}
        initialValues={{ baseURL: baseURL ?? '', apiKey: apiKey ?? '' }}
      >
        {failureView ? (
          <Banner
            role="alert"
            status="error"
            title={failureView.title}
            description={failureView.description}
            endContent={
              failureView.retryURL ? (
                <Button
                  variant="secondary"
                  size="sm"
                  isDisabled={isBusy}
                  label={t('chatui.customEndpoint.error.RetryWithV1')}
                  onClick={() => retryWithV1(failureView.retryURL ?? '')}
                />
              ) : undefined
            }
            style={{ marginBottom: token('--spacing-4') }}
          />
        ) : null}
        <BAIFormItem
          label={t('chatui.customEndpoint.BaseURL')}
          name="baseURL"
          rules={[
            {
              required: true,
              message: t('chatui.customEndpoint.BaseURLRequired'),
            },
            {
              validator: (_, value: string) =>
                !value || normalizeCustomEndpointURL(value)
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error(t('chatui.customEndpoint.InvalidBaseURL')),
                    ),
            },
          ]}
          extra={t('chatui.customEndpoint.BaseURLHint')}
        >
          <BAITextInput
            aria-label={t('chatui.customEndpoint.BaseURL')}
            placeholder="https://api.example.com/v1"
            disabled={isBusy}
            hasAutoFocus={!baseURL}
            onEnter={() => void submit()}
          />
        </BAIFormItem>
        <BAIFormItem
          label={t('chatui.customEndpoint.ApiKey')}
          name="apiKey"
          extra={t('chatui.customEndpoint.ApiKeyHint')}
        >
          <BAITextInput
            type="password"
            aria-label={t('chatui.customEndpoint.ApiKey')}
            placeholder="sk-…"
            disabled={isBusy}
            autoComplete="off"
            onEnter={() => void submit()}
          />
        </BAIFormItem>
      </Form>
    </BAIFlex>
  );
};

export default WebUIAssistantEndpointForm;
