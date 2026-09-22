/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import { theme } from '../../theme-shim';
import BAIFormItem from '../BAIFormItem';
import { AstryxFormTextInput } from '../astryxFormControls';
import { normalizeCustomEndpointURL } from './ChatModel';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { BAIFlex } from 'backend.ai-ui';
import { LinkIcon } from 'lucide-react';
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
  /** Last `/models` failure for the current URL and key. */
  errorMessage?: string;
  loading?: boolean;
  onSubmit: (values: CustomEndpointFormValues) => void;
  onCancel?: () => void;
}

const CustomEndpointForm: React.FC<CustomEndpointFormProps> = ({
  baseURL,
  apiKey,
  isApiKeyMissing,
  errorMessage,
  loading,
  onSubmit,
  onCancel,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token: themeToken } = theme.useToken();
  const [form] = Form.useForm<CustomEndpointFormValues>();

  const submit = () => {
    form.validateFields().then((values) => {
      onSubmit({
        baseURL: normalizeCustomEndpointURL(values.baseURL) ?? '',
        apiKey: values.apiKey?.trim() || undefined,
      });
    });
  };

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
        {isApiKeyMissing ? (
          <Banner
            status="warning"
            title={t('chatui.customEndpoint.ApiKeyMissing')}
            style={{ marginBottom: themeToken.size }}
          />
        ) : errorMessage ? (
          <Banner
            status="error"
            title={t('chatui.customEndpoint.ConnectionFailed')}
            description={errorMessage}
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
            disabled={loading}
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
            disabled={loading}
            autoComplete="off"
            hasAutoFocus={!!baseURL && isApiKeyMissing}
            onEnter={submit}
          />
        </BAIFormItem>
        <BAIFlex direction="row" gap="xs">
          <Button
            variant="primary"
            icon={<LinkIcon size="1em" />}
            isLoading={loading}
            label={t('chatui.customEndpoint.Connect')}
            onClick={submit}
          />
          {onCancel ? (
            <Button
              variant="secondary"
              isDisabled={loading}
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
