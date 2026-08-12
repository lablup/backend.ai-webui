/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import BAIFormItem from './BAIFormItem';
import ModelServiceHealthCheckFormItems from './ModelServiceFormItems/ModelServiceHealthCheckFormItems';
import PreStartActionsFormList from './ModelServiceFormItems/PreStartActionsFormList';
import ServiceConfigurationFormItems from './ModelServiceFormItems/ServiceConfigurationFormItems';
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
// are absolute (`['modelDefinition', 'models', 0, ...]`, via `modelField()`
// below) rather than Form.List-relative — a Form.List wrapper would
// auto-prefix every descendant Form.Item (including the absolute-path
// Service Configuration/Health Check/Pre-Start Actions rendered below) with
// its own name, doubling the path.
const modelField = (...path: Array<string | number>) => [
  'modelDefinition',
  'models',
  0,
  ...path,
];

const ModelConfigItem: React.FC<{
  /**
   * FR-3481: whether the selected runtime variant reads vfolder config
   * files (custom) — gates whether Service Configuration (Command/Port) is
   * relevant for this variant at all. Not a manager-capability check (see
   * `supportsNullableModelDefinition` below, determined internally), so this
   * stays a prop: it's runtime-variant data the parent already computed
   * once (from the selected `runtimeVariantId` + the `runtimeVariants`
   * list) to avoid re-deriving it here.
   */
  readsVfolderConfigFiles: boolean;
}> = ({ readsVfolderConfigFiles }) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  /**
   * BA-7210 / FR-3481 (26.9.0+, `preset-model-config-type`): legacy managers
   * (without the capability) can only submit Service Configuration/Health
   * Check/Pre-Start Actions together with a real name/modelPath, so those
   * sections nest here (instead of independently in Step 1 — see
   * AdminDeploymentPresetSettingPageContent.tsx), rendered above Metadata to
   * match the pre-FR-3205 field order.
   */
  const supportsNullableModelDefinition = baiClient.supports(
    'preset-model-config-type',
  );

  // Rendered only when the model-definition switch is ON. Name/path are
  // nullable server-side on 26.9.0+ (BA-7210 inherits them from the runtime
  // variant baseline), but the FE requires both on every manager anyway —
  // a deliberate UI-only tightening: enabling the model definition without
  // naming a model is the kind of deployment that tends to fail at runtime,
  // so the form blocks it up front rather than letting it reach the server.
  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex gap="md" wrap="wrap">
        <BAIFormItem
          name={modelField('name')}
          label={t('adminDeploymentPreset.modelDef.ModelName')}
          style={{ flex: 1, minWidth: 160 }}
          required
          rules={[{ required: true }]}
        >
          <AstryxFormTextInput
            label={t('adminDeploymentPreset.modelDef.ModelName')}
            placeholder={t(
              'adminDeploymentPreset.modelDef.ModelNamePlaceholder',
            )}
          />
        </BAIFormItem>
        <BAIFormItem
          name={modelField('modelPath')}
          label={t('adminDeploymentPreset.modelDef.ModelPath')}
          style={{ flex: 2, minWidth: 200 }}
          required
          rules={[{ required: true }]}
        >
          <AstryxFormTextInput
            label={t('adminDeploymentPreset.modelDef.ModelPath')}
            placeholder={t(
              'adminDeploymentPreset.modelDef.ModelPathPlaceholder',
            )}
          />
        </BAIFormItem>
      </BAIFlex>

      {!supportsNullableModelDefinition && (
        <>
          {readsVfolderConfigFiles && (
            <ServiceConfigurationFormItems
              namePrefix={modelField('service')}
              placeholders={{
                command: t(
                  'adminDeploymentPreset.modelDef.StartCommandPlaceholder',
                ),
                port: t('general.Example', { value: '8080' }),
              }}
            />
          )}
          <ModelServiceHealthCheckFormItems
            namePrefix={modelField('service')}
            placeholders={{
              path: t('general.Example', { value: '/health' }),
              interval: t('general.Example', { value: '10' }),
              maxRetries: t('general.Example', { value: '10' }),
              maxWaitTime: t('general.Example', { value: '15' }),
              expectedStatusCode: t('general.Example', { value: '200' }),
              initialDelay: t('general.Example', { value: '60' }),
            }}
          />
          <PreStartActionsFormList namePrefix={modelField('service')} />
        </>
      )}

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
              name={modelField('metadata', 'title')}
              label={t('adminDeploymentPreset.modelDef.Title')}
              style={{ flex: 1, minWidth: 160 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Title')}
              />
            </BAIFormItem>
            <BAIFormItem
              name={modelField('metadata', 'author')}
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
              name={modelField('metadata', 'version')}
              label={t('adminDeploymentPreset.modelDef.Version')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Version')}
              />
            </BAIFormItem>
            <BAIFormItem
              name={modelField('metadata', 'license')}
              label={t('adminDeploymentPreset.modelDef.License')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.License')}
              />
            </BAIFormItem>
          </BAIFlex>
          <BAIFormItem
            name={modelField('metadata', 'description')}
            label={t('adminDeploymentPreset.modelDef.Description')}
          >
            <AstryxFormTextArea
              label={t('adminDeploymentPreset.modelDef.Description')}
              rows={2}
            />
          </BAIFormItem>
          <BAIFlex gap="md" wrap="wrap">
            <BAIFormItem
              name={modelField('metadata', 'task')}
              label={t('adminDeploymentPreset.modelDef.Task')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Task')}
              />
            </BAIFormItem>
            <BAIFormItem
              name={modelField('metadata', 'category')}
              label={t('adminDeploymentPreset.modelDef.Category')}
              style={{ flex: 1, minWidth: 120 }}
            >
              <AstryxFormTextInput
                label={t('adminDeploymentPreset.modelDef.Category')}
              />
            </BAIFormItem>
            <BAIFormItem
              name={modelField('metadata', 'architecture')}
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
              name={modelField('metadata', 'framework')}
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
              name={modelField('metadata', 'label')}
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
