/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `MultiSelector` with `showTooltip` on by default (ADR 0014 §2):
 the trigger cuts the selection off after three labels, so the tooltip names
 all of them (#10951).
*/
import {
  MultiSelector,
  type MultiSelectorOptionType,
  type MultiSelectorProps,
} from '@lablup/ui-common/MultiSelector';
import React from 'react';

export type BAIMultiSelectorProps<
  T extends MultiSelectorOptionType = MultiSelectorOptionType,
> = MultiSelectorProps<T>;

function BAIMultiSelector<
  T extends MultiSelectorOptionType = MultiSelectorOptionType,
>({
  showTooltip = true,
  ...multiSelectorProps
}: BAIMultiSelectorProps<T>): React.ReactElement {
  'use memo';
  return <MultiSelector {...multiSelectorProps} showTooltip={showTooltip} />;
}

export default BAIMultiSelector;
