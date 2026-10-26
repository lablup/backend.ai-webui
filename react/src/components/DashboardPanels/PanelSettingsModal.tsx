/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import BAIFormItem from '../BAIFormItem';
import {
  DEFAULT_RANGE,
  RANGE_LABEL_KEYS,
  RANGE_PRESETS,
  hasSetting,
} from './panelSettings';
import type { PanelDefinition, PanelSettings } from './types';
import {
  BAIModal,
  BAIScopedResourceGroupSelect,
  BAISelect,
  type BAIScopedResourceGroupSelectProps,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

interface SettingsFormValues {
  resourceGroups?: Array<string>;
  range?: string;
}

export interface PanelSettingsModalProps {
  open: boolean;
  /** The card's title, shown in the modal title. */
  title: string;
  definition: Pick<PanelDefinition, 'settings' | 'kind'>;
  settings?: PanelSettings;
  /** The resource groups the setting offers: the page's projects, else the current domain. */
  resourceGroupScope: BAIScopedResourceGroupSelectProps['scope'];
  onSubmit: (settings: PanelSettings | undefined) => void;
  onRequestClose: () => void;
  afterClose?: () => void;
}

/** Edits one card's own settings (resource groups, time range) in edit mode. */
const PanelSettingsModal: React.FC<PanelSettingsModalProps> = ({
  open,
  title,
  definition,
  settings,
  resourceGroupScope,
  onSubmit,
  onRequestClose,
  afterClose,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [form] = Form.useForm<SettingsFormValues>();
  // A custom panel reads every resource group by default; a built-in card reads the header's.
  const resourceGroupDefault =
    definition.kind === 'preset'
      ? t('dashboard.settings.AllResourceGroups')
      : t('dashboard.settings.CurrentResourceGroup');

  return (
    <BAIModal
      open={open}
      title={t('dashboard.settings.CardSettingsOf', { name: title })}
      okText={t('button.Save')}
      onCancel={onRequestClose}
      afterClose={afterClose}
      onOk={() => {
        const { resourceGroups = [], range = DEFAULT_RANGE } =
          form.getFieldsValue();
        const next: PanelSettings = {
          ...(hasSetting(definition, 'resourceGroup') && resourceGroups.length
            ? { resourceGroups }
            : {}),
          ...(hasSetting(definition, 'range') && range !== DEFAULT_RANGE
            ? { range }
            : {}),
        };
        onSubmit(_.isEmpty(next) ? undefined : next);
        onRequestClose();
      }}
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={{
          resourceGroups: settings?.resourceGroups ?? [],
          range: settings?.range ?? DEFAULT_RANGE,
        }}
      >
        {hasSetting(definition, 'resourceGroup') ? (
          <BAIFormItem
            name="resourceGroups"
            // The selector renders its own field label.
            extra={t('dashboard.settings.ResourceGroupsDescription', {
              default: resourceGroupDefault,
            })}
          >
            <Suspense fallback={<BAISelect mode="multiple" loading disabled />}>
              <BAIScopedResourceGroupSelect
                multiple
                label={t('dashboard.settings.ResourceGroups')}
                placeholder={resourceGroupDefault}
                scope={resourceGroupScope}
                allowClear
              />
            </Suspense>
          </BAIFormItem>
        ) : null}
        {hasSetting(definition, 'range') ? (
          <BAIFormItem name="range" label={t('dashboard.settings.TimeRange')}>
            <BAISelect
              label={t('dashboard.settings.TimeRange')}
              options={RANGE_PRESETS.map((preset) => ({
                value: preset,
                label: t(RANGE_LABEL_KEYS[preset]),
              }))}
            />
          </BAIFormItem>
        ) : null}
      </Form>
    </BAIModal>
  );
};

export default PanelSettingsModal;
