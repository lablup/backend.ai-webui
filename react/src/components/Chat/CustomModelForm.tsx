/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// `Form`/`FormInstance` state engine stays (SHIM); visuals are BAIFormItem.
import { Form } from '../../form-engine';
import type { FormInstance } from '../../form-engine';
import { theme } from '../../theme-shim';
import BAIFormItem from '../BAIFormItem';
import { AstryxFormTextInput } from '../astryxFormControls';
import DeploymentTokenSelect from './DeploymentTokenSelect';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import useResizeObserver from '@react-hook/resize-observer';
import { BAIFlex } from 'backend.ai-ui';
import { RotateCw } from 'lucide-react';
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
          <Banner
            status="warning"
            title={t('chatui.NoDesiredReplicas')}
            style={{ marginBottom: themeToken.size }}
          />
        ) : null}
        <Banner
          status="warning"
          title={t('chatui.CannotFindModel')}
          style={{ marginBottom: themeToken.size }}
        />
        <BAIFormItem label={t('modelService.BasePath')} name="basePath">
          {/* PILOT-DECISION: antd `Input prefix={deploymentUrl}` showed the
              deployment's base URL as a visual continuation before the path
              input (e.g. "https://host/" + "v1"). `TextInput.startIcon` is
              icon-only (MAPPING.md §3.6); an arbitrary text-node prefix needs
              `InputGroup`, disproportionate for a decorative hint here —
              dropped (simplicity policy). The URL is still shown in the page
              header above this form. */}
          <AstryxFormTextInput
            label={t('modelService.BasePath')}
            placeholder="v1"
            disabled={loading}
          />
        </BAIFormItem>
        <BAIFormItem label={t('modelService.Token')} name="token">
          <DeploymentTokenSelect
            loading={loading}
            disabled={loading}
            deploymentId={deploymentId}
            style={{
              width: shrinkControlSize ? '100%' : '200px',
            }}
          />
        </BAIFormItem>
        <Button
          icon={<RotateCw size="1em" />}
          isLoading={loading}
          variant="secondary"
          label={t('button.RefreshModelInformation')}
          onClick={() => {
            onSubmit?.({
              basePath: formRef.current?.getFieldValue('basePath') ?? '',
              token: formRef.current?.getFieldValue('token'),
            });
          }}
        />
      </Form>
    </BAIFlex>
  );
};

export { CustomModelForm };
