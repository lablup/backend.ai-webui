/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { BAIBoardItem } from '../BAIBoard';

/** A board item's persisted layout slice: id + spans + offset, no content. */
export type BoardLayoutEntry = Omit<BAIBoardItem, 'data'>;

export interface ReconcileBoardLayoutInput {
  /** The unified `dashboard_board_items` list as persisted (may be empty). */
  persistedLayout: ReadonlyArray<BoardLayoutEntry>;
  /** Seed layout for every renderable id, in seed order (built-in then custom). */
  defaultLayout: ReadonlyArray<BoardLayoutEntry>;
  /** Ids that currently resolve to content; persisted entries outside it drop. */
  renderableIds: ReadonlySet<string>;
}

/**
 * Unified board order: persisted order first (filtered to ids that still
 * render), then any default-layout ids not yet persisted, appended in seed
 * order.
 */
export const reconcileBoardLayout = ({
  persistedLayout,
  defaultLayout,
  renderableIds,
}: ReconcileBoardLayoutInput): Array<BoardLayoutEntry> => {
  const persistedIds = new Set(persistedLayout.map((item) => item.id));
  return [
    ...persistedLayout.filter((item) => renderableIds.has(item.id)),
    ...defaultLayout.filter((item) => !persistedIds.has(item.id)),
  ];
};

/**
 * The list to persist after the board reports a change. Cloudscape only reports
 * the items it is rendering, so entries for ids that are currently hidden — a
 * custom panel while the feature is opted out, a built-in gated off by role —
 * would be dropped by a plain overwrite, losing their saved geometry. They are
 * carried over instead, after the reported ones, in their previous order.
 */
export const mergeHiddenLayoutEntries = (
  reported: ReadonlyArray<BoardLayoutEntry>,
  previous: ReadonlyArray<BoardLayoutEntry>,
): Array<BoardLayoutEntry> => {
  const reportedIds = new Set(reported.map((item) => item.id));
  return [...reported, ...previous.filter((item) => !reportedIds.has(item.id))];
};
