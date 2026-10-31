/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
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
