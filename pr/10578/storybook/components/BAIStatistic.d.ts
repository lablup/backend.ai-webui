import { StatisticProps } from '@lablup/ui-common/components/Statistic';
import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIStatisticProps extends Omit<StatisticProps, 'label' | 'value' | 'infinityLabel' | 'progressMode' | 'color' | 'unlimitedLabel' | 'title'> {
    title: ReactNode;
    current?: number;
    infinityDisplay?: string;
    progressMode?: 'ghost' | 'hidden' | 'normal';
}
declare const BAIStatistic: React.FC<BAIStatisticProps>;
export default BAIStatistic;
