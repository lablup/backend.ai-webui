/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentUserRole } from '../../hooks/backendai';
import './DashboardEditSider.css';
import { panelTitleKey, type CatalogEntry } from './boardModel';
import { describePanelSettings } from './panelSettings';
import { resolvePanelTitle } from './resourceRegistry';
import { PANEL_GROUPS, type PanelGroup, type PersistedPanel } from './types';
import type { PanelSettingsTarget } from './useDashboardBoard';
import { Button } from '@lablup/ui-common/Button';
import { IconButton } from '@lablup/ui-common/IconButton';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAICheckboxInput,
  BAICheckboxList,
  BAICheckboxListItem,
  BAIFlex,
  BAIPopconfirm,
  BAIText,
  BAITextInput,
} from 'backend.ai-ui';
import {
  Plus,
  RotateCcw,
  Settings2,
  SquarePenIcon,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface DashboardEditSiderProps {
  /** Single-instance catalog entries, checked when on the board. */
  catalogEntries: ReadonlyArray<CatalogEntry>;
  /** Catalog keys, and user-made panel ids, of what is shown on the board. */
  activeKeys: ReadonlySet<string>;
  /** Cards on the board that are hidden because the viewer may not read them. */
  deniedKeys?: ReadonlySet<string>;
  /** Takes catalog keys or user-made panel ids. */
  onTogglePanels: (keys: ReadonlyArray<string>, active: boolean) => void;
  /** User-made panels, listed as the first group of the checklist. */
  panels: ReadonlyArray<PersistedPanel>;
  onRequestAdd: () => void;
  onRequestEdit: (panel: PersistedPanel) => void;
  onRemove: (id: string) => void;
  /** Restores the page's default cards and arrangement. */
  onResetLayout: () => void;
  /** A board panel whose card takes settings; null otherwise. */
  settingsTargetOf: (id: string) => PanelSettingsTarget | null;
  onRequestSettings: (id: string) => void;
  /** The board block above the cards, on the pages that keep several boards. */
  boardSection?: React.ReactNode;
}

const GROUP_LABEL_KEYS: Record<PanelGroup, string> = {
  start: 'dashboard.catalog.group.Start',
  session: 'dashboard.catalog.group.Sessions',
  resource: 'dashboard.catalog.group.Resources',
  deployment: 'dashboard.catalog.group.Deployments',
  users: 'dashboard.catalog.group.Users',
  activity: 'dashboard.catalog.group.Activity',
  other: 'dashboard.catalog.group.Other',
};

/**
 * Edit-mode side panel, a flex sibling of the board so the board reflows. The
 * board block (admin pages) manages the boards; the card checklist below it
 * puts cards on the board and takes them off, user-made panels first.
 */
const DashboardEditSider: React.FC<DashboardEditSiderProps> = ({
  catalogEntries,
  activeKeys,
  deniedKeys,
  onTogglePanels,
  panels,
  onRequestAdd,
  onRequestEdit,
  onRemove,
  onResetLayout,
  settingsTargetOf,
  onRequestSettings,
  boardSection,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const role = useCurrentUserRole();
  const [search, setSearch] = useState('');

  const normalizedSearch = search.trim().toLowerCase();
  const labeledEntries = catalogEntries.map((entry) => ({
    ...entry,
    label: t(panelTitleKey(entry.definition, role)),
  }));
  const matchingEntries = normalizedSearch
    ? labeledEntries.filter((entry) =>
        entry.label.toLowerCase().includes(normalizedSearch),
      )
    : labeledEntries;
  const settingsButton = (id: string, label: string) =>
    settingsTargetOf(id) ? (
      <IconButton
        variant="ghost"
        size="sm"
        label={t('dashboard.settings.CardSettingsOf', { name: label })}
        tooltip={t('dashboard.settings.CardSettings')}
        icon={<Settings2 size="1em" />}
        onClick={() => onRequestSettings(id)}
      />
    ) : null;
  const settingsSummaryOf = (id: string) => {
    const target = settingsTargetOf(id);
    return target
      ? (describePanelSettings(target.settings, t) ??
          t('dashboard.settings.DefaultSettings'))
      : undefined;
  };

  const labeledPanels = panels.map((panel) => ({
    panel,
    label: resolvePanelTitle(panel.descriptor, t),
  }));
  const matchingPanels = normalizedSearch
    ? labeledPanels.filter(({ label }) =>
        label.toLowerCase().includes(normalizedSearch),
      )
    : labeledPanels;

  // Select all acts on the cards the search leaves visible.
  const selectableKeys = [
    ...matchingPanels.map(({ panel }) => panel.id),
    ...matchingEntries
      .filter((entry) => !entry.locked)
      .map((entry) => entry.definition.key),
  ];
  const activeCount = selectableKeys.filter((key) =>
    activeKeys.has(key),
  ).length;
  const selectAllValue =
    activeCount === 0
      ? false
      : activeCount === selectableKeys.length
        ? true
        : ('indeterminate' as const);

  const toggleChanged = (
    listed: ReadonlyArray<string>,
    values: ReadonlyArray<string>,
  ) => {
    const checked = new Set(values);
    const changed = listed.filter(
      (key) => checked.has(key) !== activeKeys.has(key),
    );
    const added = changed.filter((key) => checked.has(key));
    const removed = changed.filter((key) => !checked.has(key));
    if (added.length) onTogglePanels(added, true);
    if (removed.length) onTogglePanels(removed, false);
  };

  const groups = PANEL_GROUPS.map((group) => ({
    group,
    entries: matchingEntries.filter(
      (entry) => entry.definition.group === group,
    ),
  })).filter(({ entries }) => entries.length > 0);

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="md"
      className="dashboard-edit-sider"
      style={{
        // Inline, because BAIFlex sets `position: relative` inline.
        position: 'sticky',
        width: 320,
        flexShrink: 0,
        paddingLeft: token('--spacing-6'),
        paddingRight: token('--spacing-4'),
        borderLeft: `1px solid ${token('--color-border-emphasized')}`,
      }}
    >
      {boardSection}
      <BAIText
        strong
        style={boardSection ? { paddingTop: token('--spacing-3') } : undefined}
      >
        {t('dashboard.editSider.Cards')}
      </BAIText>
      <BAITextInput
        size="sm"
        hasClear
        value={search}
        onChange={(value) => setSearch(value)}
        placeholder={t('dashboard.editSider.SearchCards')}
        aria-label={t('dashboard.editSider.SearchCards')}
        data-testid="dashboard-card-search"
      />
      {selectableKeys.length > 0 ? (
        <BAICheckboxInput
          size="sm"
          value={selectAllValue}
          onChange={(checked) =>
            onTogglePanels(
              selectableKeys.filter((key) => activeKeys.has(key) !== checked),
              checked,
            )
          }
          data-testid="dashboard-card-select-all"
        >
          {t('dashboard.editSider.SelectAll')}
        </BAICheckboxInput>
      ) : null}
      {normalizedSearch && matchingPanels.length === 0 ? null : (
        <BAIFlex
          direction="column"
          align="stretch"
          gap="xxs"
          data-testid="dashboard-custom-panels"
        >
          <BAIFlex direction="row" justify="between" align="center" gap="sm">
            <BAIText
              type="secondary"
              style={{ fontSize: token('--font-size-sm') }}
            >
              {t('dashboard.editSider.Title')}
            </BAIText>
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus size="1em" />}
              label={t('button.Add')}
              onClick={onRequestAdd}
            />
          </BAIFlex>
          {matchingPanels.length === 0 ? (
            <BAIText type="secondary">{t('dashboard.editSider.Empty')}</BAIText>
          ) : (
            <BAICheckboxList
              aria-label={t('dashboard.editSider.Title')}
              density="compact"
              width="100%"
              value={matchingPanels
                .filter(({ panel }) => activeKeys.has(panel.id))
                .map(({ panel }) => panel.id)}
              onChange={(values) =>
                toggleChanged(
                  matchingPanels.map(({ panel }) => panel.id),
                  values,
                )
              }
            >
              {matchingPanels.map(({ panel, label }) => (
                <BAICheckboxListItem
                  key={panel.id}
                  value={panel.id}
                  label={label}
                  description={
                    activeKeys.has(panel.id)
                      ? settingsSummaryOf(panel.id)
                      : undefined
                  }
                  endContent={
                    <BAIFlex direction="row" align="center" gap="xxs">
                      {settingsButton(panel.id, label)}
                      <IconButton
                        variant="ghost"
                        size="sm"
                        label={t('button.Edit')}
                        tooltip={t('button.Edit')}
                        icon={<SquarePenIcon size="1em" />}
                        onClick={() => onRequestEdit(panel)}
                      />
                      <BAIPopconfirm
                        title={t('dialog.ask.DoYouWantToDeleteSomething', {
                          name: label,
                        })}
                        isDanger
                        onConfirm={() => onRemove(panel.id)}
                      >
                        <IconButton
                          variant="ghost"
                          size="sm"
                          label={t('button.Delete')}
                          tooltip={t('button.Delete')}
                          icon={<Trash2 size="1em" />}
                        />
                      </BAIPopconfirm>
                    </BAIFlex>
                  }
                />
              ))}
            </BAICheckboxList>
          )}
        </BAIFlex>
      )}
      {groups.length === 0 && matchingPanels.length === 0 ? (
        <BAIText type="secondary">
          {t('dashboard.editSider.NoMatchingCards')}
        </BAIText>
      ) : (
        groups.map(({ group, entries }) => (
          <BAIFlex key={group} direction="column" align="stretch" gap="xxs">
            <BAIText
              type="secondary"
              style={{ fontSize: token('--font-size-sm') }}
            >
              {t(GROUP_LABEL_KEYS[group])}
            </BAIText>
            <BAICheckboxList
              aria-label={t(GROUP_LABEL_KEYS[group])}
              density="compact"
              width="100%"
              value={entries
                .filter((entry) => activeKeys.has(entry.definition.key))
                .map((entry) => entry.definition.key)}
              onChange={(values) =>
                toggleChanged(
                  entries.map(({ definition }) => definition.key),
                  values,
                )
              }
            >
              {entries.map((entry) => (
                <BAICheckboxListItem
                  key={entry.definition.key}
                  value={entry.definition.key}
                  label={entry.label}
                  description={
                    deniedKeys?.has(entry.definition.key)
                      ? t('dashboard.permission.NoPermissionToView')
                      : activeKeys.has(entry.definition.key)
                        ? settingsSummaryOf(entry.definition.key)
                        : undefined
                  }
                  endContent={
                    activeKeys.has(entry.definition.key)
                      ? settingsButton(entry.definition.key, entry.label)
                      : undefined
                  }
                />
              ))}
            </BAICheckboxList>
          </BAIFlex>
        ))
      )}

      <BAIPopconfirm
        title={t('dashboard.editSider.ResetLayout')}
        description={t('dashboard.editSider.ResetLayoutDescription')}
        isDanger
        onConfirm={onResetLayout}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={<RotateCcw size="1em" />}
          label={t('dashboard.editSider.ResetLayout')}
          data-testid="dashboard-reset-layout"
        />
      </BAIPopconfirm>
    </BAIFlex>
  );
};

export default DashboardEditSider;
