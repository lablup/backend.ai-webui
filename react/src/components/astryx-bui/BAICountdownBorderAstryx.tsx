/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 6 (cn-oss-removal / ticket 10, item 6) — `BAICountdownBorder`
 ported off antd.

 Phases 3 and 4 dropped this and annotated it as "a bespoke SVG/CSS animation
 with no Astryx counterpart". That was true about Astryx and wrong about the
 cost: the mechanism is **not** an antd feature at all. Reading
 `packages/backend.ai-ui/src/components/BAICountdownBorder.tsx` shows the only
 antd surface is (a) `theme.useToken()` for the default stroke colour and
 (b) `antd-style`'s `createStyles` as the keyframe authoring vehicle. The
 animation itself is a plain SVG `stroke-dashoffset` sweep on a `pathLength=100`
 rounded rect. Both antd surfaces have direct replacements:

 | BUI (antd)                          | here                                  |
 |-------------------------------------|---------------------------------------|
 | `theme.useToken().colorPrimaryHover`| `var(--color-accent)` (Astryx token)   |
 | `createStyles` keyframes            | a plain class in `react/src/index.css` |

 Using `var(--color-accent)` is the load-bearing part: the accent is what
 `defineTheme()` regenerates per brand, and it is scoped by the nested
 `<Theme>`, so the countdown on THIS page renders in the admin blue while the
 same component elsewhere renders in Backend.AI orange — automatically, with no
 prop. The antd original had to be handed a token by its caller.

 Behaviour reproduced exactly from BUI:
 - one full clockwise sweep per `durationMs`, restarting each cycle;
 - `resetKey` re-mounts the `<rect>` so the sweep re-anchors on the render that
   actually triggered the refresh, instead of drifting on its own schedule;
 - `paused` freezes the animation AND hides the border (`visibility: hidden`)
   so no stale countdown shows while a refresh is in flight — the BUI comment
   notes that even at offset 100 a one-pixel sliver can survive at the path
   start, which is why hiding is needed on top of pausing;
 - a `ResizeObserver` sizes the outline to the wrapped control.

 IMPROVEMENT over the original (one line, recorded the same way P8 was):
 `prefers-reduced-motion` now leaves the border **fully drawn** instead of
 blank. BUI's rule was `animation: none`, which freezes `stroke-dashoffset` at
 its initial `100` — i.e. an invisible outline — so reduced-motion users lost
 the "auto-refresh is armed" affordance entirely. Pinning `stroke-dashoffset: 0`
 keeps the affordance and drops only the motion.
*/
import './astryxBui.css';
import React, { useEffect, useRef, useState } from 'react';

export interface BAICountdownBorderAstryxProps {
  children?: React.ReactNode;
  /** Duration (ms) of one full clockwise fill cycle. */
  durationMs: number;
  /** Whether the border is drawn at all. */
  animated?: boolean;
  /** Changing this restarts the sweep from the beginning on this render. */
  resetKey?: React.Key;
  /** Freeze and hide the border (refresh in flight). */
  paused?: boolean;
  /** Stroke colour. Defaults to the Astryx accent, so it follows the theme. */
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
  className?: string;
  style?: React.CSSProperties;
}

const BAICountdownBorderAstryx: React.FC<BAICountdownBorderAstryxProps> = ({
  children,
  durationMs,
  animated = true,
  resetKey,
  paused = false,
  stroke = 'var(--color-accent)',
  strokeWidth = 1.5,
  borderRadius = 6,
  className,
  style,
}) => {
  'use memo';
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

  return (
    // `position: relative` is pinned last — the absolute overlay depends on it
    // and must not be clobbered by a consumer's `style` (BUI convention).
    <div
      ref={ref}
      className={className}
      style={{ display: 'inline-flex', ...style, position: 'relative' }}
    >
      {children}
      {animated && w > 0 && h > 0 ? (
        // `overflow: visible` + a rect filling the whole box centres the stroke
        // on the content's border line, so its outer half stays visible over an
        // opaque child.
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
            stroke={stroke}
            strokeWidth={strokeWidth}
            pathLength={100}
            strokeDasharray={100}
            className="bai-countdown-border-fill"
            style={{
              animationDuration: `${durationMs}ms`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          />
        </svg>
      ) : null}
    </div>
  );
};

export default BAICountdownBorderAstryx;
