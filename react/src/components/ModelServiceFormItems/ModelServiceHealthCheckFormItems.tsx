/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Checkbox, Form, Input, InputNumber, theme } from 'antd';
import type { FormInstance } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ModelServiceHealthCheckFormItemsProps {
  namePrefix: Array<string | number>;
  /**
   * Per-field placeholder text. The revision modal sources some of these
   * dynamically from the selected model definition's defaults and leaves the
   * rest blank; the preset form uses static example text on all six. Left
   * undefined, a field simply has no placeholder.
   */
  placeholders?: Partial<{
    path: string;
    interval: string;
    maxRetries: string;
    maxWaitTime: string;
    expectedStatusCode: string;
    initialDelay: string;
  }>;
}

// Shared between DeploymentAddRevisionModal.tsx (namePrefix: []) and
// AdminDeploymentPresetSettingPageContent.tsx (namePrefix: ['modelDefinition',
// 'models', 0, 'service']) — labels, tooltips, i18n keys, and `required`
// rules on all 6 detail fields were already identical (FR-3474); only
// placeholder sourcing differs per caller.
const ModelServiceHealthCheckFormItems: React.FC<
  ModelServiceHealthCheckFormItemsProps
> = ({ namePrefix, placeholders }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <>
      <Form.Item
        name={[...namePrefix, 'enableHealthCheck']}
        valuePropName="checked"
        style={{ marginTop: token.marginXS, marginBottom: 0 }}
      >
        <Checkbox>{t('modelService.EnableHealthCheck')}</Checkbox>
      </Form.Item>
      <Form.Item dependencies={[[...namePrefix, 'enableHealthCheck']]} noStyle>
        {({ getFieldValue }: FormInstance) =>
          getFieldValue([...namePrefix, 'enableHealthCheck']) ? (
            <BAIFlex direction="column" align="stretch" gap="xs">
              <Form.Item
                name={[...namePrefix, 'healthCheck', 'path']}
                label={t('adminDeploymentPreset.modelDef.HealthCheckPath')}
                tooltip={t('modelService.HealthCheckTooltip')}
                rules={[{ required: true }]}
              >
                <Input placeholder={placeholders?.path} allowClear />
              </Form.Item>
              <BAIFlex gap="md" wrap="wrap" align="end">
                <Form.Item
                  name={[...namePrefix, 'healthCheck', 'interval']}
                  label={t(
                    'adminDeploymentPreset.modelDef.HealthCheckInterval',
                  )}
                  tooltip={t('modelService.IntervalTooltip')}
                  rules={[{ required: true }]}
                  style={{ flex: 1, minWidth: 160 }}
                >
                  <InputNumber
                    min={1}
                    placeholder={placeholders?.interval}
                    suffix={t('time.Sec')}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item
                  name={[...namePrefix, 'healthCheck', 'maxRetries']}
                  label={t(
                    'adminDeploymentPreset.modelDef.HealthCheckMaxRetries',
                  )}
                  tooltip={t('modelService.MaxRetriesTooltip')}
                  rules={[{ required: true }]}
                  style={{ flex: 1, minWidth: 160 }}
                >
                  <InputNumber
                    min={1}
                    placeholder={placeholders?.maxRetries}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item
                  name={[...namePrefix, 'healthCheck', 'maxWaitTime']}
                  label={t(
                    'adminDeploymentPreset.modelDef.HealthCheckMaxWaitTime',
                  )}
                  tooltip={t('modelService.MaxWaitTimeTooltip')}
                  rules={[{ required: true }]}
                  style={{ flex: 1, minWidth: 160 }}
                >
                  <InputNumber
                    min={1}
                    placeholder={placeholders?.maxWaitTime}
                    suffix={t('time.Sec')}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </BAIFlex>
              <BAIFlex gap="md" wrap="wrap" align="end">
                <Form.Item
                  name={[...namePrefix, 'healthCheck', 'expectedStatusCode']}
                  label={t(
                    'adminDeploymentPreset.modelDef.HealthCheckExpectedStatus',
                  )}
                  tooltip={t('modelService.ExpectedStatusTooltip')}
                  rules={[{ required: true }]}
                  style={{ flex: 1, minWidth: 160 }}
                >
                  <InputNumber
                    min={101}
                    max={599}
                    placeholder={placeholders?.expectedStatusCode}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item
                  name={[...namePrefix, 'healthCheck', 'initialDelay']}
                  label={t(
                    'adminDeploymentPreset.modelDef.HealthCheckInitialDelay',
                  )}
                  tooltip={t('modelService.InitialDelayTooltip')}
                  rules={[{ required: true }]}
                  style={{ flex: 1, minWidth: 160 }}
                >
                  <InputNumber
                    min={0}
                    placeholder={placeholders?.initialDelay}
                    suffix={t('time.Sec')}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <div style={{ flex: 1, minWidth: 160 }} />
              </BAIFlex>
            </BAIFlex>
          ) : null
        }
      </Form.Item>
    </>
  );
};

export default ModelServiceHealthCheckFormItems;
