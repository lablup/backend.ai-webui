/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIResourceUnitGridSkeleton` (FR-3569) — Suspense fallback shaped like
 `BAIResourceUnitGrid`: toolbar + legend + a lattice of plates, built from the
 SAME layout tokens the real grid reads (`BAIResourceUnitGrid.geometry.ts`),
 so nothing pops on data arrival.
*/
import BAIFlex from './BAIFlex';
import './BAIResourceUnitGridSkeleton.css';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import classNames from 'classnames';
import React from 'react';

const DEFAULT_GROUP_COUNT = 6;
/** Varied so plates read like real sessions rather than a uniform block. */
const PLATE_CELL_COUNTS = [12, 4, 24, 6, 9, 16] as const;

/** No token backs the toolbar's control widths (they're per-control, not a scale). */
const TOOLBAR_PILL_WIDTHS = [140, 180, 100] as const;
const TOOLBAR_PILL_HEIGHT = 'var(--size-element-sm)';

const LEGEND_ITEM_COUNT = 5;
const LEGEND_SWATCH_SIZE = 10;
const LEGEND_LABEL_WIDTH = 40;
const LEGEND_LABEL_HEIGHT = 12;

/** Lattice cell size/gap: same custom properties `readMetricsFromDOM` reads. */
const CELL_SIZE = 'var(--spacing-4)';
/** BAIFlex's `gap` prop takes a number, not a `var()` string — 2 mirrors the
 * current `--spacing-0-5` value; keep in sync with BAIResourceUnitGrid.css. */
const CELL_GAP_PX = 2;

export interface BAIResourceUnitGridSkeletonProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /**
   * Plate count. Cycles through the fixed cell-count array by index, so any
   * value (including one larger than the array) yields a plausible lattice.
   * @default 6
   */
  groupCount?: number;
}

const BAIResourceUnitGridSkeleton: React.FC<
  BAIResourceUnitGridSkeletonProps
> = ({ groupCount = DEFAULT_GROUP_COUNT, className, ...rest }) => {
  'use memo';
  // One running index across every box so the shimmer reads as a single wave.
  let waveIndex = 0;

  const plateCellCounts = Array.from(
    { length: Math.max(0, groupCount) },
    (_unused, i) => PLATE_CELL_COUNTS[i % PLATE_CELL_COUNTS.length],
  );

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="sm"
      className={classNames('bai-resource-unit-grid-skeleton', className)}
      {...rest}
    >
      <BAIFlex gap="sm" align="center">
        {TOOLBAR_PILL_WIDTHS.map((width, i) => (
          <Skeleton
            key={i}
            width={width}
            height={TOOLBAR_PILL_HEIGHT}
            radius={2}
            index={waveIndex++}
          />
        ))}
      </BAIFlex>
      <BAIFlex gap="sm" wrap="wrap" align="center">
        {Array.from({ length: LEGEND_ITEM_COUNT }, (_unused, i) => (
          <BAIFlex key={i} gap={4} align="center">
            <Skeleton
              width={LEGEND_SWATCH_SIZE}
              height={LEGEND_SWATCH_SIZE}
              radius={1}
              index={waveIndex++}
            />
            <Skeleton
              width={LEGEND_LABEL_WIDTH}
              height={LEGEND_LABEL_HEIGHT}
              radius={1}
              index={waveIndex++}
            />
          </BAIFlex>
        ))}
      </BAIFlex>
      <BAIFlex gap="sm" wrap="wrap" align="start">
        {plateCellCounts.map((cellCount, plateIdx) => (
          <BAIFlex
            key={plateIdx}
            wrap="wrap"
            gap={CELL_GAP_PX}
            className="bai-resource-unit-grid-skeleton-plate"
          >
            {Array.from({ length: cellCount }, (_unused, cellIdx) => (
              <Skeleton
                key={cellIdx}
                className="bai-resource-unit-grid-skeleton-cell"
                width={CELL_SIZE}
                height={CELL_SIZE}
                radius={1}
                index={waveIndex++}
              />
            ))}
          </BAIFlex>
        ))}
      </BAIFlex>
    </BAIFlex>
  );
};

export default BAIResourceUnitGridSkeleton;
