/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import DashboardEditToggleButton from '../DashboardEditToggleButton';
import { breadcrumbExtraAtom } from '../breadcrumbExtraAtom';
import { dashboardEditModeAtom } from '../dashboardEditModeAtom';
import DashboardEditSider from './DashboardEditSider';
import DashboardPanelModal from './DashboardPanelModal';
import PanelSettingsModal from './PanelSettingsModal';
import { boardSortsAtom } from './ResourceTablePanel';
import type {
  DashboardPageQueryRefs,
  PanelDefinition,
  PanelPage,
  PersistedPanel,
} from './types';
import { useDashboardBoard } from './useDashboardBoard';
import { BAIBoard, BAIFlex, BAIUnmountAfterClose } from 'backend.ai-ui';
import { useAtom, useSetAtom } from 'jotai';
import * as _ from 'lodash-es';
import React, { useEffect, useRef, useState } from 'react';

export interface DashboardPanelBoardProps {
  page: PanelPage;
  catalog: ReadonlyArray<PanelDefinition>;
  fetchKey: string;
  isRefetching: boolean;
  queryRefs: DashboardPageQueryRefs;
  onRefresh: () => void;
}

/**
 * A dashboard page's board. Moving and resizing work at all times; edit mode
 * opens the sider that adds and removes cards and manages custom panels.
 */
const DashboardPanelBoard: React.FC<DashboardPanelBoardProps> = ({
  page,
  catalog,
  fetchKey,
  isRefetching,
  queryRefs,
  onRefresh,
}) => {
  'use memo';
  const [editMode, setEditMode] = useAtom(dashboardEditModeAtom);
  const setBreadcrumbExtra = useSetAtom(breadcrumbExtraAtom);
  const setBoardSorts = useSetAtom(boardSortsAtom);
  const [panelModalState, setPanelModalState] = useState<{
    open: boolean;
    panel?: PersistedPanel;
  }>({ open: false });
  const [settingsPanelId, setSettingsPanelId] = useState<string | null>(null);
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // The edit-mode atom is global: close it when leaving the page, but not when a
  // suspending query remounts the board on the same path (that would drop an early click).
  useEffect(() => {
    const mountedPath = window.location.pathname;
    setBreadcrumbExtra(<DashboardEditToggleButton />);
    return () => {
      setBreadcrumbExtra(null);
      if (window.location.pathname !== mountedPath) {
        setEditMode(false);
        setBoardSorts({});
      }
    };
  }, [setBreadcrumbExtra, setEditMode, setBoardSorts]);

  const {
    boardItems,
    onLayoutChange,
    catalogEntries,
    activeKeys,
    setPanelActive,
    customPanels,
    availableResources,
    gridEnabled,
    addCustomPanel,
    updateCustomPanel,
    removePanel,
    resetLayout,
    settingsTargetOf,
    updatePanelSettings,
  } = useDashboardBoard({
    page,
    catalog,
    fetchKey,
    isRefetching,
    queryRefs,
    onRefresh,
    onRequestEditCustomPanel: (panel) =>
      setPanelModalState({ open: true, panel }),
  });
  const settingsTarget = settingsPanelId
    ? settingsTargetOf(settingsPanelId)
    : null;

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
      </div>
      {editMode ? (
        <DashboardEditSider
          catalogEntries={catalogEntries}
          activeKeys={activeKeys}
          onTogglePanel={(key, active) => {
            setPanelActive(key, active);
            if (active) scrollBoardEndIntoView();
          }}
          panels={customPanels}
          onRequestAdd={() => setPanelModalState({ open: true })}
          onRequestEdit={(panel) => setPanelModalState({ open: true, panel })}
          onRemove={removePanel}
          onResetLayout={resetLayout}
          settingsTargetOf={settingsTargetOf}
          onRequestSettings={setSettingsPanelId}
        />
      ) : null}
      <BAIUnmountAfterClose>
        <PanelSettingsModal
          open={!!settingsTarget}
          title={settingsTarget?.title ?? ''}
          definition={settingsTarget?.definition ?? { kind: 'custom' }}
          settings={settingsTarget?.settings}
          onSubmit={(settings) => {
            if (settingsPanelId) updatePanelSettings(settingsPanelId, settings);
          }}
          onRequestClose={() => setSettingsPanelId(null)}
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
