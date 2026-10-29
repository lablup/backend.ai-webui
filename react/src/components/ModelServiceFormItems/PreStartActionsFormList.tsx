/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIDynamicList, BAITextInput } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface PreStartActionsFormListProps {
  namePrefix: Array<string | number>;
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
  const { token } = useTheme();

  return (
    <Form.Item
      label={t('modelService.PreStartActions')}
      tooltip={t('modelService.PreStartActionsTooltip')}
      // antd's Collapse panel used to supply the section's bottom padding;
      // the flat Astryx Collapsible doesn't, so keep an explicit gap below
      // the add button before whatever section follows.
      style={{
        marginBottom: token('--spacing-5'),
        marginTop: token('--spacing-5'),
      }}
    >
      <Form.List name={[...namePrefix, 'preStartActions']}>
        {(fields, { add, remove }) => (
          <BAIDynamicList
            items={fields}
            getItemKey={(field) => field.key}
            onAdd={() => add({ action: '', args: '{}' })}
            onRemove={(field) => remove(field.name)}
            addLabel={t('adminDeploymentPreset.modelDef.AddPreStartAction')}
            columns={[
              {
                key: 'action',
                header: t('adminDeploymentPreset.modelDef.Action'),
                render: ({ key: _key, name, ...rest }, index) => (
                  <Form.Item
                    {...rest}
                    name={[name, 'action']}
                    style={{ marginBottom: 0 }}
                    rules={[
                      {
                        required: true,
                        message: t(
                          'adminDeploymentPreset.modelDef.ActionRequired',
                        ),
                      },
                    ]}
                    validateTrigger={['onChange', 'onBlur']}
                  >
                    <BAITextInput
                      aria-label={`${t('adminDeploymentPreset.modelDef.Action')} ${index + 1}`}
                      placeholder={t(
                        'adminDeploymentPreset.modelDef.ActionPlaceholder',
                      )}
                    />
                  </Form.Item>
                ),
              },
              {
                key: 'args',
                header: t('adminDeploymentPreset.modelDef.Args'),
                width: 2,
                render: ({ key: _key, name, ...rest }, index) => (
                  <Form.Item
                    {...rest}
                    name={[name, 'args']}
                    style={{ marginBottom: 0 }}
                    rules={[
                      {
                        required: true,
                        message: t(
                          'adminDeploymentPreset.modelDef.ArgsRequired',
                        ),
                      },
                      {
                        validator: async (_, v) => {
                          if (!v) return;
                          try {
                            JSON.parse(v);
                          } catch {
                            return Promise.reject(
                              t('general.InvalidJSONFormat'),
                            );
                          }
                        },
                      },
                    ]}
                    validateTrigger={['onChange', 'onBlur']}
                  >
                    <BAITextInput
                      aria-label={`${t('adminDeploymentPreset.modelDef.Args')} ${index + 1}`}
                      placeholder={t('general.Example', { value: '{}' })}
                    />
                  </Form.Item>
                ),
              },
            ]}
          />
        )}
      </Form.List>
    </Form.Item>
  );
};

export default PreStartActionsFormList;
