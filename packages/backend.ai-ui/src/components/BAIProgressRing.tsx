/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './BAIProgressRing.css';
import classNames from 'classnames';
import React from 'react';

// The ring is drawn in a 16-unit square; `size` scales the whole thing, so
// these are user-space geometry and never a styling quantity.
const VIEWBOX_SIZE = 16;
const CENTER = VIEWBOX_SIZE / 2;

/** Share of the circumference the indeterminate arc covers. */
const INDETERMINATE_ARC_FRACTION = 0.25;

/**
 * Shortest the drawn arc may ever look, in user units of the viewBox. An empty
 * ring is a bare track, which hides the rotation that says work is still
 * moving. `stroke-linecap: round` adds `strokeWidth / 2` past each end of the
 * dash, so the dash itself only has to make up what the two caps do not.
 */
const MIN_VISIBLE_ARC = 5;

/**
 * Shortest the gap left by the drawn arc may ever look, in user units. Below
 * this the ring reads as a closed circle and the rotation stops being
 * perceptible. The two round caps eat `strokeWidth` out of the gap.
 */
const MIN_VISIBLE_GAP = 3;

const ringRadius = (strokeWidth: number) => Math.max(0.5, CENTER - strokeWidth);

/**
 * The percent range the determinate ring is allowed to DRAW. Both bounds fall
 * out of the geometry `strokeWidth` fixes — the radius, hence the
 * circumference, and the `strokeWidth` the two round caps add to the arc and
 * take out of the gap — so they hold at any stroke: 7.96%..86.74% at the
 * default 2, 0%..57.6% at 5. Only the drawn arc is bounded; `aria-valuenow`
 * always carries the true percent.
 */
export const getVisibleArcRange = (
  strokeWidth: number,
): { min: number; max: number } => {
  const circumference = 2 * Math.PI * ringRadius(strokeWidth);
  const asPercent = (dash: number) => (dash / circumference) * 100;

  const max = Math.min(
    100,
    asPercent(Math.max(0, circumference - strokeWidth - MIN_VISIBLE_GAP)),
  );
  const min = Math.min(
    asPercent(Math.max(0, MIN_VISIBLE_ARC - strokeWidth)),
    max,
  );

  return { min, max };
};

// `rotate` is Omitted because it is redefined: SVG has a `rotate` presentation
// attribute of its own (`string | number`), which this boolean replaces.
export interface BAIProgressRingProps extends Omit<
  React.SVGProps<SVGSVGElement>,
  'children' | 'rotate'
> {
  /**
   * Completion in percent, clamped to 0..100. Leave it out (or pass a
   * non-finite number) for the indeterminate ring — a short arc spinning at
   * the same 1s as the `.bai-icon-spin` glyph.
   *
   * The value reported to assistive technology is this one. The arc that gets
   * DRAWN is additionally pinned into `getVisibleArcRange(strokeWidth)`, so it
   * never reaches empty or full and the slow rotation stays visible at both
   * ends; everything between the two bounds is drawn honestly.
   */
  percent?: number;
  /**
   * Rendered size of the square the ring is drawn in. The default follows the
   * font size, so the ring lines up with the text of whatever carries it.
   * @default '1em'
   */
  size?: string | number;
  /**
   * Stroke width of both circles, in user units of the 16-unit viewBox. The
   * radius follows it, so the stroke always stays inside the box.
   * @default 2
   */
  strokeWidth?: number;
  /**
   * Whether the determinate ring keeps turning slowly (~2.4s per turn) so it
   * still reads as "in progress" between two updates. The indeterminate ring
   * always spins — the spin is the only thing it has to say.
   * @default true
   */
  rotate?: boolean;
}

/**
 * A progress ring sized to be used as an icon — the `icon` slot of an Astryx
 * `Badge`, next to a label, inside a button. Both circles are stroked with
 * `currentColor`, so the ring takes the colour of whatever carries it.
 *
 * ```tsx
 * <Badge variant="warning" icon={<BAIProgressRing percent={99} />} label="TERMINATING" />
 * <Badge variant="warning" icon={<BAIProgressRing />} label="TERMINATING" />
 * ```
 *
 * With a `percent` it is a `progressbar` to assistive technology; without one
 * it is decorative (`aria-hidden`) unless an `aria-label` names it. The
 * reported value is the true one; the drawn arc never reaches empty or full —
 * `getVisibleArcRange` derives both bounds from `strokeWidth` — so the ring
 * keeps reading as "in progress" at 0% and at 100%, at any stroke.
 */
const BAIProgressRing: React.FC<BAIProgressRingProps> = ({
  percent,
  size = '1em',
  strokeWidth = 2,
  rotate = true,
  className,
  'aria-label': ariaLabel,
  ...svgProps
}) => {
  'use memo';
  const radius = ringRadius(strokeWidth);
  const circumference = 2 * Math.PI * radius;

  const isDeterminate = typeof percent === 'number' && Number.isFinite(percent);
  const value = isDeterminate ? Math.min(100, Math.max(0, percent)) : undefined;
  // Only the extremes are pinned; 50% still draws half.
  const visibleArcRange = getVisibleArcRange(strokeWidth);
  const drawnPercent = isDeterminate
    ? Math.min(
        visibleArcRange.max,
        Math.max(visibleArcRange.min, value as number),
      )
    : undefined;

  const dash = isDeterminate
    ? {
        strokeDasharray: circumference,
        strokeDashoffset: circumference * (1 - (drawnPercent as number) / 100),
      }
    : {
        strokeDasharray: `${circumference * INDETERMINATE_ARC_FRACTION} ${
          circumference * (1 - INDETERMINATE_ARC_FRACTION)
        }`,
        strokeDashoffset: 0,
      };

  const accessibility = isDeterminate
    ? ({
        role: 'progressbar',
        'aria-label': ariaLabel,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': value,
        'aria-valuetext': `${value}%`,
      } as const)
    : ariaLabel
      ? ({ role: 'img', 'aria-label': ariaLabel } as const)
      : ({ 'aria-hidden': true } as const);

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      width={size}
      height={size}
      fill="none"
      className={classNames(
        'bai-progress-ring',
        isDeterminate
          ? rotate && 'bai-progress-ring-spin'
          : 'bai-progress-ring-indeterminate',
        className,
      )}
      {...accessibility}
      {...svgProps}
    >
      <circle
        className="bai-progress-ring-track"
        cx={CENTER}
        cy={CENTER}
        r={radius}
        strokeWidth={strokeWidth}
      />
      <circle
        className="bai-progress-ring-arc"
        cx={CENTER}
        cy={CENTER}
        r={radius}
        strokeWidth={strokeWidth}
        {...dash}
      />
    </svg>
  );
};

export default BAIProgressRing;
