/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapter over ui-common `Statistic` (FR-4054): keeps `title`, `current`,
 `infinityDisplay`, `progressMode="ghost" | "normal"` and `style.color` as the
 value and bar colour. "Unlimited" comes from ui-common's catalog.
*/
import {
  Statistic,
  type StatisticProps,
} from '@lablup/ui-common/components/Statistic';
import React, { type ReactNode } from 'react';

export interface BAIStatisticProps extends Omit<
  StatisticProps,
  | 'label'
  | 'value'
  | 'infinityLabel'
  | 'progressMode'
  | 'color'
  | 'unlimitedLabel'
  | 'title'
> {
  title: ReactNode;
  current?: number;
  infinityDisplay?: string;
  progressMode?: 'ghost' | 'hidden' | 'normal';
}

const PROGRESS_MODE = {
  ghost: 'placeholder',
  hidden: 'hidden',
  normal: 'visible',
} as const;

const BAIStatistic: React.FC<BAIStatisticProps> = ({
  title,
  current,
  infinityDisplay,
  progressMode = 'hidden',
  style,
  ...statisticProps
}) => {
  'use memo';
  return (
    <Statistic
      {...statisticProps}
      style={style}
      label={title}
      value={current}
      infinityLabel={infinityDisplay}
      progressMode={PROGRESS_MODE[progressMode]}
      color={style?.color}
    />
  );
};

export default BAIStatistic;
