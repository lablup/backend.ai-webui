/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../../../app-shim';
import AnnouncementEditModal from '../../../components/AnnouncementEditModal';
import { useCurrentLanguage } from '../../../components/DefaultProviders';
import type { SettingItemProps } from '../../../components/SettingItem';
import SettingList, {
  type SettingGroup,
} from '../../../components/SettingList';
import { getDefaultLoginConfig } from '../../../helper/loginConfig';
import {
  buildWebUISettingsDocument,
  isValidWebUISetting,
  pickWebUISettingsOfScope,
  readWebUISettingFromState,
  WEBUI_SETTING_DEFINITIONS,
  WEBUI_SETTING_GROUPS,
  type WebUISettingDefinition,
  type WebUISettingScope,
  type WebUISettingsDocument,
  ownedWebUISettings,
  withForeignWebUISettings,
} from '../../../helper/webuiSettings';
import { useCurrentDomainValue } from '../../../hooks';
import type { AppConfigUpdate } from '../../../hooks/useAppConfig';
import { buildHostedManualBaseURL } from '../../../hooks/useHelpURL';
import { setEffectiveWebUISettings } from '../../../hooks/useWebUIConfig';
import MenuKeySelector from './MenuKeySelector';
import PluginPathInput from './PluginPathInput';
import SettingsJsonModal from './SettingsJsonModal';
import { useWebUISettingLabels } from './WebUISettingLabels';
import WebUISettingNumberInput from './WebUISettingNumberInput';
import WebUISettingSizeInput from './WebUISettingSizeInput';
import { Button } from '@lablup/ui-common/Button';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIAlert,
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFlex,
  BAIMultiSelector,
  BAIUncontrolledInput,
  useErrorMessageResolver,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import { atom, useAtomValue, useStore } from 'jotai';
