/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Generic icon-with-tooltip trigger: any glyph (a lucide icon, a status badge)
 wrapped in a focusable unstyled button so the hint is keyboard-reachable.
 `BAIQuestionIconWithTooltip` specializes this with the CircleHelp glyph.

 No legacy call sites to keep compiling, so the props extend Astryx's own
 `TooltipProps` directly rather than an antd-shaped surface (unlike
 `BAIQuestionIconWithTooltip`, a FRONTIER COMPONENT).
*/
import { nodeToAccessibleLabel } from '../helper/astryxLabel';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip, type TooltipProps } from '@astryxdesign/core/Tooltip';
import type { CSSProperties, ReactNode } from 'react';

export interface BAIIconWithTooltipProps extends Omit<
  TooltipProps,
  'children' | 'anchorRef'
> {
  /** The glyph the tooltip is attached to. */
  icon: ReactNode;
  /**
   * `false` renders the trigger as a plain `<span>` (hover-only) instead of a
   * focusable `<button>` — required inside another interactive element (a
   * link, a select option, a segmented-control label), where nesting a button
   * is invalid.
   */
  focusable?: boolean;
  style?: CSSProperties;
  className?: string;
}

// Shared by both trigger variants. pointer-events inherits, so a disabled
// ancestor row (Astryx Item sets `none`) would otherwise swallow the hover
// that opens the hint (FR-3837).
const triggerStyle: CSSProperties = {
  cursor: 'help',
  display: 'inline-flex',
  pointerEvents: 'auto',
};

const BAIIconWithTooltip = ({
  icon,
  focusable = true,
  style,
  className,
  ...tooltipProps
}: BAIIconWithTooltipProps) => {
  const label = nodeToAccessibleLabel(tooltipProps.content) || undefined;
  const iconNode = (
    <Text color="placeholder" style={{ display: 'inline-flex' }}>
      {icon}
    </Text>
  );
  return (
    <Tooltip {...tooltipProps}>
      {focusable ? (
        /* A real button (reset to inline glyph) keeps the hint focusable, so
           keyboard users can reach the tooltip. Reset is explicit, not
           `all: 'unset'`: on Chromium >= 151 `all` makes the anchor-name CSSOM
           getter return 'unset', which poisons Astryx's addAnchorName list and
           detaches the tooltip to the viewport top-left (FR-3589). */
        <button
          type="button"
          aria-label={label}
          className={className}
          style={{
            appearance: 'none',
            background: 'none',
            border: 0,
            margin: 0,
            padding: 0,
            font: 'inherit',
            color: 'inherit',
            ...triggerStyle,
            ...style,
          }}
        >
          {iconNode}
        </button>
      ) : (
        <span
          aria-label={label}
          className={className}
          style={{ ...triggerStyle, ...style }}
        >
          {iconNode}
        </span>
      )}
    </Tooltip>
  );
};

export default BAIIconWithTooltip;
