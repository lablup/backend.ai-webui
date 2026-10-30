/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './BAIResourceAreaGrid.css';
import classNames from 'classnames';
import React, { useState } from 'react';

export interface AreaGridShape {
  rows: number;
  cols: number;
}

export interface AreaGridBounds {
  columns: number;
  totalCells: number;
  availableCells: number;
}

const rowCount = ({ columns, totalCells }: AreaGridBounds) =>
  Math.max(0, Math.ceil(totalCells / Math.max(1, columns)));

/** Whether every cell of the top-left-anchored rectangle is available. */
export const isAreaShapeAvailable = (
  { rows, cols }: AreaGridShape,
  bounds: AreaGridBounds,
) =>
  rows >= 1 &&
  cols >= 1 &&
  cols <= bounds.columns &&
  rows <= rowCount(bounds) &&
  (rows - 1) * bounds.columns + (cols - 1) <
    Math.min(bounds.availableCells, bounds.totalCells);

const allShapes = (bounds: AreaGridBounds) => {
  const shapes: AreaGridShape[] = [];
  for (let rows = 1; rows <= rowCount(bounds); rows++) {
    for (let cols = 1; cols <= bounds.columns; cols++) {
      if (isAreaShapeAvailable({ rows, cols }, bounds))
        shapes.push({ rows, cols });
    }
  }
  return shapes;
};

/** Larger area first; on a tie, the wider shape. */
const compareShapes = (a: AreaGridShape, b: AreaGridShape) =>
  b.rows * b.cols - a.rows * a.cols || b.cols - a.cols;

/** The largest available rectangle whose area does not exceed `count`. */
export const areaShapeAtMost = (
  count: number,
  bounds: AreaGridBounds,
): AreaGridShape | undefined =>
  allShapes(bounds)
    .filter((s) => s.rows * s.cols <= count)
    .sort(compareShapes)[0];

/** The smallest available rectangle whose area reaches `count`. */
export const areaShapeAtLeast = (
  count: number,
  bounds: AreaGridBounds,
): AreaGridShape | undefined =>
  allShapes(bounds)
    .filter((s) => s.rows * s.cols >= count)
    .sort((a, b) => a.rows * a.cols - b.rows * b.cols || b.cols - a.cols)[0];

/**
 * Clamps a requested rectangle into the grid: the largest available
 * rectangle inside it, and never below `minCells`.
 */
export const clampAreaShape = (
  shape: AreaGridShape,
  bounds: AreaGridBounds,
  minCells: number,
): AreaGridShape | undefined => {
  const inside = allShapes(bounds)
    .filter((s) => s.rows <= shape.rows && s.cols <= shape.cols)
    .sort(compareShapes)[0];
  if (inside && inside.rows * inside.cols >= minCells) return inside;
  return areaShapeAtLeast(minCells, bounds);
};

export interface BAIResourceAreaGridProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'children' | 'color'
> {
  /** Cells per row. */
  columns: number;
  /** Cells drawn, available or not. */
  totalCells: number;
  /** Cells that can be selected, counted in reading order. Defaults to `totalCells`. */
  availableCells?: number;
  /** The selection never covers fewer cells than this. */
  minCells?: number;
  /** Selected cell count. A count no rectangle expresses shows the largest rectangle below it. */
  value?: number;
  onChange?: (count: number) => void;
  /** Fill of the selected cells, a CSS colour or `var()`. */
  color?: string;
  disabled?: boolean;
}

