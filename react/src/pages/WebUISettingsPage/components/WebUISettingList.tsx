/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../../../app-shim';
import AnnouncementEditModal from '../../../components/AnnouncementEditModal';
import type { SettingItemProps } from '../../../components/SettingItem';
import SettingList, {
  type SettingGroup,
} from '../../../components/SettingList';
import { getDefaultLoginConfig } from '../../../helper/loginConfig';
import {
  buildWebUISettingsDocument,
  isValidWebUISetting,
  readWebUISettingFromState,
  WEBUI_SETTING_DEFINITIONS,
  WEBUI_SETTING_GROUPS,
  WEBUI_SETTINGS_CONFIG_KEY,
  type WebUISettingDefinition,
  type WebUISettingsDocument,
  ownedWebUISettings,
  withForeignWebUISettings,
  WEBUI_SETTINGS_DEFAULT_TAB,
} from '../../../helper/webuiSettings';
import { useCurrentDomainValue } from '../../../hooks';
import {
  useUpdateDomainAppConfig,
  useUpdatePublicDomainAppConfig,
} from '../../../hooks/useAppConfig';
import MenuKeySelector from './MenuKeySelector';
import PluginPathInput from './PluginPathInput';
import { useWebUISettingLabels } from './WebUISettingLabels';
import { Button } from '@lablup/ui-common/Button';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIAlert,
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFlex,
  BAIMultiSelector,
  BAIModal,
  BAINumberInput,
  BAIUncontrolledInput,
  useErrorMessageResolver,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleAlert, Redo2, SquarePenIcon } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router-dom';

interface WebUISettingListProps {
  /** The saved `domainConfig.settings` document, if any. */
  savedDomainSettings?: WebUISettingsDocument;
  /** The saved `publicConfigByDomain.<domain>.settings` document, if any. */
  savedPublicSettings?: WebUISettingsDocument;
}

// One width for every editable row; the plugin path rows keep their wider
// root + path pair (PluginPathInput).
const CONTROL_WIDTH = 240;

const MENU_KEY_SETTINGS: ReadonlySet<string> = new Set([
  'menuBlocklist',
  'menuInactivelist',
]);

