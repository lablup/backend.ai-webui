/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 GAP COMPONENT 4/5 (to-astryx ticket 08) — `BAIBadgeCount`.

 MAPPING.md §3.8: antd `Badge` splits three ways, and two of them have homes —
 `status` + `text` becomes `StatusDot`, a standalone pill becomes Astryx
 `Badge`. The third, **the count/dot OVERLAY on a child**, is verdict NONE:
 Astryx has no count overlay and no `Badge.Ribbon`. The mapping's instruction
 is literal — "self-build: absolutely-positioned `Badge` in a
 `position:relative` wrapper. **Build once, reuse 8x**" — because eight pages
 each inventing their own overlay is the measured failure mode.

 MEASURED usage (prop-profiles.json, 15 files / 16 sites):
   count x6, dot x6, showZero x5, size="small" x5, offset x2
   (color x11 and status x2 belong to the OTHER two branches — a standalone
   pill and a StatusDot — and are deliberately not implemented here.)

 Supported: `count`, `hasDot`, `max` (the `99+` overflow), `showZero`,
 `offset`, `size`, `variant`, plus `title` for the accessible name.

 DROPPED: `color` (arbitrary hex — Astryx `Badge.variant` is a closed union,
 P5; the 11 sites that pass it are standalone pills, not overlays),
 `status`/`text` (-> `StatusDot`), `Badge.Ribbon`, `overflowCount` (renamed
 `max`), `styles`/`classNames` slot maps.

 OPEN DESIGN DECISION — the tab count-badge colour.
 antd's count badge was RED by default (`colorError`), and the app leans on
 that for "N problems" but ALSO uses the same component for neutral counts on
 tab labels, where the pilot's open question is accent-vs-fixed-blue. This
 component does NOT decide it: `variant` is a straight passthrough and, when
 omitted, Astryx's own `Badge` default (`neutral`) applies. Consequence to
 plan for: **a migrated call site that relied on antd's implicit red must now
 pass `variant="error"` explicitly.** That is the point — the colour becomes a
 visible decision at each of the 8 sites instead of an invisible default.
*/
import './BAIBadgeCountAstryx.css';
import { Badge } from '@astryxdesign/core/Badge';
import type { BadgeProps } from '@astryxdesign/core/Badge';
import React from 'react';

export interface BAIBadgeCountAstryxProps extends Omit<
  BadgeProps,
  'label' | 'icon'
> {
  /** The number (or node) shown in the overlay. antd `count`. */
  count?: number | React.ReactNode;
  /** Render a bare dot instead of a number. antd `dot`. */
  hasDot?: boolean;
  /**
   * Overflow ceiling — a count above this renders as `${max}+`.
   * antd's `overflowCount`.
   * @default 99
   */
  max?: number;
  /** Keep the overlay when `count` is 0. antd `showZero`. @default false */
  showZero?: boolean;
  /**
   * `[x, y]` pixel nudge of the overlay: +x moves right, +y moves down —
   * antd's sign convention, so the 2 measured sites port verbatim.
   */
  offset?: [number, number];
  /**
   * `small` shrinks the pill for dense rows (tab rails, table headers).
   * antd's `size="small"`, measured on 5 sites.
   * @default 'default'
   */
  size?: 'small' | 'default';
  /**
   * Accessible name for the overlay (P8). A dot has no text at all, and a bare
   * number rarely says what it counts — `title="3 unread notifications"`.
   */
  title?: string;
  /** The element the overlay is anchored to. */
  children?: React.ReactNode;
}

const BAIBadgeCountAstryx: React.FC<BAIBadgeCountAstryxProps> = ({
  count,
  hasDot = false,
  max = 99,
  showZero = false,
  offset,
  size = 'default',
  title,
  variant,
  children,
  className,
  style,
  ...badgeProps
}) => {
  'use memo';

  const isNumericCount = typeof count === 'number';
  const isHidden =
    !hasDot &&
    (count === undefined ||
      count === null ||
      (isNumericCount && count === 0 && !showZero));

  const label =
    isNumericCount && count > max ? `${max}+` : (count as React.ReactNode);

  return (
    <span className={`bai-badge-count ${className ?? ''}`.trim()} style={style}>
      {children}
      {isHidden ? null : (
        <span
          className={[
            'bai-badge-count-overlay',
            size === 'small' ? 'bai-badge-count-overlay-small' : '',
            hasDot ? 'bai-badge-count-overlay-dot' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          // Our own custom properties, set inline — the CSS reads them with no
          // fallback name to get wrong (P19).
          style={
            {
              '--bai-badge-count-offset-x': `${offset?.[0] ?? 0}px`,
              '--bai-badge-count-offset-y': `${offset?.[1] ?? 0}px`,
            } as React.CSSProperties
          }
          // A count is a live region in antd too: it announces on change.
          role="status"
          aria-label={title}
        >
          {hasDot ? (
            <span
              className="bai-badge-count-dot"
              data-variant={variant ?? 'neutral'}
            />
          ) : (
            <Badge variant={variant} label={label} {...badgeProps} />
          )}
        </span>
      )}
    </span>
  );
};

export default BAIBadgeCountAstryx;
