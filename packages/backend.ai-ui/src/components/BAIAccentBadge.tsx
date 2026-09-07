/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 A read-only badge painted in the active menu group's primary (`--color-accent`)
 instead of a fixed hue — the replacement for the old `PRIMARY_TAG_VARIANT`
 (FR-3715). See `BAIAccentBadge.css` for why this cannot be a `Badge.variant`.
*/
import './BAIAccentBadge.css';
import { Badge } from '@astryxdesign/core/Badge';
import type { BadgeProps } from '@astryxdesign/core/Badge';
import React from 'react';

export interface BAIAccentBadgeProps extends Omit<BadgeProps, 'variant'> {}

const BAIAccentBadge: React.FC<BAIAccentBadgeProps> = ({
  label,
  icon,
  className,
  ...badgeProps
}) => {
  'use memo';

  return (
    <Badge
      className={['bai-accent-badge', className ?? '']
        .filter(Boolean)
        .join(' ')}
      label={label}
      icon={icon}
      {...badgeProps}
    />
  );
};

BAIAccentBadge.displayName = 'BAIAccentBadge';

export default BAIAccentBadge;
