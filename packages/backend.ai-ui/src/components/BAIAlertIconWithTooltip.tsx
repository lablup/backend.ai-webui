/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIAlertIconWithTooltip` on Astryx (to-astryx phase 3, ticket A).

 A hover-explained warning/error glyph. antd `Tooltip` -> Astryx `Tooltip`
 (MAPPING §4, DIRECT): `title` -> `content`, `placement` splits into
 `placement` + `alignment`. The public surface keeps antd's `title`, so the 9
 call sites in 5 files do not change.

 The icon colour is the one thing Astryx's closed enums cannot carry (the glyph
 is a bare lucide SVG, not an Astryx component), so it reads the status token
 directly — `--color-warning` / `--color-error` are the same seeds antd's
 `colorWarning` / `colorError` resolved to, so the hue is legacy-identical in
 both modes (P19: names checked against the built theme).
*/
import BAIIconWithTooltip from './BAIIconWithTooltip';
import { CircleAlertIcon } from 'lucide-react';
import React from 'react';
import type { ReactNode } from 'react';

export interface BAIAlertIconWithTooltipProps {
  /** antd `Tooltip.title` — the tooltip body. */
  title?: ReactNode;
  iconProps?: React.ComponentProps<typeof CircleAlertIcon>;
  type?: 'warning' | 'error';
  placement?: 'above' | 'below' | 'start' | 'end';
}

const BAIAlertIconWithTooltip = ({
  iconProps,
  type,
  title,
  placement,
}: BAIAlertIconWithTooltipProps) => {
  return (
    <BAIIconWithTooltip
      content={title}
      placement={placement}
      icon={
        <CircleAlertIcon
          style={{
            color:
              type === 'warning'
                ? 'var(--color-warning)'
                : type === 'error'
                  ? 'var(--color-error)'
                  : undefined,
          }}
          {...iconProps}
        />
      }
    />
  );
};

export default BAIAlertIconWithTooltip;
