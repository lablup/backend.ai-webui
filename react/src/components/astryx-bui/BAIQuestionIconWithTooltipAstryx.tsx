/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 6 (cn-oss-removal / ticket 10, item 4) — `BAIQuestionIconWithTooltip`.

 BUI's version is an `@ant-design/icons` `QuestionCircleOutlined` wrapped in an
 antd `Tooltip`, coloured from `theme.useToken().colorTextTertiary`. All three
 pieces have exact Astryx equivalents, so this is the cheapest leaf in the
 sweep — a **native** rebuild, not a frontier translation.

 One real difference, and it is an improvement: antd's `Tooltip` attaches to a
 bare `<span>`-wrapped icon, which is not focusable, so the hint was
 mouse-only. Astryx's `Tooltip` requires an interactive child for the same
 reason, so the icon is wrapped in a `<button type="button">` carrying the
 tooltip text as its accessible name. The hint is now reachable by keyboard.
*/
import { Icon } from '@astryxdesign/core/Icon';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { CircleHelpIcon } from 'lucide-react';
import React from 'react';

export interface BAIQuestionIconWithTooltipAstryxProps {
  /** Tooltip text. `string`, not antd's `ReactNode` (P2). */
  title: string;
  className?: string;
  style?: React.CSSProperties;
}

const BAIQuestionIconWithTooltipAstryx: React.FC<
  BAIQuestionIconWithTooltipAstryxProps
> = ({ title, className, style }) => {
  'use memo';
  return (
    <Tooltip content={title}>
      <button
        type="button"
        aria-label={title}
        className={className}
        style={{
          all: 'unset',
          cursor: 'help',
          display: 'inline-flex',
          alignItems: 'center',
          ...style,
        }}
      >
        <Icon icon={CircleHelpIcon} color="tertiary" size="sm" />
      </button>
    </Tooltip>
  );
};

export default BAIQuestionIconWithTooltipAstryx;
