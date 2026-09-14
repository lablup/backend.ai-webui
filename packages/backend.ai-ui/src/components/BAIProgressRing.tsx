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
 * Shortest arc the determinate ring ever draws, in percent. An empty ring is
 * a bare track, which hides the rotation that says the work is still moving.
 */
export const BAI_PROGRESS_RING_MIN_VISIBLE_PERCENT = 8;

/**
 * Longest arc the determinate ring ever draws, in percent. The bound is
 * geometry, not taste: `stroke-linecap: round` grows the arc by
 * `strokeWidth / 2` at each end, so at the default stroke 86% leaves
 * `37.7 - 0.86 * 37.7 - 2` = 3.3 user units open — a gap, not a seam.
 */
export const BAI_PROGRESS_RING_MAX_VISIBLE_PERCENT = 86;

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
   * DRAWN is additionally pinned into
   * `BAI_PROGRESS_RING_MIN_VISIBLE_PERCENT..BAI_PROGRESS_RING_MAX_VISIBLE_PERCENT`,
   * so it never reaches empty or full and the slow rotation stays visible at
   * both ends; everything between the two bounds is drawn honestly.
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
 * reported value is the true one; the drawn arc never reaches empty or full,
 * so the ring keeps reading as "in progress" at 0% and at 100%.
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
  const radius = Math.max(0.5, CENTER - strokeWidth);
  const circumference = 2 * Math.PI * radius;

  const isDeterminate = typeof percent === 'number' && Number.isFinite(percent);
  const value = isDeterminate ? Math.min(100, Math.max(0, percent)) : undefined;
  // Only the extremes are pinned; 50% still draws half.
  const drawnPercent = isDeterminate
    ? Math.min(
        BAI_PROGRESS_RING_MAX_VISIBLE_PERCENT,
        Math.max(BAI_PROGRESS_RING_MIN_VISIBLE_PERCENT, value as number),
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
