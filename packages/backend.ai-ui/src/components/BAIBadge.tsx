/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIBadge` on Astryx (to-astryx phase 3, ticket A).

 antd `Badge status={…} text={…}` — a coloured dot with a label beside it —
 maps to Astryx **`StatusDot`** (MAPPING §3.8, "`status` + `text` ->
 `StatusDot`"). `StatusDot` renders the dot ONLY (its `label` is the
 `aria-label`, deliberately not visible), so the visible label is a sibling
 `Text`, which is also what antd's markup was.

 FRONTIER COMPONENT — the public surface is unchanged (`color` as a BUI
 `SemanticColor`, `processing`, plus antd `Badge`'s `text` / `style` /
 `className`), so `BAIAuditLogStatusTag`, `BAISchedulingResultBadge`,
 `StorageUsageBadge` and `SessionSlotCell` stay at zero diff.
*/
import { SemanticColor } from '../helper';
import './BAIBadge.css';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Text } from '@astryxdesign/core/Text';
import React from 'react';
import type { ReactNode } from 'react';

/**
 * BUI `SemanticColor` -> Astryx `StatusDot` variant. `info` lands on `accent`
 * (StatusDot's closed enum is `success|warning|error|accent|neutral`; `accent`
 * is its informational/brand slot) and `default` on `neutral`.
 */
const SEMANTIC_TO_STATUS_DOT = {
  success: 'success',
  info: 'accent',
  warning: 'warning',
  error: 'error',
  default: 'neutral',
} as const satisfies Record<SemanticColor, string>;

/**
 * Props interface for BAIBadge component.
 * antd `Badge`-shaped (frontier rule) with semantic color support.
 */
export interface BAIBadgeProps {
  /**
   * Semantic color of the badge dot.
   * Pass `undefined` when the status is unknown or indeterminate to render
   * an outline-only (border) dot instead of a filled dot.
   */
  color?: SemanticColor;
  /** When true, shows a processing (ripple) animation on the badge dot. */
  processing?: boolean;
  /** The visible label rendered beside the dot (antd `Badge.text`). */
  text?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

/**
 * BAIBadge - Semantic color-coded status dot badge.
 *
 * Provides a consistent semantic color system (`success`, `info`, `warning`,
 * `error`, `default`). When `color` is omitted, renders a transparent dot with
 * a border to indicate an unknown or indeterminate status — see the
 * justification in `BAIBadge.css`.
 */
const BAIBadge: React.FC<BAIBadgeProps> = ({
  color,
  processing,
  text,
  className,
  style,
  ...restProps
}) => {
  'use memo';

  return (
    <span
      {...restProps}
      className={className ? `bai-badge ${className}` : 'bai-badge'}
      style={style}
    >
      <StatusDot
        className={color ? undefined : 'bai-badge-dot--unknown'}
        variant={color ? SEMANTIC_TO_STATUS_DOT[color] : 'neutral'}
        // `label` is the accessible name and is NOT rendered. antd derived the
        // same thing from `text`; a non-string node falls back to the generic
        // "status" so the dot never announces `[object Object]` (P2).
        label={typeof text === 'string' ? text : 'status'}
        isPulsing={processing}
      />
      {text !== undefined && text !== null ? <Text>{text}</Text> : null}
    </span>
  );
};

export default BAIBadge;
