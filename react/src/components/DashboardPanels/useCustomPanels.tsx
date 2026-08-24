/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentUserRole } from '../../hooks/backendai';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { BAIBoardItem } from '../BAIBoard';
import { createPanel, DEFAULT_PANEL_LAYOUTS, DEFAULT_PANELS } from './defaults';
import { panelRegistry } from './panelRegistry';
import {
  availableResourceKeys,
  resolvePanelTitle,
  resourceRegistry,
} from './resourceRegistry';
import type { PanelInput, PersistedPanel, ResourceKey } from './types';
import { BAIBoardItemErrorBoundary } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

export interface UseCustomPanelsOptions {
  /**
   * `experimental_custom_dashboard_panels`. When false the hook goes inert —
   * nothing renders on the board and the sider has nothing to list — but the
   * persisted panels are left alone, so opting back in restores them.
   */
  enabled?: boolean;
  /** Page refetch key — forwarded so custom panels refresh with the board. */
  fetchKey?: string;
  /** Called when a panel's edit control is pressed (opens the modal pre-filled). */
  onRequestEdit?: (panel: PersistedPanel) => void;
}

export interface UseCustomPanelsResult {
  /** All persisted custom panels (for the edit sider list). */
  panels: ReadonlyArray<PersistedPanel>;
  /** Resource keys the current role may add/query. */
  availableResources: ReadonlyArray<ResourceKey>;
  /** Default layout entries for renderable custom panels, in stored order. */
  customDefaultLayout: Array<Omit<BAIBoardItem, 'data'>>;
  /** Board content per renderable panel id (stable element identity per id). */
  customContentById: Map<string, React.ReactNode>;
  addPanel: (input: PanelInput) => void;
  updatePanel: (id: string, input: PanelInput) => void;
  removePanel: (id: string) => void;
}

/**
 * Drop corrupt/legacy entries instead of crashing the whole dashboard route.
 * The kind and resource are checked against the registries that will resolve
 * them, not merely for presence: an entry naming a retired panel kind is exactly
 * what a legacy localStorage payload looks like, and it would otherwise reach
 * `panelRegistry[...]` as undefined and render an empty error box.
 */
export const sanitizePanels = (value: unknown): PersistedPanel[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is PersistedPanel => {
    if (!item || typeof item !== 'object') return false;
    const panel = item as PersistedPanel;
    return (
      typeof panel.id === 'string' &&
      panel.panelType in panelRegistry &&
      !!panel.descriptor &&
      panel.descriptor.resourceType in resourceRegistry &&
      (panel.descriptor.title === undefined ||
        typeof panel.descriptor.title === 'string')
    );
  });
};

/**
 * The "query-as-config" custom panels, rendered as extra items INSIDE the page's
 * single Cloudscape `<Board>` (a second board corrupts the module-level DnD
 * controller). This hook owns panel identity + descriptor persistence
 * (`custom_dashboard_panels`); order/layout for the WHOLE board lives in the
 * unified `dashboard_board_items` list owned by the page.
 */
export const useCustomPanels = ({
  enabled = true,
  fetchKey,
  onRequestEdit,
}: UseCustomPanelsOptions = {}): UseCustomPanelsResult => {
  'use memo';
  const { t } = useTranslation();
  const userRole = useCurrentUserRole();
  const [storedPanels, setStoredPanels] = useBAISettingUserState(
    'custom_dashboard_panels',
  );
  const [, setLocalStorageBoardItems] = useBAISettingUserState(
    'dashboard_board_items',
  );
  const panels = !enabled
    ? []
    : storedPanels
      ? sanitizePanels(storedPanels)
      : [...DEFAULT_PANELS];
  const availableResources = availableResourceKeys(userRole);
  const availableResourceSet = new Set<ResourceKey>(availableResources);

  const addPanel = (input: PanelInput) => {
    setStoredPanels((previous) => [
      ...sanitizePanels(previous ?? DEFAULT_PANELS),
      createPanel(input),
    ]);
  };

  const updatePanel = (id: string, input: PanelInput) => {
    // A kind switch changes what a sensible size is, but the persisted layout
    // always wins over the default (see `reconcileBoardLayout`), so the entry
    // has to be rewritten here — otherwise a table switched to a count keeps
    // the table's spans forever. Same reason `removePanel` prunes the list.
    const current = panels.find((panel) => panel.id === id);
    if (current && current.panelType !== input.panelType) {
      const layout =
        DEFAULT_PANEL_LAYOUTS[input.panelType] ??
        DEFAULT_PANEL_LAYOUTS.resourceTable;
      setLocalStorageBoardItems((previous) =>
        Array.isArray(previous)
          ? previous.map((item) => (item.id === id ? { id, ...layout } : item))
          : previous,
      );
    }
    setStoredPanels((previous) =>
      sanitizePanels(previous ?? DEFAULT_PANELS).map((panel) =>
        panel.id === id
          ? {
              ...panel,
              panelType: input.panelType,
              descriptor: {
                resourceType: input.resourceType,
                title: input.title,
                filter: input.filter ?? null,
                order: input.order ?? null,
              },
            }
          : panel,
      ),
    );
  };

  const removePanel = (id: string) => {
    setStoredPanels((previous) =>
      sanitizePanels(previous ?? DEFAULT_PANELS).filter(
        (panel) => panel.id !== id,
      ),
    );
    // Also drop the unified-layout entry, or orphaned ids accumulate until the
    // next drag rewrites the list.
    setLocalStorageBoardItems((previous) =>
      Array.isArray(previous)
        ? previous.filter((item) => item.id !== id)
        : previous,
    );
  };

  // Panels whose resource the current role cannot query are kept in storage and
  // listed in the sider (marked locked) but not rendered on the board.
  const renderablePanels = panels.filter((panel) =>
    availableResourceSet.has(panel.descriptor.resourceType),
  );

  const customDefaultLayout: Array<Omit<BAIBoardItem, 'data'>> =
    renderablePanels.map((panel) => ({
      id: panel.id,
      ...(DEFAULT_PANEL_LAYOUTS[panel.panelType] ??
        DEFAULT_PANEL_LAYOUTS.resourceTable),
    }));

  // Element identity is keyed by panel id (not array position) so a layout-only
  // re-render reuses the element and the inner query doesn't re-suspend mid-drag.
  const customContentById = new Map<string, React.ReactNode>(
    renderablePanels.map((panel) => {
      const Panel = panelRegistry[panel.panelType];
      const content: React.ReactNode = (
        <BAIBoardItemErrorBoundary
          // Keyed by kind AND descriptor so a config edit clears a stuck error
          // state. The kind is not part of the descriptor, so without it a
          // failed table stays in its fallback after a switch to a count.
          key={`${panel.panelType}:${JSON.stringify(panel.descriptor)}`}
          title={resolvePanelTitle(panel.descriptor, t)}
          status="error"
        >
          {Panel ? (
            <Panel
              descriptor={panel.descriptor}
              fetchKey={fetchKey}
              onEdit={onRequestEdit ? () => onRequestEdit(panel) : undefined}
              onRemove={() => removePanel(panel.id)}
            />
          ) : null}
        </BAIBoardItemErrorBoundary>
      );
      return [panel.id, content] as const;
    }),
  );

  return {
    panels,
    availableResources,
    customDefaultLayout,
    customContentById,
    addPanel,
    updatePanel,
    removePanel,
  };
};
