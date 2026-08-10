/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
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
// `modelDefinition.models` array shape for the submit mutation. Field names
// are absolute (`['modelDefinition', 'models', 0, ...]`) rather than
// Form.List-relative — a Form.List wrapper would auto-prefix every
// descendant Form.Item (including the absolute-path Service
// Configuration/Health Check/Pre-Start Actions passed via
// `beforeMetadataSlot`) with its own name, doubling the path.
const ModelConfigItem: React.FC<{
  /**
   * BA-7210 / FR-3481 (26.9.0+, `preset-model-config-type`): the server
   * genuinely resolves an omitted name/modelPath from the runtime variant
   * baseline / model mount destination at revision resolution, so on these
   * managers name/modelPath become truly optional. Older managers don't do
   * that resolution — omitting them there is the kind of deployment that
   * tends to fail at runtime — so the UI keeps requiring both.
   */
  supportsNullableModelDefinition: boolean;
  /**
   * FR-3481: on legacy managers, Service Configuration/Health Check/
   * Pre-Start Actions render nested here (instead of independently in
   * Step 1 — see AdminDeploymentPresetSettingPageContent.tsx) since they
   * can only be submitted together with a real name/modelPath. Rendered
   * above Metadata to match the pre-FR-3205 field order.
   */
  beforeMetadataSlot?: React.ReactNode;
}> = ({ supportsNullableModelDefinition, beforeMetadataSlot }) => {
  'use memo';
  const { t } = useTranslation();

  // Rendered only when the model-definition switch is ON; sub-fields are
  // required here unless the manager supports inheriting them (see above).
  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex gap="md" wrap="wrap">
        <BAIFormItem
          name={['modelDefinition', 'models', 0, 'name']}
          label={t('adminDeploymentPreset.modelDef.ModelName')}
          style={{ flex: 1, minWidth: 160 }}
          tooltip={
            supportsNullableModelDefinition
              ? t('adminDeploymentPreset.modelDef.ModelNameInheritTooltip')
              : undefined
          }
          required={!supportsNullableModelDefinition}
          rules={supportsNullableModelDefinition ? [] : [{ required: true }]}
        >
          <AstryxFormTextInput
            label={t('adminDeploymentPreset.modelDef.ModelName')}
            placeholder={t(
              'adminDeploymentPreset.modelDef.ModelNamePlaceholder',
            )}
          />
        </BAIFormItem>
        <BAIFormItem
          name={['modelDefinition', 'models', 0, 'modelPath']}
          label={t('adminDeploymentPreset.modelDef.ModelPath')}
          style={{ flex: 2, minWidth: 200 }}
          tooltip={
            supportsNullableModelDefinition
              ? t('adminDeploymentPreset.modelDef.ModelPathInheritTooltip')
              : undefined
          }
          required={!supportsNullableModelDefinition}
          rules={supportsNullableModelDefinition ? [] : [{ required: true }]}
        >
          <AstryxFormTextInput
            label={t('adminDeploymentPreset.modelDef.ModelPath')}
            placeholder={t(
              'adminDeploymentPreset.modelDef.ModelPathPlaceholder',
            )}
          />
        </BAIFormItem>
      </BAIFlex>

      {beforeMetadataSlot}

      {/* PILOT-DECISION: antd Collapse (items API) → Astryx Collapsible.
          `size="small"` from the antd side is dropped — Collapsible has no
          density axis (same decision as ServiceConfigurationFormItems).
          `label`→`trigger`, `defaultActiveKey={['metadata']}`→`defaultIsOpen`;
          the single-panel accordion frame (bordered antd panel chrome) is
          replaced by Collapsible's flat default. */}
      <Collapsible
        className="bai-collapsible-section"
        trigger={t('adminDeploymentPreset.modelDef.EnableMetadata')}
        defaultIsOpen
      >
        <BAIFlex direction="column" align="stretch" gap="xs">
          <BAIFlex gap="md" wrap="wrap">
            <BAIFormItem
              name={['modelDefinition', 'models', 0, 'metadata', 'title']}
              label={t('adminDeploymentPreset.modelDef.Title')}
              style={{ flex: 1, minWidth: 160 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Title')}
              />
            </BAIFormItem>
            <BAIFormItem
              name={['modelDefinition', 'models', 0, 'metadata', 'author']}
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
              name={['modelDefinition', 'models', 0, 'metadata', 'version']}
              label={t('adminDeploymentPreset.modelDef.Version')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Version')}
              />
            </BAIFormItem>
            <BAIFormItem
              name={['modelDefinition', 'models', 0, 'metadata', 'license']}
              label={t('adminDeploymentPreset.modelDef.License')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.License')}
              />
            </BAIFormItem>
          </BAIFlex>
          <BAIFormItem
            name={['modelDefinition', 'models', 0, 'metadata', 'description']}
            label={t('adminDeploymentPreset.modelDef.Description')}
          >
            <AstryxFormTextArea
              label={t('adminDeploymentPreset.modelDef.Description')}
              rows={2}
            />
          </BAIFormItem>
          <BAIFlex gap="md" wrap="wrap">
            <BAIFormItem
              name={['modelDefinition', 'models', 0, 'metadata', 'task']}
              label={t('adminDeploymentPreset.modelDef.Task')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Task')}
              />
            </BAIFormItem>
            <BAIFormItem
              name={['modelDefinition', 'models', 0, 'metadata', 'category']}
              label={t('adminDeploymentPreset.modelDef.Category')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Category')}
              />
            </BAIFormItem>
            <BAIFormItem
              name={[
                'modelDefinition',
                'models',
                0,
                'metadata',
                'architecture',
              ]}
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
              name={['modelDefinition', 'models', 0, 'metadata', 'framework']}
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
              name={['modelDefinition', 'models', 0, 'metadata', 'label']}
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