import * as _ from 'lodash-es';
import { Braces, Redo2, SquarePenIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WebUISettingListProps {
  /** The saved `domainConfig.settings` document, if any. */
  savedDomainSettings?: WebUISettingsDocument;
  /** The saved `publicConfigByDomain.<domain>.settings` document, if any. */
  savedPublicSettings?: WebUISettingsDocument;
  setDomainSettings: (update: AppConfigUpdate) => Promise<void>;
  setPublicSettings: (update: AppConfigUpdate) => Promise<void>;
}

// One width for every editable row; the plugin path rows keep their wider
// root + path pair (PluginPathInput).
const CONTROL_WIDTH = 240;

const MENU_KEY_SETTINGS: ReadonlySet<string> = new Set([
  'menuBlocklist',
  'menuInactivelist',
]);

const SCOPES: ReadonlyArray<WebUISettingScope> = ['domain', 'public'];

type WriteState = { running: boolean; rerun: boolean; force: boolean };

// One owner per Jotai store for the values being saved and the per-scope write
// queue, so a remount (a tab switch) joins the writes in flight instead of
// starting a second queue from documents the writes have not updated yet.
interface SettingsSession {
  confirmed: WebUISettingsDocument;
  writes: Record<WebUISettingScope, WriteState>;
  // Registered for the session's life, not the list's: writes outlive an unmount.
  onBeforeUnload: (e: BeforeUnloadEvent) => void;
}
const sessions = new WeakMap<ReturnType<typeof useStore>, SettingsSession>();
// The values the rows show while a session lives; `null` means the saved documents.
const sessionValuesAtom = atom<WebUISettingsDocument | null>(null);

const shownValueOf = (
  doc: WebUISettingsDocument,
  definition: WebUISettingDefinition,
) =>
  definition.key in doc && isValidWebUISetting(definition, doc[definition.key])
    ? doc[definition.key]
    : readWebUISettingFromState(getDefaultLoginConfig(), definition);

const parseStringList = (raw: string): Array<string> =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Edits the flat `settings` app-config document (#10436). Each row's default
 * is the code default (`getDefaultLoginConfig`); only rows that differ from it
 * are saved, so an untouched row keeps following the default. A change shows
 * at once (row and `loginConfigState`) and is written in the background;
 * a failed write rolls it back (#10941).
 */
const WebUISettingList: React.FC<WebUISettingListProps> = ({
  savedDomainSettings,
  savedPublicSettings,
  setDomainSettings,
  setPublicSettings,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { modal, message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const labels = useWebUISettingLabels();
  const [lang] = useCurrentLanguage();
  // Shown in the unset User manual URL field: the address help opens by default.
  const hostedManualBaseURL = buildHostedManualBaseURL(
    globalThis.packageVersion ?? '',
    lang,
  );
  const store = useStore();

  const baseState = getDefaultLoginConfig();
  // Only the keys a definition owns, each from its own scope's document: the
  // announcement beside them is saved by its own modal.
  const saved: WebUISettingsDocument = {
    ...pickWebUISettingsOfScope(
      ownedWebUISettings({ ...savedPublicSettings }),
      'public',
    ),
    ...pickWebUISettingsOfScope(
      ownedWebUISettings({ ...savedDomainSettings }),
      'domain',
    ),
  };
  const sessionValues = useAtomValue(sessionValuesAtom);
  const values = sessionValues ?? saved;

  // Read by the background writes, which outlive the render that started them.
  const currentValues = () => store.get(sessionValuesAtom) ?? saved;
  const sessionOf = (): SettingsSession => {
    const existing = sessions.get(store);
    if (existing) return existing;
    const created: SettingsSession = {
      confirmed: saved,
      writes: {
        domain: { running: false, rerun: false, force: false },
        public: { running: false, rerun: false, force: false },
      },
      onBeforeUnload: (e) => {
        if (SCOPES.some((scope) => created.writes[scope].running)) {
          e.preventDefault();
        }
      },
    };
    sessions.set(store, created);
    window.addEventListener('beforeunload', created.onBeforeUnload);
    return created;
  };

  const defaultValueOf = (definition: WebUISettingDefinition) =>
    readWebUISettingFromState(baseState, definition);
  const valueOf = (definition: WebUISettingDefinition) =>
    shownValueOf(values, definition);

  const show = (next: WebUISettingsDocument) => {
    store.set(sessionValuesAtom, next);
    setEffectiveWebUISettings(
      store,
      buildWebUISettingsDocument('public', next),
      buildWebUISettingsDocument('domain', next),
    );
  };

  const writeScope = (
    scope: WebUISettingScope,
    doc: WebUISettingsDocument | undefined,
  ) =>
    (scope === 'domain' ? setDomainSettings : setPublicSettings)(
      (current: unknown) => withForeignWebUISettings(current, doc),
    );

  // Puts back the confirmed value of each key the failed write carried, unless
  // the row has been changed again since.
  const rollBack = (
    session: SettingsSession,
    scope: WebUISettingScope,
    attempt: WebUISettingsDocument,
    error: unknown,
  ) => {
    const confirmed = session.confirmed;
    const failed = WEBUI_SETTING_DEFINITIONS.filter(
      (definition) =>
        definition.scope === scope &&
        !_.isEqual(attempt[definition.key], confirmed[definition.key]),
    );
    const next = { ...currentValues() };
    const reverted = failed.filter(({ key }) =>
      _.isEqual(next[key], attempt[key]),
    );
    for (const { key } of reverted) {
      if (key in confirmed) {
        next[key] = confirmed[key];
      } else {
        delete next[key];
      }
    }
    show(next);
    if (
      !_.isEqual(
        buildWebUISettingsDocument(scope, next),
        buildWebUISettingsDocument(scope, confirmed),
      )
    ) {
      session.writes[scope].rerun = true;
    }
    // A key changed again meanwhile is retried, not reverted, so it is not listed.
    // A forced write (Reset) can fail with nothing to revert; it still reports.
    if (reverted.length === 0 && failed.length > 0) return;
    modal.error({
      title: t('webuiSettings.NotSaved'),
      content: (
        <BAIFlex direction="column" align="stretch" gap="xs">
          <Text>{getErrorMessage(error)}</Text>
          {reverted.length > 0 && (
            <>
              <Text>{t('webuiSettings.NotSavedItems')}</Text>
              <BAIFlex direction="column" align="start" gap="xxs">
                {reverted.map((definition) => (
                  <Text key={definition.key} weight="semibold">
                    {labels.items[definition.key].title}
                  </Text>
                ))}
              </BAIFlex>
            </>
          )}
        </BAIFlex>
      ),
    });
  };

  // The session ends once nothing is in flight; the upsert responses have
  // updated the saved documents, so the rows follow them again.
  const endSessionIfIdle = (session: SettingsSession) => {
    if (SCOPES.some((scope) => session.writes[scope].running)) return;
    window.removeEventListener('beforeunload', session.onBeforeUnload);
    sessions.delete(store);
    store.set(sessionValuesAtom, null);
  };

  const flush = async (scope: WebUISettingScope) => {
    const session = sessionOf();
    const write = session.writes[scope];
    if (write.running) {
      write.rerun = true;
      return;
    }
    write.running = true;
    try {
      do {
        write.rerun = false;
        const force = write.force;
        write.force = false;
        const attempt = currentValues();
        const doc = buildWebUISettingsDocument(scope, attempt);
        if (
          !force &&
          _.isEqual(doc, buildWebUISettingsDocument(scope, session.confirmed))
        ) {
          continue;
        }
        try {
          await writeScope(scope, doc);
          session.confirmed = {
            ..._.omit(
              session.confirmed,
              _.keys(pickWebUISettingsOfScope(session.confirmed, scope)),
            ),
            ...pickWebUISettingsOfScope(attempt, scope),
          };
        } catch (error) {
          rollBack(session, scope, attempt, error);
        }
      } while (write.rerun);
    } finally {
      write.running = false;
      endSessionIfIdle(session);
    }
  };

  // Shows `next` at once, then writes each scope it changed: one write per
  // scope, however many keys changed (JSON import, reset all). `force` writes
  // both scopes, so reset all also drops stored keys whose value is invalid.
  const commit = (next: WebUISettingsDocument, force = false) => {
    const prev = currentValues();
    const session = sessionOf();
    show(next);
    for (const scope of SCOPES) {
      if (force) {
        session.writes[scope].force = true;
        void flush(scope);
      } else if (
        !_.isEqual(
          buildWebUISettingsDocument(scope, prev),
          buildWebUISettingsDocument(scope, next),
        )
      ) {
        void flush(scope);
      }
    }
  };

  const setValue = (definition: WebUISettingDefinition, value: unknown) => {
    const current = currentValues();
    const { key } = definition;
    // Leaving a field unchanged must not pin its default into the document;
    // a stored value, even an invalid one, is compared as stored.
    const isUnchanged =
      value === undefined
        ? !(key in current)
        : key in current
          ? _.isEqual(value, current[key])
          : _.isEqual(value, defaultValueOf(definition));
    if (isUnchanged) return;
    const next = { ...current };
    // Only a clear or a row reset drops the key.
    if (value === undefined) {
      delete next[key];
    } else {
      next[key] = value;
    }
    commit(next);
  };

  // Reset-all deletes the saved documents (irreversible), so it is confirmed
  // by a typed word.
  const domainName = useCurrentDomainValue();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isJsonOpen, setIsJsonOpen] = useState(false);

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
          children: definition.size ? (
            <WebUISettingSizeInput
              label={label.title}
              value={definition.key in values ? (current as number) : undefined}
              defaultValue={rowDefault as number | undefined}
              size={definition.size}
              isUnlimitedWhenUnset={definition.isUnlimitedWhenUnset}
              width={CONTROL_WIDTH}
              onChange={(value) => setValue(definition, value)}
            />
          ) : (
            <WebUISettingNumberInput
              label={label.title}
              value={definition.key in values ? (current as number) : undefined}
              defaultValue={rowDefault as number | undefined}
              definition={definition}
              width={CONTROL_WIDTH}
              onChange={(value) => setValue(definition, value)}
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
                defaultValue={String(
                  current ??
                    (definition.key === 'manualUrl' ? hostedManualBaseURL : ''),
                )}
                onCommit={(raw) => {
                  const value = raw.trim();
                  // Committing the shown default unchanged keeps the key unset.
                  if (
                    definition.key === 'manualUrl' &&
                    current === null &&
                    value === hostedManualBaseURL
                  ) {
                    return;
                  }
                  setValue(definition, value);
                }}
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
  // The announcement is edited through its own modal and saved on its own
  // (#10713).
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
      <BAIAlert
        data-testid="webui-settings-save-notice"
        type="info"
        showIcon
        title={t('webuiSettings.SaveNotice')}
        description={t('webuiSettings.SaveNoticeDesc')}
      />
      <SettingList
        settingGroups={[...settingGroups, ...announcementGroup]}
        showSearchBar
        showChangedOptionFilter
        extraButton={
          <BAIFlex gap="xs" align="center">
            <Button
              data-testid="webui-settings-json-config"
              icon={<Braces size="1em" />}
              label={t('webuiSettings.JsonConfig')}
              onClick={() => setIsJsonOpen(true)}
            />
            <BAIButton
              danger
              icon={<Redo2 size="1em" />}
              onClick={() => setIsResetConfirmOpen(true)}
            >
              {t('button.Reset')}
            </BAIButton>
          </BAIFlex>
        }
      />
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
        onOk={() => {
          commit({}, true);
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
      <SettingsJsonModal
        open={isJsonOpen}
        currentValueOf={valueOf}
        onLoad={(loaded) => {
          const changed = loaded.filter(
            ({ definition, value }) => !_.isEqual(value, valueOf(definition)),
          );
          const next = { ...currentValues() };
          for (const { definition, value } of changed) {
            if (value === undefined) {
              delete next[definition.key];
            } else {
              next[definition.key] = value;
            }
          }
          commit(next);
          setIsJsonOpen(false);
          message.success(
            t('webuiSettings.JsonLoaded', { count: changed.length }),
          );
        }}
        onCancel={() => setIsJsonOpen(false)}
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
