/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { refreshConfigFromToml } from '../helper/loginConfig';
import {
  buildWebUISettingsDocument,
  isValidWebUISettingValue,
  readWebUISettingFromState,
  WEBUI_SETTING_DEFINITIONS,
  WEBUI_SETTING_GROUPS,
  WEBUI_SETTINGS_CONFIG_KEY,
  type WebUISettingDefinition,
  type WebUISettingsDocument,
} from '../helper/webuiSettings';
import {
  useUpdateDomainAppConfig,
  useUpdatePublicDomainAppConfig,
} from '../hooks/useAppConfig';
import { useRawConfig } from '../hooks/useWebUIConfig';
import PluginPathListInput from './PluginPathListInput';
import type { SettingItemProps } from './SettingItem';
import SettingList, { type SettingGroup } from './SettingList';
import { useWebUISettingLabels } from './WebUISettingLabels';
import { Button } from '@lablup/ui-common/Button';
import {
  BAIAlert,
  BAIFlex,
  BAIMultiSelector,
  BAIModal,
  BAINumberInput,
  BAIUncontrolledInput,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleAlert } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router-dom';

interface WebUISettingListProps {
  /** The saved `domainConfig.settings` document, if any. */
  savedDomainSettings?: WebUISettingsDocument;
  /** The saved `publicConfigByDomain.<domain>.settings` document, if any. */
  savedPublicSettings?: WebUISettingsDocument;
  /** Superadmins also edit the public (pre-login) keys. */
  canEditPublic: boolean;
}