const parseStringList = (raw: string): Array<string> =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Edits the flat `settings` app-config document (#10436). Each row's default
 * is the code default (`getDefaultLoginConfig`); only rows that differ from it
 * are saved, so an untouched row keeps following the default. Apply writes both scopes and
 * reloads, which is how the overrides reach `backendaiclient._config`.
 */
const WebUISettingList: React.FC<WebUISettingListProps> = ({
  savedDomainSettings,
  savedPublicSettings,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const labels = useWebUISettingLabels();
  const updateDomainAppConfig = useUpdateDomainAppConfig();
  const updatePublicDomainAppConfig = useUpdatePublicDomainAppConfig();

  const baseState = getDefaultLoginConfig();
  // Only the keys a definition owns: the announcement beside them is saved by
  // its own modal and must not make the page dirty.
  const saved: WebUISettingsDocument = ownedWebUISettings({
    ...savedPublicSettings,
    ...savedDomainSettings,
  });
  const [draft, setDraft] = useState<WebUISettingsDocument>(saved);
  const isDirty = !_.isEqual(draft, saved);

  const defaultValueOf = (definition: WebUISettingDefinition) =>
    readWebUISettingFromState(baseState, definition);
  const valueOf = (definition: WebUISettingDefinition) =>
    definition.key in draft &&
    isValidWebUISetting(definition, draft[definition.key])
      ? draft[definition.key]
      : defaultValueOf(definition);
  const setValue = (definition: WebUISettingDefinition, value: unknown) => {
    setDraft((prev) => {
      const next = { ...prev };
      // Only a clear or a row reset drops the key; a typed default is saved.
      if (value === undefined) {
        delete next[definition.key];
      } else {
        next[definition.key] = value;
      }
      return next;
    });
  };

  // Set before the post-Apply reload so neither guard asks to confirm it.
  const isLeavingAfterApplyRef = useRef(false);
  // A `?tab=` switch unmounts the draft too; other query changes (the
  // user-settings modal, a palette deep link) keep it mounted.
  const tabOf = (search: string) =>
    new URLSearchParams(search).get('tab') ?? WEBUI_SETTINGS_DEFAULT_TAB;
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty &&
      (currentLocation.pathname !== nextLocation.pathname ||
        tabOf(currentLocation.search) !== tabOf(nextLocation.search)),
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
  const changedTitles = (
    next: WebUISettingsDocument,
    scope: WebUISettingDefinition['scope'],
  ) =>
    WEBUI_SETTING_DEFINITIONS.filter(
      (definition) =>
        definition.scope === scope &&
        !_.isEqual(next[definition.key], saved[definition.key]),
    ).map((definition) => labels.items[definition.key].title);

  const persist = async (next: WebUISettingsDocument) => {
    setIsApplying(true);
    let isDomainSaved = false;
    try {
      await updateDomainAppConfig(
        WEBUI_SETTINGS_CONFIG_KEY,
        (current: unknown) =>
          withForeignWebUISettings(
            current,
            buildWebUISettingsDocument('domain', next),
          ),
      );
      isDomainSaved = true;
      await updatePublicDomainAppConfig(
        WEBUI_SETTINGS_CONFIG_KEY,
        (current: unknown) =>
          withForeignWebUISettings(
            current,
            buildWebUISettingsDocument('public', next),
          ),
      );
      isLeavingAfterApplyRef.current = true;
      window.location.reload();
    } catch (error) {
      setIsApplying(false);
      // The domain write lands first, so a public failure leaves a partial save.
      const notApplied = [
        ...(isDomainSaved ? [] : changedTitles(next, 'domain')),
        ...changedTitles(next, 'public'),
      ];
      modal.error({
        title: isDomainSaved
          ? t('webuiSettings.PartiallyApplied')
          : t('webuiSettings.NotApplied'),
        content: (
          <BAIFlex direction="column" align="stretch" gap="xs">
            <Text>{getErrorMessage(error)}</Text>
            {notApplied.length > 0 && (
              <>
                <Text>{t('webuiSettings.NotAppliedItems')}</Text>
                <BAIFlex direction="column" align="start" gap="xxs">
                  {notApplied.map((title) => (
                    <Text key={title} weight="semibold">
                      {title}
                    </Text>
                  ))}
                </BAIFlex>
              </>
            )}
            {isDomainSaved && (
              <Text>{t('webuiSettings.PartiallyAppliedDesc')}</Text>
            )}
          </BAIFlex>
        ),
      });
    }
  };
  const applySettings = () => persist(draft);
  // Reset-all deletes the saved documents (irreversible), so it is confirmed
  // by a typed word; a per-row reset only edits the draft and needs Apply.
  const domainName = useCurrentDomainValue();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const toSettingItem = (
    definition: WebUISettingDefinition,
  ): SettingItemProps => {
    const label = labels.items[definition.key];
    const current = valueOf(definition);
    const rowDefault = defaultValueOf(definition);
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
          defaultValue: rowDefault as boolean,
          value: current as boolean,
          onChange: (value) => setValue(definition, value),
        };
      case 'number':
        return {
          ...base,
          type: 'custom',
          defaultValue: rowDefault,
          value: current,
          children: (
            // An unset setting shows its default as the placeholder, so the
            // clear button empties the field instead of refilling the default.
            <BAINumberInput
              aria-label={label.title}
              width={CONTROL_WIDTH}
              value={definition.key in draft ? (current as number) : null}
              placeholder={String(fileValue ?? '')}
              min={definition.min}
              max={definition.max}
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
          defaultValue: rowDefault,
          value: current,
          children:
            definition.key === 'pluginLogin' ? (
              <PluginPathInput
                label={label.title}
                data-testid={`webui-setting-${definition.key}-input`}
                value={String(current ?? '')}
                onChange={(path) => setValue(definition, path)}
              />
            ) : (
              <BAIUncontrolledInput
                key={String(current)}
                label={label.title}
                isLabelHidden
                data-testid={`webui-setting-${definition.key}-input`}
                defaultValue={String(current ?? '')}
                onCommit={(raw) => setValue(definition, raw.trim())}
                width={CONTROL_WIDTH}
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
          defaultValue: rowDefault,
          value: _.isEqual(current, rowDefault) ? rowDefault : current,
          children: definition.options ? (
            <BAIMultiSelector
              aria-label={label.title}
              width={CONTROL_WIDTH}
              options={definition.options.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              value={list}
              onChange={(values) => setValue(definition, values)}
            />
          ) : MENU_KEY_SETTINGS.has(definition.key) ? (
            <MenuKeySelector
              aria-label={label.title}
              data-testid={`webui-setting-${definition.key}-input`}
              width={CONTROL_WIDTH}
              value={list}
              onChange={(keys) => setValue(definition, keys)}
            />
          ) : definition.key === 'pluginPage' ? (
            <PluginPathInput
              multiple
              label={label.title}
              data-testid={`webui-setting-${definition.key}-input`}
              value={list}
              onChange={(paths) => setValue(definition, paths)}
            />
          ) : (
            <BAIUncontrolledInput
              key={joined}
              label={label.title}
              isLabelHidden
              data-testid={`webui-setting-${definition.key}-input`}
              defaultValue={joined}
              onCommit={(raw) => setValue(definition, parseStringList(raw))}
              width={CONTROL_WIDTH}
            />
          ),
        };
      }
    }
  };

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  // The announcement is edited through its own modal and saved on its own,
  // so its row takes no part in the draft (#10713).
  const announcementGroup: Array<SettingGroup> = [
    {
      'data-testid': 'webui-settings-group-announcement',
      title: t('maintenance.Announcement'),
      settingItems: [
        {
          'data-testid': 'system-announcement',
          type: 'custom',
          title: t('maintenance.SystemAnnouncement'),
          description: t('maintenance.DescSystemAnnouncement'),
          children: (
            <Button
              icon={<SquarePenIcon size="1em" />}
              onClick={() => setIsAnnouncementModalOpen(true)}
              label={t('summary.EditAnnouncement')}
            />
          ),
          showResetButton: false,
        },
      ],
    },
  ];

  const settingGroups: Array<SettingGroup> = WEBUI_SETTING_GROUPS.flatMap(
    (group) => {
      const definitions = WEBUI_SETTING_DEFINITIONS.filter(
        (definition) => definition.group === group,
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
        settingGroups={[...settingGroups, ...announcementGroup]}
        showSearchBar
        showChangedOptionFilter
        extraButton={
          <BAIButton
            danger
            icon={<Redo2 size="1em" />}
            onClick={() => setIsResetConfirmOpen(true)}
          >
            {t('button.Reset')}
          </BAIButton>
        }
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
      <BAIDeleteConfirmModal
        open={isResetConfirmOpen}
        title={t('webuiSettings.ResetAllSettings')}
        description={t('webuiSettings.ResetAllSettingsDesc', {
          domain: domainName,
        })}
        items={[{ key: domainName, label: domainName }]}
        requireConfirmInput
        confirmText={t('button.Reset')}
        okText={t('button.Reset')}
        confirmLoading={isApplying}
        onOk={() => persist({})}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
      <BAIUnmountAfterClose>
        <AnnouncementEditModal
          open={isAnnouncementModalOpen}
          onRequestClose={() => setIsAnnouncementModalOpen(false)}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default WebUISettingList;
