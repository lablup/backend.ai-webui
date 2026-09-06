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
 * carried over instead, each spliced back at the index it held in `previous`,
 * so turning a hidden panel back on restores its position and not just its
 * size. Appending them would silently move every hidden panel to the end.
 */
export const mergeHiddenLayoutEntries = (
  reported: ReadonlyArray<BoardLayoutEntry>,
  previous: ReadonlyArray<BoardLayoutEntry>,
): Array<BoardLayoutEntry> => {
  const reportedIds = new Set(reported.map((item) => item.id));
  const merged = [...reported];
  // Ascending order matters: each splice is done against a list that already
  // holds every lower-indexed hidden entry, so the original indices land.
  previous.forEach((item, index) => {
    if (reportedIds.has(item.id)) return;
    merged.splice(Math.min(index, merged.length), 0, item);
  });
  return merged;
};
