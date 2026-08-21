/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme } from '../theme-shim';
import BAIFormItem from './BAIFormItem';
import {
  AstryxFormTagsInput,
  AstryxFormTextArea,
  AstryxFormTextInput,
} from './astryxFormControls';
import './collapsible-section.css';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

// ---------------------------------------------------------------------------
// TagsField — the shared `AstryxFormTagsInput` under the name this file's two
// call sites already use. It replaced a local Tokenizer bridge that was the
// same component minus `tokenSeparators`, which antd had on both fields
// (`tokenSeparators={[',']}`) and which the adapter restores.
// ---------------------------------------------------------------------------

const TagsField: React.FC<{
  /** Injected by `Form.Item`. */
  value?: string[];
  /** Injected by `Form.Item`. */
  onChange?: (value: string[]) => void;
  /** Accessible name (visually hidden — BAIFormItem renders the visible one). */
  label: string;
  placeholder?: string;
}> = ({ value, onChange, label, placeholder }) => {
  'use memo';
  return (
    <AstryxFormTagsInput
      label={label}
      value={value}
      onChange={onChange}
      hasClear
      tokenSeparators={[',']}
      placeholder={placeholder}
    />
  );
};

// The UI exposes only one model (index 0); the form keeps the
// `modelDefinition.models` array shape for the submit mutation.
const ModelConfigItem: React.FC<{
  listItemName: number;
  restField: object;
}> = ({ listItemName, restField }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  // Rendered only when the model-definition switch is ON. Name/path are
  // optional on PresetModelConfigInput — a user can enable the model
  // definition purely for metadata without naming a model — but the UI
  // still shows the required asterisk as a hint via the `required` prop
  // (visual only, no `rules`, so it doesn't block submission).
  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex gap="md" wrap="wrap">
        <BAIFormItem
          {...restField}
          name={[listItemName, 'name']}
          label={t('adminDeploymentPreset.modelDef.ModelName')}
          style={{ flex: 1, minWidth: 160 }}
          required
        >
          <AstryxFormTextInput
            label={t('adminDeploymentPreset.modelDef.ModelName')}
            placeholder={t(
              'adminDeploymentPreset.modelDef.ModelNamePlaceholder',
            )}
          />
        </BAIFormItem>
        <BAIFormItem
          {...restField}
          name={[listItemName, 'modelPath']}
          label={t('adminDeploymentPreset.modelDef.ModelPath')}
          style={{ flex: 2, minWidth: 200 }}
          required
        >
          <AstryxFormTextInput
            label={t('adminDeploymentPreset.modelDef.ModelPath')}
            placeholder={t(
              'adminDeploymentPreset.modelDef.ModelPathPlaceholder',
            )}
          />
        </BAIFormItem>
      </BAIFlex>

      {/* PILOT-DECISION: antd Collapse (items API) → Astryx Collapsible.
          `label`→`trigger`, `defaultActiveKey={['metadata']}`→`defaultIsOpen`;
          the single-panel accordion frame (bordered antd panel chrome) is
          replaced by Collapsible's flat default. */}
      <Collapsible
        className="bai-collapsible-section"
        trigger={t('adminDeploymentPreset.modelDef.EnableMetadata')}
        defaultIsOpen
        style={{ marginTop: token.marginSM }}
      >
        <BAIFlex direction="column" align="stretch" gap="xs">
          <BAIFlex gap="md" wrap="wrap">
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'title']}
              label={t('adminDeploymentPreset.modelDef.Title')}
              style={{ flex: 1, minWidth: 160 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Title')}
              />
            </BAIFormItem>
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'author']}
              label={t('adminDeploymentPreset.modelDef.Author')}
              style={{ flex: 1, minWidth: 160 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Author')}
              />
            </BAIFormItem>
          </BAIFlex>
          <BAIFlex gap="md" wrap="wrap">
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'version']}
              label={t('adminDeploymentPreset.modelDef.Version')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Version')}
              />
            </BAIFormItem>
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'license']}
              label={t('adminDeploymentPreset.modelDef.License')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.License')}
              />
            </BAIFormItem>
          </BAIFlex>
          <BAIFormItem
            {...restField}
            name={[listItemName, 'metadata', 'description']}
            label={t('adminDeploymentPreset.modelDef.Description')}
          >
            <AstryxFormTextArea
              label={t('adminDeploymentPreset.modelDef.Description')}
              rows={2}
            />
          </BAIFormItem>
          <BAIFlex gap="md" wrap="wrap">
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'task']}
              label={t('adminDeploymentPreset.modelDef.Task')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Task')}
              />
            </BAIFormItem>
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'category']}
              label={t('adminDeploymentPreset.modelDef.Category')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Category')}
              />
            </BAIFormItem>
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'architecture']}
              label={t('adminDeploymentPreset.modelDef.Architecture')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Architecture')}
              />
            </BAIFormItem>
          </BAIFlex>
          <BAIFlex gap="md" wrap="wrap">
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'framework']}
              label={t('adminDeploymentPreset.modelDef.Framework')}
              style={{ flex: 1, minWidth: 160 }}
            >
              <TagsField
                label={t('adminDeploymentPreset.modelDef.Framework')}
                placeholder={t(
                  'adminDeploymentPreset.modelDef.FrameworkPlaceholder',
                )}
              />
            </BAIFormItem>
            <BAIFormItem
              {...restField}
              name={[listItemName, 'metadata', 'label']}
              label={t('adminDeploymentPreset.modelDef.Label')}
              style={{ flex: 1, minWidth: 160 }}
            >
              <TagsField
                label={t('adminDeploymentPreset.modelDef.Label')}
                placeholder={t(
                  'adminDeploymentPreset.modelDef.LabelPlaceholder',
                )}
              />
            </BAIFormItem>
          </BAIFlex>
        </BAIFlex>
      </Collapsible>
    </BAIFlex>
  );
};

export default ModelConfigItem;
