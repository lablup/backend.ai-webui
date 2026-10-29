/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { refreshIntervalMs } from './refreshScheduler';
import type { PanelDefinition, RefreshInterval } from './types';
import * as _ from 'lodash-es';

/** The page query's fragments and the cards that read each one. */
export const PAGE_QUERY_PANELS = {
  sessionCount: ['mySession', 'activeSessions'],
  recentSessions: ['recentlyCreatedSession'],
  totalResource: ['totalResourceWithinResourceGroup'],
  agentStats: ['agentStats'],
} as const satisfies Record<string, ReadonlyArray<string>>;

export type PageQueryFragment = keyof typeof PAGE_QUERY_PANELS;

const FRAGMENTS = _.keys(PAGE_QUERY_PANELS) as Array<PageQueryFragment>;

/** The fragments some rendered card reads, in a stable order. */
export const pageQueryFragments = (
  renderedKeys: ReadonlySet<string>,
): Array<PageQueryFragment> =>
  FRAGMENTS.filter((fragment) =>
    PAGE_QUERY_PANELS[fragment].some((key) => renderedKeys.has(key)),
  );

/**
 * How often the page query refreshes: as often as its fastest rendered card
 * asks, never faster than `floor`. Null when no rendered card reads it.
 */
export const pageQueryRefresh = (
  renderedKeys: ReadonlySet<string>,
  catalog: ReadonlyArray<PanelDefinition>,
  floor: RefreshInterval,
): RefreshInterval | null => {
  const readerKeys = new Set<string>(_.flatMap(PAGE_QUERY_PANELS));
  const fastest = _.minBy(
    catalog.filter(
      (definition) =>
        readerKeys.has(definition.key) && renderedKeys.has(definition.key),
    ),
    (definition) => refreshIntervalMs(definition.refresh.min),
  )?.refresh.min;
  if (!fastest) return null;
  return refreshIntervalMs(fastest) > refreshIntervalMs(floor)
    ? fastest
    : floor;
};
