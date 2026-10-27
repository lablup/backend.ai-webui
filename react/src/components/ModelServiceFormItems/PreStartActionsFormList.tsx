/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import { proportional } from '@lablup/ui-common/Table';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFormListInput, BAITextInput } from 'backend.ai-ui';
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
      <BAIFormListInput
        name={[...namePrefix, 'preStartActions']}
        label={t('modelService.PreStartActions')}
        isLabelHidden
        itemName={t('adminDeploymentPreset.modelDef.PreStartActionItemName')}
        createValue={() => ({ action: '', args: '{}' })}
        columns={[
          {
            key: 'action',
            header: t('adminDeploymentPreset.modelDef.Action'),
            width: proportional(1),
            formItemProps: () => ({
              validateTrigger: ['onChange', 'onBlur'],
              rules: [{ required: true, message: '' }],
            }),
            renderInput: ({ label }) => (
              <BAITextInput
                aria-label={label}
                placeholder={t(
                  'adminDeploymentPreset.modelDef.ActionPlaceholder',
                )}
              />
            ),
          },
          {
            key: 'args',
            header: t('adminDeploymentPreset.modelDef.Args'),
            width: proportional(2),
            formItemProps: () => ({
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
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
              ],
            }),
            renderInput: ({ label }) => (
              <BAITextInput
                aria-label={label}
                placeholder={t('general.Example', { value: '{}' })}
              />
            ),
          },
        ]}
      />
    </Form.Item>
  );
};

export default PreStartActionsFormList;
