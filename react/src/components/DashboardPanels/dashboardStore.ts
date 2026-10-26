/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DashboardPageConfig, PanelPage } from './types';
import { createWriteQueue, type WriteBatch } from './writeQueue';

export const DASHBOARD_WRITE_DELAY_MS = 800;

export interface DashboardWriter {
  /** Queues a page's boards behind the debounce. Rejects when the write fails. */
  save: (page: PanelPage, config: DashboardPageConfig) => Promise<void>;
  /**
   * Upserts the board migrated from localStorage (already flagged by
   * `resolveBoards`) at most once per page, and
   * calls `clearLocal` only after the upsert succeeded. Null when the page
   * already started its migration.
   */
  migrate: (
    page: PanelPage,
    migration: DashboardPageConfig,
    clearLocal: () => void,
  ) => Promise<void> | null;
  flush: () => Promise<void>;
}

/** Every written page config carries the flag, so the migration never runs again. */
export const withMigratedFlag = (
  config: DashboardPageConfig,
): DashboardPageConfig => ({ ...config, migrated: true });

export const createDashboardWriter = ({
  write,
  delay = DASHBOARD_WRITE_DELAY_MS,
}: {
  write: (batch: WriteBatch<PanelPage, DashboardPageConfig>) => Promise<void>;
  delay?: number;
}): DashboardWriter => {
  const queue = createWriteQueue<PanelPage, DashboardPageConfig>({
    write,
    delay,
  });
  const startedMigrations = new Set<PanelPage>();
  return {
    save: (page, config) => queue.schedule(page, config),
    migrate: (page, migration, clearLocal) => {
      if (startedMigrations.has(page)) return null;
      startedMigrations.add(page);
      return queue
        .schedule(page, migration, { immediate: true })
        .then(clearLocal, () => {});
    },
    flush: queue.flush,
  };
};
