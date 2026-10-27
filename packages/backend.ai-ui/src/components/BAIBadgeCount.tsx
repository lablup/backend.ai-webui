/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapter over ui-common `CountBadge` (FR-4054): keeps the antd `Badge` names
 (`showZero`, `size="small"`, `title`) its call sites pass.
*/
import {
  CountBadge,
  type CountBadgeProps,
} from '@lablup/ui-common/components/CountBadge';
import React from 'react';

export interface BAIBadgeCountProps extends Omit<
  CountBadgeProps,
  'isZeroShown' | 'size' | 'label'
> {
  /** Keep the overlay when `count` is 0. antd `showZero`. @default false */
  showZero?: boolean;
  /** antd's `size="small"`: a denser pill. @default 'default' */
  size?: 'small' | 'default';
  /** Accessible name for the overlay, e.g. "3 unread notifications". */
  title?: string;
}

const BAIBadgeCount: React.FC<BAIBadgeCountProps> = ({
  showZero,
  size = 'default',
  title,
  ...countBadgeProps
}) => {
  'use memo';
  return (
    <CountBadge
      {...countBadgeProps}
      isZeroShown={showZero}
      size={size === 'small' ? 'sm' : 'md'}
      label={title}
    />
  );
};

export default BAIBadgeCount;
