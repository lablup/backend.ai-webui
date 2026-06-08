/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { BAIBoardItem } from '../BAIBoard';
import { createPanel, DEFAULT_PANELS } from './defaults';
import { panelRegistry } from './panelRegistry';
import { resourceRegistry } from './resourceRegistry';
import type { PanelDescriptor, PersistedPanel } from './types';
import {
  BAIBoardItemErrorBoundary,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

/**
 * Decoupled-dashboard "query-as-config" engine, exposed as a hook so its custom
 * panels render as additional items INSIDE the page's single Cloudscape `<Board>`
 * (a second board would corrupt the module-level DnD controller's collision math).
 *
 * Layout/order for the WHOLE board lives in ONE list (`dashboard_board_items`,
 * owned by the page); this hook owns only the custom panels' content identity:
 * the serialized {@link PanelDescriptor} per id (persisted in
 * `custom_dashboard_panels`), plus add/remove. `customContentById` keeps element
 * identity stable per id so a layout-only re-render doesn't re-suspend the table.
 *
 * The "Edit" toggle and edit-mode gate live at the page level
 * (`DashboardEditToggleButton` / `dashboardEditModeAtom`); this hook does not own
 * them. Panels are added via the edit drawer's modal, which calls {@link addPanel}.
 */
export interface UseCustomPanelsResult {
  /** The persisted custom panels (for listing/managing in the edit drawer). */
  panels: ReadonlyArray<PersistedPanel>;
  /** Default layout (id + spans + offset) for the custom panels, in seed order. */
  customDefaultLayout: Array<Omit<BAIBoardItem, 'data'>>;
  /** Resolve a custom-panel id to its board content (stable identity per id). */
  customContentById: Map<string, React.ReactNode>;
  /** Append a new custom panel built from the "Add panel" modal. */
  addPanel: (
    descriptor: Pick<PanelDescriptor, 'resourceType' | 'filter' | 'title'>,
  ) => void;
  /** Remove a custom panel by id. */
  removePanel: (id: string) => void;
}

export const useCustomPanels = (): UseCustomPanelsResult => {
  'use memo';
  const { t } = useTranslation();
  const [storedPanels, setStoredPanels] = useBAISettingUserState(
    'custom_dashboard_panels',
  );
  const panels = storedPanels ?? DEFAULT_PANELS;

  const updateDescriptor = (id: string, next: PanelDescriptor) => {
    setStoredPanels((previous) =>
      (previous ?? DEFAULT_PANELS).map((panel) =>
        panel.id === id ? { ...panel, descriptor: next } : panel,
      ),
    );
  };

  const removePanel = (id: string) => {
    setStoredPanels((previous) =>
      (previous ?? DEFAULT_PANELS).filter((panel) => panel.id !== id),
    );
  };

  const addPanel = (
    descriptor: Pick<PanelDescriptor, 'resourceType' | 'filter' | 'title'>,
  ) => {
    setStoredPanels((previous) => [
      ...(previous ?? DEFAULT_PANELS),
      createPanel(descriptor.resourceType, {
        filter: descriptor.filter ?? null,
        title: descriptor.title,
      }),
    ]);
  };

  // Custom panels' default layout — seeds the unified board order for ids that
  // have no entry yet (a freshly added panel). The unified `dashboard_board_items`
  // list, not this, owns the live order.
  const customDefaultLayout: Array<Omit<BAIBoardItem, 'data'>> = panels.map(
    (panel) => ({
      id: panel.id,
      rowSpan: panel.rowSpan,
      columnSpan: panel.columnSpan,
      ...(panel.columnOffset ? { columnOffset: panel.columnOffset } : {}),
      definition: panel.definition ?? { minRowSpan: 3, minColumnSpan: 1 },
    }),
  );

  // Content resolved by id. Element identity is keyed by panel id (not array
  // position), so a layout-only re-render reuses the same element and the inner
  // `useLazyLoadQuery` does not re-mount / re-suspend during a drag or resize.
  const customContentById = new Map<string, React.ReactNode>(
    filterOutNullAndUndefined(
      panels.map((panel: PersistedPanel) => {
        const Panel = panelRegistry[panel.panelType];
        const config = resourceRegistry[panel.descriptor.resourceType];
        const title =
          panel.descriptor.title ?? (config ? t(config.labelKey) : panel.id);
        const content: React.ReactNode = (
          <BAIBoardItemErrorBoundary title={title} status="error">
            {Panel ? (
              <Panel
                descriptor={panel.descriptor}
                onChange={(next) => updateDescriptor(panel.id, next)}
                onRemove={() => removePanel(panel.id)}
              />
            ) : null}
          </BAIBoardItemErrorBoundary>
        );
        return [panel.id, content] as const;
      }),
    ),
  );

  return {
    panels,
    customDefaultLayout,
    customContentById,
    addPanel,
    removePanel,
  };
};
