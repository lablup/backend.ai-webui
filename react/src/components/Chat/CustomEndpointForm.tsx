/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import { theme } from '../../theme-shim';
import BAIFormItem from '../BAIFormItem';
import { AstryxFormTextInput } from '../astryxFormControls';
import { normalizeCustomEndpointURL, type ChatModel } from './ChatModel';
import { fetchOpenAIModels, type ModelsFetchError } from './openAIModels';
import { Banner } from '@lablup/ui-common/Banner';
import { Button } from '@lablup/ui-common/Button';
import { BAIFlex } from 'backend.ai-ui';
import { LinkIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type CustomEndpointFormValues = {
  baseURL: string;
  apiKey?: string;
};

interface CustomEndpointFormProps {
  baseURL?: string;
  apiKey?: string;
  /** The URL came back from history but its key did not (see `customEndpointKeyStore`). */
  isApiKeyMissing?: boolean;
  /** Why the restored endpoint's `/models` call failed, shown before any retry. */
  initialFailure?: ModelsFetchError;
  loading?: boolean;
  /** Called only after `/models` answered with at least one model. */
  onSubmit: (values: CustomEndpointFormValues, models: ChatModel[]) => void;
  onCancel?: () => void;
}

type ProbeFailure = ModelsFetchError | { kind: 'no-models' };

function suggestV1(baseURL: string) {
  const url = new URL(baseURL);
  return /\/v1$/.test(url.pathname) ? undefined : `${baseURL}/v1`;
}

const CustomEndpointForm: React.FC<CustomEndpointFormProps> = ({
  baseURL,
  apiKey,
  isApiKeyMissing,
  initialFailure,
  loading,
  onSubmit,
  onCancel,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token: themeToken } = theme.useToken();
  const [form] = Form.useForm<CustomEndpointFormValues>();
  const [isProbing, setIsProbing] = useState(false);
  const [failure, setFailure] = useState<
    { error: ProbeFailure; baseURL: string } | undefined
  >(initialFailure && baseURL ? { error: initialFailure, baseURL } : undefined);

  const isBusy = !!loading || isProbing;

  const connect = async (values: CustomEndpointFormValues) => {
    const normalized = normalizeCustomEndpointURL(values.baseURL) ?? '';
    const key = values.apiKey?.trim() || undefined;
    setIsProbing(true);
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
      onSubmit({ baseURL: normalized, apiKey: key }, result.data);
    } finally {
      setIsProbing(false);
    }
  };

  const submit = () => {
    form.validateFields().then(connect);
  };

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
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        padding: themeToken.paddingContentVerticalLG,
        paddingInline: themeToken.paddingContentHorizontal,
        backgroundColor: themeToken.colorBgContainer,
        borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
      }}
    >
      <Form
        form={form}
        layout="vertical"
        size="small"
        key={baseURL}
        initialValues={{ baseURL: baseURL ?? '', apiKey: apiKey ?? '' }}
      >
        {failureView ? (
          <Banner
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
            style={{ marginBottom: themeToken.size }}
          />
        ) : isApiKeyMissing ? (
          <Banner
            status="warning"
            title={t('chatui.customEndpoint.ApiKeyMissing')}
            style={{ marginBottom: themeToken.size }}
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
          <AstryxFormTextInput
            label={t('chatui.customEndpoint.BaseURL')}
            placeholder="https://api.example.com/v1"
            disabled={isBusy}
            hasAutoFocus={!baseURL}
            onEnter={submit}
          />
        </BAIFormItem>
        <BAIFormItem
          label={t('chatui.customEndpoint.ApiKey')}
          name="apiKey"
          extra={t('chatui.customEndpoint.ApiKeyHint')}
        >
          <AstryxFormTextInput
            type="password"
            label={t('chatui.customEndpoint.ApiKey')}
            placeholder="sk-…"
            disabled={isBusy}
            autoComplete="off"
            hasAutoFocus={!!baseURL && isApiKeyMissing}
            onEnter={submit}
          />
        </BAIFormItem>
        <BAIFlex direction="row" gap="xs">
          <Button
            variant="primary"
            icon={<LinkIcon size="1em" />}
            isLoading={isBusy}
            label={t('chatui.customEndpoint.Connect')}
            onClick={submit}
          />
          {onCancel ? (
            <Button
              variant="secondary"
              isDisabled={isBusy}
              label={t('button.Cancel')}
              onClick={onCancel}
            />
          ) : null}
        </BAIFlex>
      </Form>
    </BAIFlex>
  );
};

export default CustomEndpointForm;
