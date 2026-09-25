/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapter over ui-common `DividedRow` (FR-4054): keeps the boolean `wrap`.
*/
import {
  DividedRow,
  type DividedRowProps,
} from '@lablup/ui-common/components/DividedRow';
import React from 'react';

export interface BAIRowWrapWithDividersProps extends Omit<
  DividedRowProps,
  'wrap'
> {
  children: React.ReactNode;
  wrap?: boolean;
}

const BAIRowWrapWithDividers: React.FC<BAIRowWrapWithDividersProps> = ({
  wrap = true,
  ...rowProps
}) => {
  'use memo';
  return <DividedRow {...rowProps} wrap={wrap ? 'wrap' : 'nowrap'} />;
};

export default BAIRowWrapWithDividers;
