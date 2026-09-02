import './BAICountdownBorder.css';
import { useTheme } from '@astryxdesign/core/theme';
import React, { useEffect, useRef, useState } from 'react';

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
   * When true, freezes the fill animation (`animation-play-state: paused`) and
   * hides the border entirely (`visibility: hidden`) instead of advancing. Use
   * it while the wrapped control's refresh is in flight, so no stale countdown
   * is visible before the real refresh happens.
   */
  paused?: boolean;
  /**
   * Style for the wrapper element. The border's own appearance is taken from
   * the same object via standard CSS properties:
   * - `stroke` — border color (default `var(--color-accent)`, so it follows the
   *   accent of whichever Astryx theme subtree the border is rendered in)
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
 * <BAICountdownBorder durationMs={5000} style={{ stroke: 'var(--color-error)' }}>
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
  paused = false,
}) => {
  'use memo';
  const { token } = useTheme();
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
    // The accent CSS var, not a `theme.useToken()` read: per-menu accents come
    // from a nested Astryx <Theme> subtree the shim's static seeds never see.
    stroke = 'var(--color-accent)',
    strokeWidth = 1.5,
    borderRadius = token('--radius-inner'),
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
            // While paused (refresh in flight) the border must be fully
            // invisible — even at offset 100 the dash boundary can render a
            // tiny stroke sliver at the path start.
            visibility: paused ? 'hidden' : 'visible',
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
            strokeWidth={strokeWidth}
            pathLength={100}
            strokeDasharray={100}
            className="bai-countdown-border-fill"
            style={{
              // As a CSS property, not the `stroke` presentation attribute —
              // `var()` does not substitute in presentation attributes.
              stroke,
              animationDuration: `${durationMs}ms`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          />
        </svg>
      )}
    </div>
  );
};

export default BAICountdownBorder;
