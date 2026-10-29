/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import DashboardEditToggleButton from '../DashboardEditToggleButton';
import {
  useDashboardLastRefreshAt,
  useDashboardRefreshScheduler,
} from './DashboardRefreshContext';
import {
  REFRESH_DELAY_OPTIONS,
  msToRefresh,
  refreshToMs,
} from './refreshScheduler';
import type { DashboardFilters } from './useDashboardFilters';
import { BAIFetchKeyButton, BAIFlex } from 'backend.ai-ui';
import React, { useEffect } from 'react';

export interface DashboardFilterBarProps {
  filters: DashboardFilters;
  isRefetching: boolean;
  /** The board tabs, on the pages that keep several boards. */
  children?: React.ReactNode;
}

/**
 * The dashboard-level bar: the board tabs, and at the right the one refresh
 * control and the edit toggle. The refresh interval drives every card's
 * automatic refresh; a click refreshes every card now.
 */
const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  filters,
  isRefetching,
  children,
}) => {
  'use memo';
  const scheduler = useDashboardRefreshScheduler();
  const lastRefreshAt = useDashboardLastRefreshAt();
  const refreshMs = refreshToMs(filters.refresh);
  useEffect(() => {
    scheduler?.setIntervalMs(refreshMs);
  }, [scheduler, refreshMs]);

  return (
    <BAIFlex
      direction="row"
      align="center"
      justify="between"
      gap="sm"
      data-testid="dashboard-filter-bar"
    >
      <BAIFlex
        direction="column"
        align="stretch"
        style={{ flex: 1, minWidth: 0 }}
      >
        {children}
      </BAIFlex>
      <BAIFlex direction="row" align="center" gap="xs">
        <BAIFetchKeyButton
          loading={isRefetching}
          value=""
          showLastLoadTime
          lastLoadTime={
            lastRefreshAt === null ? undefined : new Date(lastRefreshAt)
          }
          autoUpdateDelay={refreshMs}
          autoUpdateDelayOptions={REFRESH_DELAY_OPTIONS}
          onChangeAutoUpdateDelay={(delayMs) =>
            filters.setRefresh(msToRefresh(delayMs))
          }
          onChange={(_fetchKey, { isAuto }) => {
            if (isAuto) scheduler?.tick();
            else scheduler?.refreshAll();
          }}
        />
        <DashboardEditToggleButton />
      </BAIFlex>
    </BAIFlex>
  );
};

export default DashboardFilterBar;
