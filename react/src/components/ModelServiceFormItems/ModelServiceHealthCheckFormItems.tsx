/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import type { FormInstance } from '../../form-engine';
import { theme } from '../../theme-shim';
import {
  AstryxFormCheckbox,
  AstryxFormNumberInput,
  AstryxFormTextInput,
} from '../astryxFormControls';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ModelServiceHealthCheckFormItemsProps {
  namePrefix: Array<string | number>;
  /**
   * Per-field placeholder text. The revision modal sources some of these
   * dynamically from the selected model definition's defaults (and leaves
   * others blank); the preset form uses static example text on all of them.
   * Left undefined, a field simply has no placeholder.
   */
  placeholders?: Partial<{
    path: string;
    maxRetries: string;
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
        <AstryxFormCheckbox label={t('modelService.EnableHealthCheck')} />
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
                {/* antd `allowClear` → Astryx `hasClear`. */}
                <AstryxFormTextInput
                  label={t('adminDeploymentPreset.modelDef.HealthCheckPath')}
                  placeholder={placeholders?.path}
                  hasClear
                />
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
                  {/* antd `InputNumber suffix` → Astryx `units`. */}
                  <AstryxFormNumberInput
                    label={t(
                      'adminDeploymentPreset.modelDef.HealthCheckInterval',
                    )}
                    min={1}
                    units={t('time.Sec')}
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
                  <AstryxFormNumberInput
                    label={t(
                      'adminDeploymentPreset.modelDef.HealthCheckMaxRetries',
                    )}
                    min={1}
                    placeholder={placeholders?.maxRetries}
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
                  <AstryxFormNumberInput
                    label={t(
                      'adminDeploymentPreset.modelDef.HealthCheckMaxWaitTime',
                    )}
                    min={1}
                    units={t('time.Sec')}
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
                  <AstryxFormNumberInput
                    label={t(
                      'adminDeploymentPreset.modelDef.HealthCheckExpectedStatus',
                    )}
                    min={101}
                    max={599}
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
                  <AstryxFormNumberInput
                    label={t(
                      'adminDeploymentPreset.modelDef.HealthCheckInitialDelay',
                    )}
                    min={0}
                    placeholder={placeholders?.initialDelay}
                    units={t('time.Sec')}
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