const BAIResourceAreaGrid: React.FC<BAIResourceAreaGridProps> = ({
  columns,
  totalCells,
  availableCells,
  minCells = 0,
  value = 0,
  onChange,
  color,
  disabled,
  className,
  style,
  ...divProps
}) => {
  'use memo';
  const bounds: AreaGridBounds = {
    columns: Math.max(1, Math.min(columns, totalCells || 1)),
    totalCells,
    availableCells: Math.min(availableCells ?? totalCells, totalCells),
  };

  // The shape the user drew; a count maps to several shapes (6 = 1×6 = 2×3).
  const [drawn, setDrawn] = useState<AreaGridShape>();
  const shape =
    drawn &&
    drawn.rows * drawn.cols === value &&
    isAreaShapeAvailable(drawn, bounds)
      ? drawn
      : areaShapeAtMost(value, bounds);

  const [isDragging, setIsDragging] = useState(false);

  const commit = (next: AreaGridShape | undefined) => {
    if (!next || disabled) return;
    setDrawn(next);
    const count = next.rows * next.cols;
    if (count !== value) onChange?.(count);
  };

  const cellAt = (event: React.PointerEvent) => {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const cell = element?.closest<HTMLElement>('[data-area-cell]');
    if (!cell || !event.currentTarget.contains(cell)) return undefined;
    return {
      rows: Number(cell.dataset.row) + 1,
      cols: Number(cell.dataset.col) + 1,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const target = cellAt(event);
    if (!target) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
    setIsDragging(true);
    // Pressing the bottom-right selected cell shrinks the selection.
    if (shape && target.rows === shape.rows && target.cols === shape.cols) {
      commit(
        clampAreaShape(
          shape.rows > 1
            ? { rows: shape.rows - 1, cols: shape.cols }
            : { rows: 1, cols: shape.cols - 1 },
          bounds,
          minCells,
        ),
      );
      return;
    }
    commit(clampAreaShape(target, bounds, minCells));
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const target = cellAt(event);
    if (target) commit(clampAreaShape(target, bounds, minCells));
  };

  const endDrag = () => setIsDragging(false);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const current = shape ?? { rows: 0, cols: 0 };
    let next: AreaGridShape | undefined;
    switch (event.key) {
      case 'ArrowRight':
        next = {
          ...current,
          rows: Math.max(1, current.rows),
          cols: current.cols + 1,
        };
        break;
      case 'ArrowLeft':
        next = { ...current, cols: current.cols - 1 };
        break;
      case 'ArrowDown':
        next = {
          ...current,
          cols: Math.max(1, current.cols),
          rows: current.rows + 1,
        };
        break;
      case 'ArrowUp':
        next = { ...current, rows: current.rows - 1 };
        break;
      case 'Home':
        next = areaShapeAtLeast(minCells, bounds);
        break;
      case 'End':
        next = areaShapeAtMost(Infinity, bounds);
        break;
      default:
        return;
    }
    event.preventDefault();
    if (!next) return;
    commit(
      event.key === 'Home' || event.key === 'End'
        ? next
        : isAreaShapeAvailable(next, bounds) &&
            next.rows * next.cols >= minCells
          ? next
          : undefined,
    );
  };

  const maxShape = areaShapeAtMost(Infinity, bounds);
  const selectedCount = shape ? shape.rows * shape.cols : 0;

  return (
    <div
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-valuemin={minCells}
      aria-valuemax={maxShape ? maxShape.rows * maxShape.cols : 0}
      aria-valuenow={selectedCount}
      aria-valuetext={
        shape ? `${selectedCount} (${shape.rows} × ${shape.cols})` : '0'
      }
      {...divProps}
      className={classNames(
        'bai-resource-area-grid',
        disabled && 'bai-resource-area-grid--disabled',
        className,
      )}
      style={
        {
          ...style,
          gridTemplateColumns: `repeat(${bounds.columns}, var(--bai-area-grid-cell))`,
          ...(color ? { '--bai-area-grid-fill': color } : {}),
        } as React.CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
    >
      {Array.from({ length: totalCells }, (_unused, index) => {
        const row = Math.floor(index / bounds.columns);
        const col = index % bounds.columns;
        const isAvailable = index < bounds.availableCells;
        const isSelected =
          !!shape && row < shape.rows && col < shape.cols && isAvailable;
        return (
          <span
            key={index}
            data-area-cell=""
            data-row={row}
            data-col={col}
            className={classNames(
              'bai-resource-area-grid__cell',
              isSelected && 'bai-resource-area-grid__cell--selected',
              !isAvailable && 'bai-resource-area-grid__cell--unavailable',
            )}
          />
        );
      })}
    </div>
  );
};

export default BAIResourceAreaGrid;
