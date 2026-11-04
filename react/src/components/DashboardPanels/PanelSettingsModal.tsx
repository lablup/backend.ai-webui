/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import BAIFormItem from '../BAIFormItem';
import { useDashboardResourceGroups } from './DashboardResourceGroups';
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
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense } from 'react';
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
  // The page's allowed groups, never the header's (ADR 0026).
  const resourceGroups = useDashboardResourceGroups();
  // A custom panel reads every resource group by default; a built-in card the page's default group.
  const resourceGroupDefault =
    definition.kind === 'preset'
      ? t('dashboard.settings.AllResourceGroups')
      : (resourceGroups?.defaultResourceGroup ?? undefined);
  const resourceGroupsExtra = resourceGroupDefault
    ? t('dashboard.settings.ResourceGroupsDescription', {
        default: resourceGroupDefault,
      })
    : undefined;

  return (
    <BAIModal
      open={open}
      title={t('dashboard.settings.CardSettingsOf', { name: title })}
      okText={t('button.Save')}
      onCancel={onRequestClose}
      afterClose={afterClose}
      onOk={async () => {
        const values = await form.validateFields().catch(() => undefined);
        if (!values) return;
        const { resourceGroup, range = DEFAULT_RANGE } = values;
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
          // Form.Item binds value/onChange to its direct child, so Suspense stays outside it.
          <Suspense
            fallback={
              <BAIFormItem extra={resourceGroupsExtra}>
                <BAISelect loading disabled />
              </BAIFormItem>
            }
          >
            <BAIFormItem
              name="resourceGroup"
              // The selector renders its own field label.
              extra={resourceGroupsExtra}
            >
              <BAIScopedResourceGroupSelect
                label={t('dashboard.settings.ResourceGroup')}
                placeholder={resourceGroupDefault}
                scope={resourceGroups?.scope ?? { project: [] }}
                filter={resourceGroups?.filter}
                allowClear
              />
            </BAIFormItem>
          </Suspense>
        ) : null}
        {hasSetting(definition, 'range') ? (
          <BAIFormItem
            name="range"
            label={t('dashboard.settings.TimeRange')}
            rules={[{ required: true }]}
          >
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
