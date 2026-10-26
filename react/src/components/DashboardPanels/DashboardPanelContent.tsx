/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useDashboardFetchKey,
  useDashboardRefreshScheduler,
} from './DashboardRefreshContext';
import { DEFAULT_BOARD_VARS } from './dashboardConfig';
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

/** Hands one card the filter bar's values and its own fetch key from the refresh timer. */
const DashboardPanelContent: React.FC<DashboardPanelContentProps> = ({
  panel,
  definition,
  isPageRefetching,
  children,
}) => {
  'use memo';
  const filters = useDashboardFilterContext();
  const scheduler = useDashboardRefreshScheduler();
  const { fetchKey, refreshedAt } = useDashboardFetchKey(
    `panel:${panel.id}`,
    definition.refresh.min,
  );
  // Deferred so a refresh suspends in the background instead of flashing the skeleton.
  const deferredFetchKey = useDeferredValue(fetchKey);
  const range = filters?.vars.range ?? DEFAULT_BOARD_VARS.range;

  return children({
    scope: filters?.scope ?? {
      kind: 'mine',
      projectId: filters?.currentProjectId ?? null,
      rgs: 'all',
    },
    vars: {
      range,
      timeRange: rangeToDateTimeFilter(range, refreshedAt),
      currentProjectId: filters?.currentProjectId ?? null,
      currentResourceGroup: filters?.currentResourceGroup ?? null,
    },
    fetchKey: deferredFetchKey,
    isRefetching: isPageRefetching || fetchKey !== deferredFetchKey,
    onRefresh: () => scheduler?.refreshAll(),
  });
};

export default DashboardPanelContent;
