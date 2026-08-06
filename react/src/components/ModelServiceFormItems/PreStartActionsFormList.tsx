/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ServiceFormNamePrefix } from './types';
import { MinusCircleOutlined } from '@ant-design/icons';
import { Form, Input, theme } from 'antd';
import { BAIButton, BAIFlex } from 'backend.ai-ui';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface PreStartActionsFormListProps {
  namePrefix: ServiceFormNamePrefix;
}

// Shared between DeploymentAddRevisionModal.tsx (namePrefix: []) and
// AdminDeploymentPresetSettingPageContent.tsx (namePrefix: ['modelDefinition',
// 'models', 0, 'service']) — the two forms' rules, i18n keys, and default
// shape were already identical (FR-3474), so namePrefix is the only prop.
const PreStartActionsFormList: React.FC<PreStartActionsFormListProps> = ({
  namePrefix,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <Form.Item
      label={t('modelService.PreStartActions')}
      tooltip={t('modelService.PreStartActionsTooltip')}
      style={{ marginBottom: 0, marginTop: token.marginMD }}
    >
      <Form.List name={[...namePrefix, 'preStartActions']}>
        {(fields, { add, remove }) => (
          <BAIFlex direction="column" gap="xs" align="stretch">
            {fields.map(({ key, name, ...rest }) => (
              <BAIFlex key={key} direction="row" align="baseline" gap="xs">
                <Form.Item
                  {...rest}
                  name={[name, 'action']}
                  style={{ marginBottom: 0, flex: 1 }}
                  rules={[{ required: true, message: '' }]}
                >
                  <Input
                    placeholder={t(
                      'adminDeploymentPreset.modelDef.ActionPlaceholder',
                    )}
                  />
                </Form.Item>
                <Form.Item
                  {...rest}
                  name={[name, 'args']}
                  style={{ marginBottom: 0, flex: 2 }}
                  rules={[
                    { required: true, message: '' },
                    {
                      validator: async (_, v) => {
                        if (!v) return;
                        try {
                          JSON.parse(v);
                        } catch {
                          return Promise.reject('');
                        }
                      },
                    },
                  ]}
                >
                  <Input placeholder={t('general.Example', { value: '{}' })} />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </BAIFlex>
            ))}
            <Form.Item noStyle>
              <BAIButton
                type="dashed"
                onClick={() => add({ action: '', args: '{}' })}
                icon={<PlusIcon />}
                block
              >
                {t('adminDeploymentPreset.modelDef.AddPreStartAction')}
              </BAIButton>
            </Form.Item>
          </BAIFlex>
        )}
      </Form.List>
    </Form.Item>
  );
};

export default PreStartActionsFormList;
