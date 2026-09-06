/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIResourceUnitGridSkeleton` (FR-3569) — Suspense fallback for
 `BAIResourceUnitGrid`: toolbar + legend bars, then a deliberately
 low-fidelity stand-in for the lattice (two blocks per row) — mimicking
 per-session plates and cells read as false detail while loading.
*/
import BAIFlex from './BAIFlex';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import classNames from 'classnames';
import React from 'react';

const DEFAULT_ROW_COUNT = 3;

/** No token backs the toolbar's control widths (they're per-control, not a scale). */
const TOOLBAR_PILL_WIDTHS = [140, 180, 100] as const;
const TOOLBAR_PILL_HEIGHT = 'var(--size-element-sm)';

const LEGEND_ITEM_COUNT = 5;
const LEGEND_SWATCH_SIZE = 10;
const LEGEND_LABEL_WIDTH = 40;
const LEGEND_LABEL_HEIGHT = 12;

/** Two blocks per row, widths varied so rows read organic, not mechanical. */
const ROW_BLOCK_WIDTHS = [
  ['45%', '25%'],
  ['30%', '40%'],
  ['55%', '20%'],
] as const;
const ROW_BLOCK_HEIGHT = 'var(--size-element-sm)';

export interface BAIResourceUnitGridSkeletonProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /**
   * Lattice stand-in rows (two blocks each), cycling a fixed width pattern.
   * @default 3
   */
  rows?: number;
}

const BAIResourceUnitGridSkeleton: React.FC<
  BAIResourceUnitGridSkeletonProps
> = ({ rows = DEFAULT_ROW_COUNT, className, ...rest }) => {
  'use memo';
  // One running index across every box so the shimmer reads as a single wave.
  let waveIndex = 0;

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
      {Array.from({ length: Math.max(0, rows) }, (_unused, rowIdx) => {
        const widths = ROW_BLOCK_WIDTHS[rowIdx % ROW_BLOCK_WIDTHS.length];
        return (
          <BAIFlex
            key={rowIdx}
            gap="sm"
            align="center"
            className="bai-resource-unit-grid-skeleton-row"
          >
            {widths.map((width, blockIdx) => (
              <Skeleton
                key={blockIdx}
                width={width}
                height={ROW_BLOCK_HEIGHT}
                radius={1}
                index={waveIndex++}
              />
            ))}
          </BAIFlex>
        );
      })}
    </BAIFlex>
  );
};

export default BAIResourceUnitGridSkeleton;
