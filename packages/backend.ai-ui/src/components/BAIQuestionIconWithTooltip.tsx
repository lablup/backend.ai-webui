/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIIconWithTooltip` with the CircleHelp glyph. FRONTIER COMPONENT: its props
 restate a frozen antd-shaped surface (`title`, `placement`, `open`,
 `mouseEnterDelay`) for its call sites instead of extending a props type.
 A non-focusable help icon describes the enclosing control by default.
*/
import {
  splitAntdPlacement,
  type AntdPlacement,
} from '../helper/astryxPlacement';
import BAIIconWithTooltip, {
  type BAIIconWithTooltipProps,
} from './BAIIconWithTooltip';
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
  /** See BAIIconWithTooltip — `false` for triggers nested in interactive elements. */
  focusable?: boolean;
  /**
   * Where a non-focusable trigger's text reaches assistive tech; see
   * BAIIconWithTooltip. A help icon describes its enclosing control by default.
   * @default 'description'
   */
  announceAs?: BAIIconWithTooltipProps['announceAs'];
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
  focusable,
  announceAs = 'description',
}: BAIQuestionIconWithTooltipProps) => {
  const { placement: astryxPlacement, alignment } =
    splitAntdPlacement(placement);
  return (
    <BAIIconWithTooltip
      icon={<CircleHelp {...iconProps} size="1em" />}
      content={title}
      placement={astryxPlacement}
      alignment={alignment}
      isOpen={open}
      onOpenChange={onOpenChange}
      delay={mouseEnterDelay === undefined ? undefined : mouseEnterDelay * 1000}
      style={style}
      className={className}
      focusable={focusable}
      announceAs={announceAs}
    />
  );
};

export default BAIQuestionIconWithTooltip;
