import { theme } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useRef, useState } from 'react';

const useStyles = createStyles(({ css }) => ({
  // `pathLength={100}` normalizes the stroke length so the offset animation is
  // size-independent: draw the rounded-rect outline clockwise from the top-left
  // (0 → 100%) over one cycle, then reset. Disabled under reduced-motion.
  fill: css`
    @keyframes bai-countdown-border-fill {
      from {
        stroke-dashoffset: 100;
      }
      to {
        stroke-dashoffset: 0;
      }
    }
    animation-name: bai-countdown-border-fill;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
}));

export interface BAICountdownBorderProps {
  /** Content to wrap; the countdown border is drawn around it. */
  children?: React.ReactNode;
  /** Duration (ms) of one full clockwise fill cycle. */
  durationMs: number;
  /** Whether the fill animation runs (and the border is drawn). Defaults to `true`. */
  animated?: boolean;
  /** Class name applied to the wrapper element. */
  className?: string;
  /**
   * Changing this value restarts the fill animation from the beginning, right
   * on this render — instead of drifting on its own `animation-iteration-count:
   * infinite` schedule. Pass the same trigger that causes the real refresh
   * (e.g. a fetch-key bump) so the visual countdown never diverges from it.
   */
  resetKey?: React.Key;
  /**
   * Style for the wrapper element. The border's own appearance is taken from
   * the same object via standard CSS properties:
   * - `stroke` — border color (default `colorPrimaryHover`)
   * - `strokeWidth` — border thickness (default `1.5`)
   * - `borderRadius` — corner radius (default the `borderRadius` token)
   */
  style?: React.CSSProperties;
}

/**
 * Wraps its children with a rounded-rect border that fills clockwise (top-left →
 * top-right → bottom-right → bottom-left → back) over `durationMs`, resetting
 * each cycle — a countdown progress border. Used like antd's `BorderBeam`:
 *
 * ```tsx
 * <BAICountdownBorder durationMs={5000} style={{ stroke: token.colorPrimary }}>
 *   <SomeControl />
 * </BAICountdownBorder>
 * ```
 *
 * The wrapper measures its own box so the outline matches the content at any
 * size; the stroke is centered on the content's border line so it hugs the edge
 * and stays visible over opaque children. Respects `prefers-reduced-motion`.
 */
const BAICountdownBorder: React.FC<BAICountdownBorderProps> = ({
  children,
  durationMs,
  animated = true,
  className,
  style,
  resetKey,
}) => {
  'use memo';
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { w, h } = size;
  // Border appearance is read from `style` (CSS props), the rest passes through
  // to the wrapper element.
  const {
    stroke = token.colorPrimaryHover,
    strokeWidth = 1.5,
    borderRadius = token.borderRadius,
    ...wrapperStyle
  } = style ?? {};
  return (
    // Merge order follows the BUI convention (consumer `style` wins), except
    // `position: relative` is pinned last — the absolute border overlay depends
    // on it, so it must not be clobbered by a consumer's `style`.
    <div
      ref={ref}
      className={className}
      style={{ display: 'inline-flex', ...wrapperStyle, position: 'relative' }}
    >
      {children}
      {animated && w > 0 && h > 0 && (
        // `overflow: visible` + the rect filling the whole box centers the
        // stroke on the content's border line, so it hugs the edge (its outer
        // half sits outside and stays visible over opaque children).
        <svg
          aria-hidden
          width={w}
          height={h}
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'visible',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <rect
            key={resetKey}
            x={0}
            y={0}
            width={w}
            height={h}
            rx={borderRadius}
            ry={borderRadius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            pathLength={100}
            strokeDasharray={100}
            className={styles.fill}
            style={{ animationDuration: `${durationMs}ms` }}
          />
        </svg>
      )}
    </div>
  );
};

export default BAICountdownBorder;
