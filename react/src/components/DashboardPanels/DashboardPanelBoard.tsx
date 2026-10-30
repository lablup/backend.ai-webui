/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useResourceGroupsForCurrentProject } from '../../hooks/useCurrentProject';
import { dashboardEditModeAtom } from '../dashboardEditModeAtom';
import DashboardBoardSection from './DashboardBoardSection';
import DashboardBoardTabs from './DashboardBoardTabs';
import DashboardEditSider from './DashboardEditSider';
import DashboardFilterBar from './DashboardFilterBar';
import DashboardPanelModal from './DashboardPanelModal';
import { useBoardItemVisibility } from './DashboardRefreshContext';
import PanelSettingsModal from './PanelSettingsModal';
import { boardSortsAtom } from './ResourceTablePanel';
import type {
  DashboardPageQueryRefs,
  DashboardScope,
  PanelDefinition,
  PanelPage,
  PersistedPanel,
} from './types';
import { useDashboardBoard } from './useDashboardBoard';
import {
  DashboardFilterContext,
  useDashboardFilters,
} from './useDashboardFilters';
import {
  BAIBoard,
  BAIFlex,
  BAIUnmountAfterClose,
  type BAIScopedResourceGroupSelectProps,
} from 'backend.ai-ui';
import { useAtom, useSetAtom } from 'jotai';
import * as _ from 'lodash-es';
import React, { useEffect, useRef, useState } from 'react';

/** The resource groups a card's setting can pick from: the page's projects, else the domain's. */
const resourceGroupScopeOf = (
  scope: DashboardScope,
): BAIScopedResourceGroupSelectProps['scope'] =>
  scope.kind === 'mine'
    ? { project: scope.projectId ? [{ value: scope.projectId }] : [] }
    : scope.projectIds === 'all'
      ? { domain: [{ value: scope.domain.id }] }
      : { project: scope.projectIds.map((value) => ({ value })) };

export interface DashboardPanelBoardProps {
  page: PanelPage;
  catalog: ReadonlyArray<PanelDefinition>;
  /** The page query is refetching. */
  isRefetching: boolean;
  queryRefs: DashboardPageQueryRefs;
}

/**
 * A dashboard page's board under the dashboard bar (board tabs and refresh). Moving and resizing work at
 * all times; edit mode opens the sider that adds and removes cards and
 * manages custom panels. The admin pages keep several boards behind tabs; the
 * member page keeps one. Mount it inside a `DashboardRefreshProvider`.
 */
