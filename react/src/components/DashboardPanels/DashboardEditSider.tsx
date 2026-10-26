/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentUserRole } from '../../hooks/backendai';
import './DashboardEditSider.css';
import { panelTitleKey, type CatalogEntry } from './boardModel';
import { panelTypeLabelKeys } from './panelRegistry';
import { describePanelSettings } from './panelSettings';
import { resolvePanelTitle, resourceRegistry } from './resourceRegistry';
import {
  PANEL_GROUPS,
  type PanelGroup,
  type PersistedPanel,
  type ResourceKey,
} from './types';
import type { PanelSettingsTarget } from './useDashboardBoard';
import { Button } from '@lablup/ui-common/Button';
import { CheckboxList, CheckboxListItem } from '@lablup/ui-common/CheckboxList';
import { IconButton } from '@lablup/ui-common/IconButton';
import { TextInput } from '@lablup/ui-common/TextInput';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFlex, BAIPopconfirm, BAIText } from 'backend.ai-ui';
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
  activeKeys: ReadonlySet<string>;
  onTogglePanel: (key: string, active: boolean) => void;
  panels: ReadonlyArray<PersistedPanel>;
  availableResources: ReadonlyArray<ResourceKey>;
  /** `experimental_session_resource_grid`; off shows grid panels as tables. */
  gridEnabled?: boolean;
  onRequestAdd: () => void;
  onRequestEdit: (panel: PersistedPanel) => void;
  onRemove: (id: string) => void;
  /** Restores the page's default cards and arrangement. */
  onResetLayout: () => void;
  /** A board panel whose card takes settings; null otherwise. */
  settingsTargetOf: (id: string) => PanelSettingsTarget | null;
  onRequestSettings: (id: string) => void;
}

const GROUP_LABEL_KEYS: Record<PanelGroup, string> = {
  start: 'dashboard.catalog.group.Start',
  session: 'dashboard.catalog.group.Sessions',
  resource: 'dashboard.catalog.group.Resources',
  deployment: 'dashboard.catalog.group.Deployments',
  activity: 'dashboard.catalog.group.Activity',
  superadmin: 'dashboard.editSider.RequiresSuperadmin',
  other: 'dashboard.catalog.group.Other',
};

/**
 * Edit-mode side panel, a flex sibling of the board so the board reflows. The
 * card checklist adds and removes catalog cards; the custom panel block lists
 * user-made panels, created and edited through the panel modal.
 */
const DashboardEditSider: React.FC<DashboardEditSiderProps> = ({
  catalogEntries,
  activeKeys,
  onTogglePanel,
  panels,
  availableResources,
  gridEnabled = false,
  onRequestAdd,
  onRequestEdit,
  onRemove,
  onResetLayout,
  settingsTargetOf,
  onRequestSettings,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const role = useCurrentUserRole();
  const [search, setSearch] = useState('');
  const availableSet = new Set(availableResources);

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
        borderLeft: `1px solid ${token('--color-border-emphasized')}`,
      }}
    >
      <BAIText strong>{t('dashboard.editSider.Cards')}</BAIText>
      <TextInput
        size="sm"
        hasClear
        value={search}
        onChange={(value) => setSearch(value)}
        placeholder={t('dashboard.editSider.SearchCards')}
        aria-label={t('dashboard.editSider.SearchCards')}
        data-testid="dashboard-card-search"
      />
      {groups.length === 0 ? (
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
            <CheckboxList
              aria-label={t(GROUP_LABEL_KEYS[group])}
              density="compact"
              width="100%"
              value={entries
                .filter((entry) => activeKeys.has(entry.definition.key))
                .map((entry) => entry.definition.key)}
              onChange={(values) => {
                const checked = new Set(values);
                entries.forEach(({ definition }) => {
                  const isActive = activeKeys.has(definition.key);
                  if (checked.has(definition.key) !== isActive) {
                    onTogglePanel(definition.key, !isActive);
                  }
                });
              }}
            >
              {entries.map((entry) => (
                <CheckboxListItem
                  key={entry.definition.key}
                  value={entry.definition.key}
                  label={entry.label}
                  isDisabled={entry.locked}
                  description={
                    entry.locked
                      ? t('dashboard.editSider.Unavailable')
                      : entry.definition.requires?.role === 'superadmin' &&
                          group !== 'superadmin'
                        ? t('dashboard.editSider.RequiresSuperadmin')
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
            </CheckboxList>
          </BAIFlex>
        ))
      )}

      <BAIFlex
        direction="row"
        justify="between"
        align="center"
        gap="sm"
        style={{ paddingTop: token('--spacing-3') }}
      >
        <BAIText strong>{t('dashboard.editSider.Title')}</BAIText>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size="1em" />}
          label={t('button.Add')}
          onClick={onRequestAdd}
        />
      </BAIFlex>

      {panels.length === 0 ? (
        <BAIText type="secondary">{t('dashboard.editSider.Empty')}</BAIText>
      ) : (
        <BAIFlex direction="column" align="stretch">
          {panels.map((panel) => {
            const label = resolvePanelTitle(panel.descriptor, t);
            const dataSourceLabel = t(
              resourceRegistry[panel.descriptor.resourceType]?.labelKey ??
                panel.descriptor.resourceType,
            );
            const isAvailable = availableSet.has(panel.descriptor.resourceType);
            const isGridDegraded =
              panel.panelType === 'sessionResourceGrid' && !gridEnabled;
            // An untitled panel already reads as its data source; the degraded
            // grid hint names the kind itself, so it replaces it.
            const caption = [
              isGridDegraded
                ? t('dashboard.editSider.GridDisabled')
                : t(panelTypeLabelKeys[panel.panelType] ?? panel.panelType),
              panel.descriptor.title ? dataSourceLabel : undefined,
              isAvailable
                ? undefined
                : t('dashboard.editSider.RequiresSuperadmin'),
              settingsTargetOf(panel.id)
                ? describePanelSettings(settingsTargetOf(panel.id)?.settings, t)
                : undefined,
            ]
              .filter(Boolean)
              .join(' · ');
            return (
              <BAIFlex
                key={panel.id}
                direction="row"
                justify="between"
                align="center"
                gap="sm"
                style={{
                  paddingBlock: token('--spacing-2'),
                  borderBottom: `1px solid ${token('--color-border')}`,
                }}
              >
                <BAIFlex
                  direction="column"
                  align="stretch"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <BAIText ellipsis>{label}</BAIText>
                  <BAIText
                    type="secondary"
                    ellipsis={{ tooltip: caption }}
                    style={{ fontSize: token('--font-size-sm') }}
                  >
                    {caption}
                  </BAIText>
                </BAIFlex>
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
              </BAIFlex>
            );
          })}
        </BAIFlex>
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
