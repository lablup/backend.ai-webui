/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
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
import React from 'react';

export interface DashboardFilterBarProps {
  filters: DashboardFilters;
  isRefetching: boolean;
  /** The board tabs, on the pages that keep several boards. */
  children?: React.ReactNode;
}

/**
 * The dashboard-level bar: the board tabs, and at the right the one refresh
 * control. Its interval drives every card's automatic refresh; a click
 * refreshes every card now.
 */
const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  filters,
  isRefetching,
  children,
}) => {
  'use memo';
  const scheduler = useDashboardRefreshScheduler();
  const lastRefreshAt = useDashboardLastRefreshAt();

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
      <BAIFetchKeyButton
        size="small"
        loading={isRefetching}
        value=""
        showLastLoadTime
        lastLoadTime={
          lastRefreshAt === null ? undefined : new Date(lastRefreshAt)
        }
        autoUpdateDelay={refreshToMs(filters.refresh)}
        autoUpdateDelayOptions={REFRESH_DELAY_OPTIONS}
        onChangeAutoUpdateDelay={(delayMs) =>
          filters.setRefresh(msToRefresh(delayMs))
        }
        onChange={(_fetchKey, { isAuto }) => {
          if (isAuto) scheduler?.tick();
          else scheduler?.refreshAll();
        }}
      />
    </BAIFlex>
  );
};

export default DashboardFilterBar;