const DashboardPanelBoard: React.FC<DashboardPanelBoardProps> = ({
  page,
  catalog,
  isRefetching,
  queryRefs,
}) => {
  'use memo';
  const [editMode, setEditMode] = useAtom(dashboardEditModeAtom);
  const setBoardSorts = useSetAtom(boardSortsAtom);
  const [panelModalState, setPanelModalState] = useState<{
    open: boolean;
    panel?: PersistedPanel;
  }>({ open: false });
  // The id outlives `open` until after-close, so the closing modal keeps its content.
  const [settingsPanelId, setSettingsPanelId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { sftpResourceGroups } = useResourceGroupsForCurrentProject();
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // The edit-mode atom is global: close it when leaving the page, but not when a
  // suspending query remounts the board on the same path (that would drop an early click).
  useEffect(() => {
    const mountedPath = window.location.pathname;
    return () => {
      if (window.location.pathname !== mountedPath) {
        setEditMode(false);
        setBoardSorts({});
      }
    };
  }, [setEditMode, setBoardSorts]);

  const {
    boardItems,
    onLayoutChange,
    catalogEntries,
    activeKeys,
    setPanelsActive,
    customPanels,
    availableResources,
    gridEnabled,
    addCustomPanel,
    updateCustomPanel,
    removePanel,
    resetLayout,
    settingsTargetOf,
    updatePanelSettings,
    boards,
  } = useDashboardBoard({
    page,
    catalog,
    isRefetching,
    queryRefs,
    onRequestEditCustomPanel: (panel) =>
      setPanelModalState({ open: true, panel }),
  });
  const settingsTarget = settingsPanelId
    ? settingsTargetOf(settingsPanelId)
    : null;

  const filters = useDashboardFilters(page, boards);
  useBoardItemVisibility(boardContainerRef);

  const scrollBoardEndIntoView = () => {
    // New panels append at the board's end; without this an add looks like a no-op.
    requestAnimationFrame(() => {
      boardContainerRef.current?.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
      });
    });
  };

  return (
    <BAIFlex direction="row" align="stretch" gap="lg" style={{ width: '100%' }}>
      <div ref={boardContainerRef} style={{ flex: 1, minWidth: 0 }}>
        <BAIFlex direction="column" align="stretch" gap="md">
          <DashboardFilterBar filters={filters} isRefetching={isRefetching}>
            {page !== 'project' ? <DashboardBoardTabs boards={boards} /> : null}
          </DashboardFilterBar>
          <DashboardFilterContext
            value={{
              scope: filters.scope,
              currentProjectId: filters.currentProjectId,
              currentResourceGroup: filters.currentResourceGroup,
            }}
          >
            <BAIBoard
              movable
              resizable
              bordered
              items={boardItems}
              // The board is controlled: the next render must hand back exactly
              // what it reported, or it snaps back.
              onItemsChange={(event) => {
                onLayoutChange(
                  _.map(event.detail.items, (item) => _.omit(item, 'data')),
                );
              }}
            />
          </DashboardFilterContext>
        </BAIFlex>
      </div>
      {editMode ? (
        <DashboardEditSider
          catalogEntries={catalogEntries}
          activeKeys={activeKeys}
          onTogglePanels={(keys, active) => {
            setPanelsActive(keys, active);
            if (active) scrollBoardEndIntoView();
          }}
          panels={customPanels}
          onRequestAdd={() => setPanelModalState({ open: true })}
          onRequestEdit={(panel) => setPanelModalState({ open: true, panel })}
          onRemove={removePanel}
          onResetLayout={resetLayout}
          settingsTargetOf={settingsTargetOf}
          onRequestSettings={(panelId) => {
            setSettingsPanelId(panelId);
            setIsSettingsOpen(true);
          }}
          boardSection={
            boards && page !== 'project' ? (
              <DashboardBoardSection
                page={page}
                boards={boards}
                catalog={catalog}
              />
            ) : undefined
          }
        />
      ) : null}
      <BAIUnmountAfterClose>
        <PanelSettingsModal
          open={isSettingsOpen && !!settingsTarget}
          title={settingsTarget?.title ?? ''}
          definition={settingsTarget?.definition ?? { kind: 'custom' }}
          settings={settingsTarget?.settings}
          resourceGroupScope={resourceGroupScopeOf(filters.scope)}
          excludedResourceGroups={_.compact(sftpResourceGroups)}
          onSubmit={(settings) => {
            if (settingsPanelId) updatePanelSettings(settingsPanelId, settings);
          }}
          onRequestClose={() => setIsSettingsOpen(false)}
          afterClose={() => setSettingsPanelId(null)}
        />
      </BAIUnmountAfterClose>
      {/* Unmounted after the close animation, so each open starts fresh: two
          consecutive Adds would otherwise share the preview-driven state. */}
      <BAIUnmountAfterClose>
        <DashboardPanelModal
          open={panelModalState.open}
          initialPanel={panelModalState.panel}
          availableResources={availableResources}
          gridEnabled={gridEnabled}
          onRequestClose={() => setPanelModalState({ open: false })}
          onSubmit={(input) => {
            if (panelModalState.panel) {
              updateCustomPanel(panelModalState.panel.id, input);
            } else {
              addCustomPanel(input);
              scrollBoardEndIntoView();
            }
          }}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default DashboardPanelBoard;
