/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The count pill next to a tab label. Settles the "accent-vs-fixed-blue" open
 question left at the top of `BAIBadgeCount` (to-astryx ticket 08): the active
 tab's count carries the ACTIVE MENU GROUP's primary, via `--color-accent`
 (see `BAITabCountBadge.css` for why that is a class and not a variant).
*/
import './BAITabCountBadge.css';
import { Badge } from '@astryxdesign/core/Badge';
import type { BadgeProps } from '@astryxdesign/core/Badge';
import React from 'react';

export interface BAITabCountBadgeProps extends Omit<
  BadgeProps,
  'label' | 'icon' | 'variant'
> {
  /** The count to show. Nullish or 0 renders nothing unless `showZero`. */
  count?: number | null;
  /** Whether the owning tab is the selected one. */
  selected?: boolean;
  /** Keep the pill when `count` is 0. @default false */
  showZero?: boolean;
}

const BAITabCountBadge: React.FC<BAITabCountBadgeProps> = ({
  count,
  selected = false,
  showZero = false,
  className,
  ...badgeProps
}) => {
  'use memo';

  if (count === undefined || count === null || (count === 0 && !showZero)) {
    return null;
  }

  return (
    <Badge
      className={[
        'bai-tab-count-badge',
        selected ? 'bai-tab-count-badge--selected' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      label={count}
      {...badgeProps}
    />
  );
};

BAITabCountBadge.displayName = 'BAITabCountBadge';

export default BAITabCountBadge;
