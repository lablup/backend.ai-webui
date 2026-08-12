/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import { theme } from '../../theme-shim';
import { AstryxFormTextInput } from '../astryxFormControls';
import { BAIButton, BAIFlex } from 'backend.ai-ui';
import { CircleMinus, PlusIcon } from 'lucide-react';
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
  const { token } = theme.useToken();

  return (
    <Form.Item
      label={t('modelService.PreStartActions')}
      tooltip={t('modelService.PreStartActionsTooltip')}
      // antd's Collapse panel used to supply the section's bottom padding;
      // the flat Astryx Collapsible doesn't, so keep an explicit gap below
      // the add button before whatever section follows.
      style={{ marginBottom: token.marginMD, marginTop: token.marginMD }}
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
                  {/* Aria-only label; `Form.Item` renders no visible one
                      for these in-row fields. */}
                  <AstryxFormTextInput
                    label={t('adminDeploymentPreset.modelDef.Action')}
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
                  <AstryxFormTextInput
                    label={t('adminDeploymentPreset.modelDef.Args')}
                    placeholder={t('general.Example', { value: '{}' })}
                  />
                </Form.Item>
                {/* antd MinusCircleOutlined → lucide CircleMinus. */}
                <CircleMinus size="1em" onClick={() => remove(name)} />
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
