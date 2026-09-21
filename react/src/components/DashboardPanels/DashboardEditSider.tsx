/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { panelTypeLabelKeys } from './panelRegistry';
import { resolvePanelTitle, resourceRegistry } from './resourceRegistry';
import type { PersistedPanel, ResourceKey } from './types';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { useTheme } from '@astryxdesign/core/theme';
import { BAIFlex, BAIPopconfirm, BAIText } from 'backend.ai-ui';
import { Plus, RotateCcw, SquarePenIcon, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface DashboardEditSiderProps {
  panels: ReadonlyArray<PersistedPanel>;
  availableResources: ReadonlyArray<ResourceKey>;
  /** `experimental_session_resource_grid` — off ⇒ grid panels show as tables. */
  gridEnabled?: boolean;
  onRequestAdd: () => void;
  onRequestEdit: (panel: PersistedPanel) => void;
  onRemove: (id: string) => void;
  /** Restores the board's default arrangement (clears the unified layout). */
  onResetLayout: () => void;
}

/**
 * Edit-mode side panel, a flex sibling of the board (never an overlay) so the
 * board reflows and stays fully visible. Lists the custom panels with edit /
 * remove, the Add entry point, and the reset-layout escape hatch. Panels are
 * created/edited only through the modal the two request callbacks open.
 */
const DashboardEditSider: React.FC<DashboardEditSiderProps> = ({
  panels,
  availableResources,
  gridEnabled = false,
  onRequestAdd,
  onRequestEdit,
  onRemove,
  onResetLayout,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const availableSet = new Set(availableResources);

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="md"
      style={{
        width: 320,
        flexShrink: 0,
        paddingLeft: token('--spacing-6'),
        borderLeft: `1px solid ${token('--color-border-emphasized')}`,
        overflow: 'auto',
      }}
    >
      <BAIFlex direction="row" justify="between" align="center" gap="sm">
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
            // An untitled panel already reads as its data source, so only name
            // the source again when the user gave it a title of their own. The
            // degraded-grid hint names the kind itself, so it replaces it.
            const caption = [
              isGridDegraded
                ? t('dashboard.editSider.GridDisabled')
                : t(panelTypeLabelKeys[panel.panelType] ?? panel.panelType),
              panel.descriptor.title ? dataSourceLabel : undefined,
              isAvailable
                ? undefined
                : t('dashboard.editSider.RequiresSuperadmin'),
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
                    // One line, like the title above it: the caption is up to
                    // three joined segments and wrapping made rows uneven.
                    ellipsis={{ tooltip: caption }}
                    style={{ fontSize: token('--font-size-sm') }}
                  >
                    {caption}
                  </BAIText>
                </BAIFlex>
                <BAIFlex direction="row" align="center" gap="xxs">
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
        />
      </BAIPopconfirm>
    </BAIFlex>
  );
};

export default DashboardEditSider;
