/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import DeploymentTokenSelect from './DeploymentTokenSelect';
import { ReloadOutlined } from '@ant-design/icons';
import useResizeObserver from '@react-hook/resize-observer';
import { Alert, Button, Form, Input, theme } from 'antd';
import type { FormInstance } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type CustomModelFormValues = {
  baseURL?: string;
  basePath?: string;
  token?: string;
};

type CustomModelFormProps = {
  deploymentUrl?: string;
  basePath?: string;
  token?: string;
  deploymentId?: string | null;
  loading: boolean;
  hasNoDesiredReplicas?: boolean;
  onSubmit?: (formData: CustomModelFormValues) => void;
};

const CustomModelForm: React.FC<CustomModelFormProps> = ({
  deploymentUrl,
  basePath,
  token,
  deploymentId,
  loading,
  hasNoDesiredReplicas,
  onSubmit,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token: themeToken } = theme.useToken();
  const formRef = useRef<FormInstance>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [shrinkControlSize, setShrinkControlSize] = useState<boolean>(true);
  // eslint-disable-next-line react-hooks/refs
  useResizeObserver(containerRef.current, ({ contentRect }) => {
    setShrinkControlSize(contentRect.width < 480);
  });

  return (
    <BAIFlex
      direction="row"
      style={{
        padding: themeToken.paddingContentVerticalLG,
        paddingInline: themeToken.paddingContentHorizontal,
        backgroundColor: themeToken.colorBgContainer,
        overflow: 'hidden',
        borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
      }}
      ref={containerRef}
    >
      <Form
        ref={formRef}
        layout="horizontal"
        size="small"
        style={{ flex: 1 }}
        key={deploymentUrl}
        initialValues={{
          basePath: basePath,
          token: token,
        }}
      >
        {hasNoDesiredReplicas ? (
          <Alert
            type="warning"
            showIcon
            title={t('chatui.NoDesiredReplicas')}
            style={{ marginBottom: themeToken.size }}
          ></Alert>
        ) : null}
        <Alert
          type="warning"
          showIcon
          title={t('chatui.CannotFindModel')}
          style={{ marginBottom: themeToken.size }}
        ></Alert>
        <Form.Item label={t('modelService.BasePath')} name="basePath">
          <Input
            placeholder="v1"
            prefix={shrinkControlSize ? undefined : deploymentUrl}
            disabled={loading}
          />
        </Form.Item>
        <Form.Item label={t('modelService.Token')} name="token">
          <DeploymentTokenSelect
            loading={loading}
            disabled={loading}
            deploymentId={deploymentId}
            style={{
              width: shrinkControlSize ? '100%' : '200px',
            }}
          />
        </Form.Item>
        <Button
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={() => {
            onSubmit?.({
              basePath: formRef.current?.getFieldValue('basePath') ?? '',
              token: formRef.current?.getFieldValue('token'),
            });
          }}
        >
          {t('button.RefreshModelInformation')}
        </Button>
      </Form>
    </BAIFlex>
  );
};

export { CustomModelForm };
