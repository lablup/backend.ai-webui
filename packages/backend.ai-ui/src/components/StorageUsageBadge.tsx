import { SemanticColor } from '../helper';
import BAIBadge, { BAIBadgeProps } from './BAIBadge';
import React from 'react';

export interface StorageUsageBadgeProps extends Omit<
  BAIBadgeProps,
  'color' | 'processing'
> {
  percent?: number;
}

const percentToSemantic = (
  percent: number | undefined,
): SemanticColor | undefined => {
  if (percent === undefined) return undefined;
  if (percent < 70) return 'success';
  if (percent < 90) return 'warning';
  return 'error';
};

const StorageUsageBadge: React.FC<StorageUsageBadgeProps> = ({
  percent,
  ...badgeProps
}) => {
  'use memo';
  return <BAIBadge {...badgeProps} color={percentToSemantic(percent)} />;
};

export default StorageUsageBadge;
