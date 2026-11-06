/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  panelRefreshId,
  useDashboardFetchKey,
  useDashboardRefreshScheduler,
} from './DashboardRefreshContext';
import { cardResourceGroup } from './dashboardScope';
import {
  PanelPermissionBoundary,
  PanelPermissionContext,
  deniedNoticeKeyOf,
} from './panelPermission';
import { DEFAULT_RANGE } from './panelSettings';
import { rangeToDateTimeFilter } from './timeRange';
import type { DashboardScope, DashboardVars, PersistedPanelV2 } from './types';
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
  /** The page query is refetching (the cards that still read it). */
  isPageRefetching: boolean;
  /** A user-made panel: denied, it shows a notice instead of being hidden. */
  isUserPanel?: boolean;
  /** Frames the denied notice when the card's own frame is not rendered. */
  deniedFrame?: (body: React.ReactNode) => React.ReactNode;
  children: (state: DashboardPanelState) => React.ReactNode;
}

/** Hands one card the page scope, its own settings resolved, and its own fetch key. */
const DashboardPanelContent: React.FC<DashboardPanelContentProps> = ({
  panel,
  isPageRefetching,
  isUserPanel = false,
  deniedFrame,
  children,
}) => {
  'use memo';
  const filters = useDashboardFilterContext();
  const scheduler = useDashboardRefreshScheduler();
  const { fetchKey, manualFetchKey, refreshedAt, isPending } =
    useDashboardFetchKey(panelRefreshId(panel.id));
  // Deferred so a refresh suspends in the background instead of flashing the skeleton.
  const deferredFetchKey = useDeferredValue(fetchKey);
  const deferredManualFetchKey = useDeferredValue(manualFetchKey);
  const range = panel.settings?.range ?? DEFAULT_RANGE;
  const currentResourceGroup = filters?.currentResourceGroup ?? null;

  const { resourceGroups, ...otherSettings } = panel.settings ?? {};
  const permission = {
    panelId: panel.id,
    noticeKey: deniedNoticeKeyOf({
      resourceGroups,
      hasOtherSetting: Object.keys(otherSettings).length > 0,
      isUserPanel,
    }),
  };

  const scope = filters?.scope ?? {
    kind: 'mine' as const,
    projectId: filters?.currentProjectId ?? null,
  };
  const resourceGroup = cardResourceGroup(
    panel.settings?.resourceGroups,
    currentResourceGroup,
  );
  const content = children({
    scope,
    vars: {
      range,
      timeRange: rangeToDateTimeFilter(range, refreshedAt),
      refreshedAt,
      currentProjectId: filters?.currentProjectId ?? null,
      currentResourceGroup,
      resourceGroup,
    },
    fetchKey: deferredFetchKey,
    manualFetchKey: deferredManualFetchKey,
    isRefetching: isPageRefetching || isPending,
    onRefresh: () => scheduler?.refreshAll(),
  });
  return (
    <PanelPermissionContext value={permission}>
      <PanelPermissionBoundary
        frame={deniedFrame}
        // What the card reads: a denied card retries once any of it changes.
        resetKeys={[
          deferredManualFetchKey,
          JSON.stringify(panel.settings ?? null),
          JSON.stringify(scope),
          resourceGroup,
        ]}
      >
        {content}
      </PanelPermissionBoundary>
    </PanelPermissionContext>
  );
};

export default DashboardPanelContent;
