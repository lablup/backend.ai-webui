/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIQuestionIconWithTooltip` on Astryx (to-astryx phase 3, wave 2 / W2-D).

 FRONTIER COMPONENT — 63 call sites in 30 files, all of which pass antd's
 `title`. The public surface stays antd-shaped (`title`, `placement`, `open`,
 `style`) and the antd `TooltipProps` import is replaced by a locally-declared
 interface, so this module drops out of the antd import graph (P15).

   `title`     -> Astryx `content`  (MAPPING §4)
   `placement` -> `placement` + `alignment`, split via `helper/astryxPlacement`

 PILOT-DECISION — **the glyph tint moves from a token read to `Text`'s own
 colour scale.** antd painted it `color: token.colorTextTertiary` from the
 theme-shim; Astryx has no arbitrary colour slot (P5), and the nearest member
 of its closed `TextColor` enum is `placeholder` (the tertiary/hint step). The
 icon is wrapped in a `Text color="placeholder"` so it inherits that step from
 the theme in both light and dark instead of a resolved hex — and the
 theme-shim `useToken()` call disappears, which is the shim's idiomatic end
 state.

 PILOT-DECISION — **the rest of antd's `TooltipProps` is dropped, not
 translated.** `color` has no Astryx counterpart (MAPPING §4), and
 `overlayStyle` / `overlayInnerStyle` / `getPopupContainer` / `trigger` /
 `mouseEnterDelay` describe antd's overlay DOM, which Astryx replaces with CSS
 anchor positioning + the Popover API. No call site passes any of them
 (measured: `title` ×63, `placement` ×3, `style` ×2, `iconProps` ×2).
*/
import {
  splitAntdPlacement,
  type AntdPlacement,
} from '../helper/astryxPlacement';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { CircleHelp } from 'lucide-react';
import React from 'react';
import type { CSSProperties, ReactNode } from 'react';

export interface BAIQuestionIconWithTooltipProps {
  /** antd's name for the tooltip body. */
  title?: ReactNode;
  placement?: AntdPlacement;
  /** Controlled visibility (antd v5 name). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Delay before showing, in seconds (antd) — converted to Astryx's ms. */
  mouseEnterDelay?: number;
  style?: CSSProperties;
  className?: string;
  iconProps?: React.ComponentProps<typeof CircleHelp>;
}

const BAIQuestionIconWithTooltip = ({
  title,
  placement,
  open,
  onOpenChange,
  mouseEnterDelay,
  style,
  className,
  iconProps,
}: BAIQuestionIconWithTooltipProps) => {
  const { placement: astryxPlacement, alignment } =
    splitAntdPlacement(placement);
  return (
    <Tooltip
      content={title}
      placement={astryxPlacement}
      alignment={alignment}
      isOpen={open}
      onOpenChange={onOpenChange}
      delay={mouseEnterDelay === undefined ? undefined : mouseEnterDelay * 1000}
    >
      <Text
        color="placeholder"
        className={className}
        style={{ cursor: 'help', display: 'inline-flex', ...style }}
      >
        <CircleHelp {...iconProps} size="1em" />
      </Text>
    </Tooltip>
  );
};

export default BAIQuestionIconWithTooltip;
