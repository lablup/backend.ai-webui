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

interface HealthCheckFieldValues {
  path: string;
  interval: number;
  maxRetries: number;
  maxWaitTime: number;
  expectedStatusCode: number;
  initialDelay: number;
}

// What the manager fills in for an omitted field: `ModelHealthCheck` in
// `ai/backend/common/config.py` and `PresetModelHealthCheckInput`.
const HEALTH_CHECK_DEFAULTS: HealthCheckFieldValues = {
  path: '/health',
  interval: 10,
  maxRetries: 10,
  maxWaitTime: 15,
  expectedStatusCode: 200,
  initialDelay: 60,
};

export interface ModelServiceHealthCheckFormItemsProps {
  namePrefix: Array<string | number>;
  /** Per-field placeholders; a field left out shows the manager's default for it. */
  placeholders?: Partial<HealthCheckFieldValues>;
}

const ModelServiceHealthCheckFormItems: React.FC<
  ModelServiceHealthCheckFormItemsProps
> = ({ namePrefix, placeholders }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const placeholder = <K extends keyof HealthCheckFieldValues>(field: K) =>
    String(placeholders?.[field] ?? HEALTH_CHECK_DEFAULTS[field]);

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
              >
                {/* antd `allowClear` → Astryx `hasClear`. */}
                <AstryxFormTextInput
                  label={t('adminDeploymentPreset.modelDef.HealthCheckPath')}
                  placeholder={placeholder('path')}
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
                  style={{ flex: 1, minWidth: 160 }}
                >
                  {/* antd `InputNumber suffix` → Astryx `units`. */}
                  <AstryxFormNumberInput
                    label={t(
                      'adminDeploymentPreset.modelDef.HealthCheckInterval',
                    )}
                    min={1}
                    placeholder={placeholder('interval')}
                    units={t('time.Sec')}
                  />
                </Form.Item>
                <Form.Item
                  name={[...namePrefix, 'healthCheck', 'maxRetries']}
                  label={t(
                    'adminDeploymentPreset.modelDef.HealthCheckMaxRetries',
                  )}
                  tooltip={t('modelService.MaxRetriesTooltip')}
                  style={{ flex: 1, minWidth: 160 }}
                >
                  <AstryxFormNumberInput
                    label={t(
                      'adminDeploymentPreset.modelDef.HealthCheckMaxRetries',
                    )}
                    min={1}
                    placeholder={placeholder('maxRetries')}
                  />
                </Form.Item>
                <Form.Item
                  name={[...namePrefix, 'healthCheck', 'maxWaitTime']}
                  label={t(
                    'adminDeploymentPreset.modelDef.HealthCheckMaxWaitTime',
                  )}
                  tooltip={t('modelService.MaxWaitTimeTooltip')}
                  style={{ flex: 1, minWidth: 160 }}
                >
                  <AstryxFormNumberInput
                    label={t(
                      'adminDeploymentPreset.modelDef.HealthCheckMaxWaitTime',
                    )}
                    min={1}
                    placeholder={placeholder('maxWaitTime')}
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
                  style={{ flex: 1, minWidth: 160 }}
                >
                  {/* Backend `expected_status_code` is `gt=100`, hence 101. */}
                  <AstryxFormNumberInput
                    label={t(
                      'adminDeploymentPreset.modelDef.HealthCheckExpectedStatus',
                    )}
                    min={101}
                    max={599}
                    placeholder={placeholder('expectedStatusCode')}
                  />
                </Form.Item>
                <Form.Item
                  name={[...namePrefix, 'healthCheck', 'initialDelay']}
                  label={t(
                    'adminDeploymentPreset.modelDef.HealthCheckInitialDelay',
                  )}
                  tooltip={t('modelService.InitialDelayTooltip')}
                  style={{ flex: 1, minWidth: 160 }}
                >
                  <AstryxFormNumberInput
                    label={t(
                      'adminDeploymentPreset.modelDef.HealthCheckInitialDelay',
                    )}
                    min={0}
                    placeholder={placeholder('initialDelay')}
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
