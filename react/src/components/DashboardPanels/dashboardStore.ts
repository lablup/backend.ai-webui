/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DashboardPageConfig, PanelPage } from './types';
import { createWriteQueue, type WriteBatch } from './writeQueue';
import * as _ from 'lodash-es';

export const DASHBOARD_WRITE_DELAY_MS = 800;

export type PageConfigUpdate = (
  config: DashboardPageConfig,
) => DashboardPageConfig;

/** One page's queued change, replayed on the server value at write time. */
export interface PageWrite {
  /** The edits made since the last write, oldest first. */
  update: PageConfigUpdate;
  /** Turns the stored value (possibly absent or corrupt) into a page config. */
  resolve: (stored: unknown) => DashboardPageConfig;
  /** What the screen shows for the page until the write settles. */
  optimistic: DashboardPageConfig;
}

export interface DashboardWriter {
  /** Queues a page's change behind the debounce. Rejects when the write fails. */
  save: (page: PanelPage, write: PageWrite) => Promise<void>;
  flush: () => Promise<void>;
}

/** The config `update` produces, or null when it changes nothing worth a write. */
export const applyPageUpdate = (
  config: DashboardPageConfig,
  update: PageConfigUpdate,
): DashboardPageConfig | null => {
  const next = update(config);
  return _.isEqual(next, config) ? null : next;
};

/** A newer change on top of a queued one: both updates run, the newer screen state wins. */
export const combinePageWrites = (
  previous: PageWrite,
  next: PageWrite,
): PageWrite => ({
  ...next,
  update: (config) => next.update(previous.update(config)),
});

export const createDashboardWriter = ({
  write,
  delay = DASHBOARD_WRITE_DELAY_MS,
}: {
  write: (batch: WriteBatch<PanelPage, PageWrite>) => Promise<void>;
  delay?: number;
}): DashboardWriter => {
  const queue = createWriteQueue<PanelPage, PageWrite>({
    write,
    delay,
    combine: combinePageWrites,
  });
  return {
    save: (page, pageWrite) => queue.schedule(page, pageWrite),
    flush: queue.flush,
  };
};
