/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import { useResourceGroupsForCurrentProject } from '../../hooks/useCurrentProject';
import BAIFormItem from '../BAIFormItem';
import {
  DEFAULT_RANGE,
  RANGE_LABEL_KEYS,
  RANGE_PRESETS,
  hasSetting,
} from './panelSettings';
import type { PanelDefinition, PanelSettings } from './types';
import { BAIModal, BAISelect } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SettingsFormValues {
  resourceGroup?: string | null;
  range?: string;
}

export interface PanelSettingsModalProps {
  open: boolean;
  /** The card's title, shown in the modal title. */
  title: string;
  definition: Pick<PanelDefinition, 'settings' | 'kind'>;
  settings?: PanelSettings;
  onSubmit: (settings: PanelSettings | undefined) => void;
  onRequestClose: () => void;
  afterClose?: () => void;
}

/** Edits one card's own settings (resource group, time range) in edit mode. */
const PanelSettingsModal: React.FC<PanelSettingsModalProps> = ({
  open,
  title,
  definition,
  settings,
  onSubmit,
  onRequestClose,
  afterClose,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [form] = Form.useForm<SettingsFormValues>();
  const { nonSftpResourceGroups } = useResourceGroupsForCurrentProject();
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
        const { resourceGroup, range = DEFAULT_RANGE } = form.getFieldsValue();
        const next: PanelSettings = {
          ...(hasSetting(definition, 'resourceGroup') && resourceGroup
            ? { resourceGroups: [resourceGroup] }
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
          resourceGroup: settings?.resourceGroups?.[0] ?? null,
          range: settings?.range ?? DEFAULT_RANGE,
        }}
      >
        {hasSetting(definition, 'resourceGroup') ? (
          <BAIFormItem
            name="resourceGroup"
            label={t('dashboard.settings.ResourceGroup')}
            extra={t('dashboard.settings.ResourceGroupsDescription', {
              default: resourceGroupDefault,
            })}
          >
            <BAISelect
              label={t('dashboard.settings.ResourceGroup')}
              placeholder={resourceGroupDefault}
              options={_.map(nonSftpResourceGroups, (group) => ({
                value: group.name,
                label: group.name,
              }))}
              allowClear
            />
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