const parseStringList = (raw: string): Array<string> =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Edits the flat `settings` app-config document (#10436). Each row's default
 * is the `config.toml` value; only rows that differ from it are saved, so an
 * untouched row keeps following the file. Apply writes both scopes and
 * reloads, which is how the overrides reach `backendaiclient._config`.
 */
const WebUISettingList: React.FC<WebUISettingListProps> = ({
  savedDomainSettings,
  savedPublicSettings,
  canEditPublic,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const labels = useWebUISettingLabels();
  const rawConfig = useRawConfig();
  const updateDomainAppConfig = useUpdateDomainAppConfig();
  const updatePublicDomainAppConfig = useUpdatePublicDomainAppConfig();

  const fileState = refreshConfigFromToml(rawConfig);
  const saved: WebUISettingsDocument = {
    ...(canEditPublic ? savedPublicSettings : undefined),
    ...savedDomainSettings,
  };
  const [draft, setDraft] = useState<WebUISettingsDocument>(saved);
  const isDirty = !_.isEqual(draft, saved);

  const fileValueOf = (definition: WebUISettingDefinition) =>
    readWebUISettingFromState(fileState, definition);
  const valueOf = (definition: WebUISettingDefinition) =>
    definition.key in draft &&
    isValidWebUISettingValue(definition.type, draft[definition.key])
      ? draft[definition.key]
      : fileValueOf(definition);
  const setValue = (definition: WebUISettingDefinition, value: unknown) => {
    setDraft((prev) => {
      const next = { ...prev };
      if (value === undefined || _.isEqual(value, fileValueOf(definition))) {
        delete next[definition.key];
      } else {
        next[definition.key] = value;
      }
      return next;
    });
  };

  // Set before the post-Apply reload so neither guard asks to confirm it.
  const isLeavingAfterApplyRef = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );
  const confirmLeave = useEffectEvent(() => {
    modal.confirm({
      title: t('webuiSettings.LeaveWithoutApplying'),
      content: t('webuiSettings.LeaveWithoutApplyingDesc'),
      okText: t('button.Discard'),
      okButtonProps: { danger: true },
      cancelText: t('button.Cancel'),
      onOk: () => blocker.proceed?.(),
      onCancel: () => blocker.reset?.(),
    });
  });
  useEffect(() => {
    if (blocker.state === 'blocked') {
      confirmLeave();
    }
  }, [blocker.state]);
  const shouldConfirmUnload = useEffectEvent(
    () => isDirty && !isLeavingAfterApplyRef.current,
  );
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldConfirmUnload()) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const [isApplyConfirmOpen, setIsApplyConfirmOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Writes both scopes from `next` and reloads; the reloaded page runs the
  // merge again, which is the feedback.
  const persist = async (next: WebUISettingsDocument) => {
    setIsApplying(true);
    try {
      await updateDomainAppConfig(
        WEBUI_SETTINGS_CONFIG_KEY,
        buildWebUISettingsDocument('domain', next, fileState),
      );
      if (canEditPublic) {
        await updatePublicDomainAppConfig(
          WEBUI_SETTINGS_CONFIG_KEY,
          buildWebUISettingsDocument('public', next, fileState),
        );
      }
      isLeavingAfterApplyRef.current = true;
      window.location.reload();
    } catch (error) {
      message.error(getErrorMessage(error));
      setIsApplying(false);
    }
  };
  const applySettings = () => persist(draft);
  // Reset-all is already confirmed by SettingList's modal, so it applies at
  // once; a per-row reset only edits the draft and still needs Apply.
  const resetAll = () => persist({});

  const toSettingItem = (
    definition: WebUISettingDefinition,
  ): SettingItemProps => {
    const label = labels.items[definition.key];
    const current = valueOf(definition);
    const fileValue = fileValueOf(definition);
    const base = {
      'data-testid': `webui-setting-${definition.key}`,
      title: label.title,
      description: label.description,
      onReset: () => setValue(definition, undefined),
    };
    switch (definition.type) {
      case 'boolean':
        return {
          ...base,
          type: 'checkbox',
          defaultValue: fileValue as boolean,
          value: current as boolean,
          onChange: (value) => setValue(definition, value),
        };
      case 'number':
        return {
          ...base,
          type: 'custom',
          defaultValue: fileValue,
          value: current,
          children: (
            <BAINumberInput
              aria-label={label.title}
              width={240}
              value={current as number}
              units={definition.unit}
              onChange={(value) =>
                setValue(definition, value === null ? undefined : value)
              }
            />
          ),
        };
      case 'string':
        return {
          ...base,
          type: 'custom',
          defaultValue: fileValue,
          value: current,
          children: (
            <BAIUncontrolledInput
              key={String(current)}
              defaultValue={String(current ?? '')}
              onCommit={(raw) => setValue(definition, raw.trim())}
              style={{ maxWidth: 480 }}
            />
          ),
        };
      case 'stringList': {
        const list = current as Array<string>;
        const joined = list.join(', ');
        return {
          ...base,
          type: 'custom',
          // Same reference when equal so the "changed" dot stays off.
          defaultValue: fileValue,
          value: _.isEqual(current, fileValue) ? fileValue : current,
          children: definition.options ? (
            <BAIMultiSelector
              aria-label={label.title}
              width={320}
              options={definition.options.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              value={list}
              onChange={(values) => setValue(definition, values)}
            />
          ) : definition.key === 'pluginPage' ? (
            <PluginPathListInput
              value={list}
              onChange={(paths) => setValue(definition, paths)}
            />
          ) : (
            <BAIUncontrolledInput
              key={joined}
              defaultValue={joined}
              onCommit={(raw) => setValue(definition, parseStringList(raw))}
              style={{ maxWidth: 480 }}
            />
          ),
        };
      }
    }
  };

  const settingGroups: Array<SettingGroup> = WEBUI_SETTING_GROUPS.flatMap(
    (group) => {
      const definitions = WEBUI_SETTING_DEFINITIONS.filter(
        (definition) =>
          definition.group === group &&
          (canEditPublic || definition.scope !== 'public'),
      );
      if (definitions.length === 0) return [];
      return [
        {
          'data-testid': `webui-settings-group-${group}`,
          title: labels.groups[group],
          settingItems: definitions.map(toSettingItem),
        },
      ];
    },
  );

  return (
    <>
      <SettingList
        settingGroups={settingGroups}
        showSearchBar
        showChangedOptionFilter
        showResetButton
        onReset={resetAll}
        primaryButton={
          <Button
            variant="primary"
            label={t('webuiSettings.Apply')}
            isDisabled={!isDirty}
            onClick={() => setIsApplyConfirmOpen(true)}
          />
        }
      />
      <BAIModal
        open={isApplyConfirmOpen}
        title={
          <BAIFlex gap="xxs" align="center">
            <CircleAlert size="1em" color="var(--color-warning)" />
            {t('webuiSettings.ApplySettings')}
          </BAIFlex>
        }
        okText={t('webuiSettings.Apply')}
        cancelText={t('button.Cancel')}
        confirmLoading={isApplying}
        maskClosable={false}
        onOk={applySettings}
        onCancel={() => setIsApplyConfirmOpen(false)}
      >
        <BAIAlert
          type="warning"
          showIcon
          title={t('webuiSettings.ApplySettingsDesc')}
        />
      </BAIModal>
    </>
  );
};

export default WebUISettingList;
