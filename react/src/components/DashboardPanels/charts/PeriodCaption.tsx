/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DateTimeWindow } from '../timeRange';
import { formatBucketSpan } from './bucketSpan';
import { Text } from '@lablup/ui-common/Text';
import React from 'react';

export interface PeriodCaptionProps {
  /** The window the card's numbers cover, as of its last refresh. */
  window: DateTimeWindow;
}

/** The period a card's numbers cover, as one supporting line in the card body. */
const PeriodCaption: React.FC<PeriodCaptionProps> = ({ window }) => (
  <Text type="supporting" size="sm" data-testid="panel-period">
    {formatBucketSpan(window)}
  </Text>
);

export default PeriodCaption;
