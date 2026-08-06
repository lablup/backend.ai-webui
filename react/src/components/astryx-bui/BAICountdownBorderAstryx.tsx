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

 RADIUS (user-reported bug, fixed): the overlay's corner radius must be the
 SAME token the wrapped control uses, or the sweep visibly cuts across the
 button's corners. It was hardcoded to 6px while Astryx `Button` resolves
 `--radius-element` = 0.625rem = **10px** at every size in theme-neutral.

 `rx` on an SVG `<rect>` cannot portably take a CSS variable — the CSS geometry
 properties (`rx`/`ry`) are Chrome 64+/Firefox 69+/Safari 17.4+, so a `var()`
 there would silently do nothing on older Safari, which is the same class of
 silent-CSS failure as P6/P17. Instead the radius is RESOLVED FROM THE DOM in
 the same `ResizeObserver` pass that measures the box:

   1. the wrapper's own computed corner radii, if any;
   2. otherwise the largest corner radius among full-height descendants — this
      is what makes a composite trigger work: our `ButtonGroup` wrapper computes
      `border-radius: 0`, and the silhouette's 10px corners live on the first
      and last `<button>`;
   3. otherwise the theme's `--radius-element`, read off the element (so a
      nested `<Theme>` wins) and converted from rem with the root font size.

 Reading it from the DOM also means the overlay tracks size variants and any
 future theme change for free — there is no number to keep in sync.

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

const parsePx = (value: string) => Number.parseFloat(value) || 0;

const maxCornerRadius = (style: CSSStyleDeclaration) =>
  Math.max(
    parsePx(style.borderTopLeftRadius),
    parsePx(style.borderTopRightRadius),
    parsePx(style.borderBottomLeftRadius),
    parsePx(style.borderBottomRightRadius),
  );

/**
 * The radius the wrapped control actually renders with, in px. See the header
 * note for why this is measured rather than expressed as `rx: var(--radius-*)`.
 */
function resolveRadiusPx(el: HTMLElement): number {
  const own = maxCornerRadius(getComputedStyle(el));
  if (own > 0) return own;

  // Composite triggers (e.g. `ButtonGroup`) put the silhouette's corners on
  // their full-height children, not on the wrapper. Only consider children that
  // span the wrapper's height, so an inner Badge or Icon cannot win.
  const height = el.clientHeight;
  let fromChildren = 0;
  for (const child of Array.from(el.querySelectorAll<HTMLElement>('*'))) {
    if (Math.abs(child.getBoundingClientRect().height - height) > 2) continue;
    fromChildren = Math.max(
      fromChildren,
      maxCornerRadius(getComputedStyle(child)),
    );
  }
  if (fromChildren > 0) return fromChildren;

  // Last resort: the theme token itself, read OFF THE ELEMENT so a nested
  // `<Theme>` scope wins, and converted from rem with the root font size.
  const token = getComputedStyle(el)
    .getPropertyValue('--radius-element')
    .trim();
  if (!token) return 0;
  if (token.endsWith('rem')) {
    const rootFontSize =
      parsePx(getComputedStyle(document.documentElement).fontSize) || 16;
    return parsePx(token) * rootFontSize;
  }
  return parsePx(token);
}

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
  /**
   * Corner radius in px. Omit (the default) to resolve it from the wrapped
   * control, which is what keeps it in step with the theme and with size
   * variants. Pass a number only to override.
   */
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
  borderRadius,
  className,
  style,
}) => {
  'use memo';
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0, radius: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () =>
      setBox({
        w: el.clientWidth,
        h: el.clientHeight,
        radius: resolveRadiusPx(el),
      });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = box;
  const radius = borderRadius ?? box.radius;

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
            rx={radius}
            ry={radius}
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
