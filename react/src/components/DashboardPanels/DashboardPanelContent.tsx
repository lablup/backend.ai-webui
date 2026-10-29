/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  panelRefreshId,
  useDashboardFetchKey,
  useDashboardRefreshScheduler,
} from './DashboardRefreshContext';
import { resourceGroupRows } from './dashboardScope';
import { DEFAULT_RANGE } from './panelSettings';
import { rangeToDateTimeFilter } from './timeRange';
import type {
  DashboardScope,
  DashboardVars,
  PanelDefinition,
  PersistedPanelV2,
} from './types';
import { useDashboardFilterContext } from './useDashboardFilters';
import React, { useDeferredValue } from 'react';

export interface DashboardPanelState {
  scope: DashboardScope;
  vars: DashboardVars;
  fetchKey: string;
  manualFetchKey: string;
  isRefetching: boolean;
  onRefresh: () => void;
}

export interface DashboardPanelContentProps {
  panel: PersistedPanelV2;
  definition: PanelDefinition;
  /** The page query is refetching (the cards that still read it). */
  isPageRefetching: boolean;
  children: (state: DashboardPanelState) => React.ReactNode;
}

/** Hands one card the page scope, its own settings resolved, and its own fetch key. */
const DashboardPanelContent: React.FC<DashboardPanelContentProps> = ({
  panel,
  definition,
  isPageRefetching,
  children,
}) => {
  'use memo';
  const filters = useDashboardFilterContext();
  const scheduler = useDashboardRefreshScheduler();
  const { fetchKey, manualFetchKey, refreshedAt } = useDashboardFetchKey(
    panelRefreshId(panel.id),
    definition.refresh.min,
  );
  // Deferred so a refresh suspends in the background instead of flashing the skeleton.
  const deferredFetchKey = useDeferredValue(fetchKey);
  const deferredManualFetchKey = useDeferredValue(manualFetchKey);
  const range = panel.settings?.range ?? DEFAULT_RANGE;
  const currentResourceGroup = filters?.currentResourceGroup ?? null;

  return children({
    scope: filters?.scope ?? {
      kind: 'mine',
      projectId: filters?.currentProjectId ?? null,
    },
    vars: {
      range,
      timeRange: rangeToDateTimeFilter(range, refreshedAt),
      refreshedAt,
      currentProjectId: filters?.currentProjectId ?? null,
      currentResourceGroup,
      resourceGroups: resourceGroupRows(
        panel.settings?.resourceGroups,
        currentResourceGroup,
      ),
    },
    fetchKey: deferredFetchKey,
    manualFetchKey: deferredManualFetchKey,
    isRefetching: isPageRefetching || fetchKey !== deferredFetchKey,
    onRefresh: () => scheduler?.refreshAll(),
  });
};

export default DashboardPanelContent;
