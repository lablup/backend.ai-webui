import { StatisticProps } from '@lablup/ui-common/components/Statistic';
import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIStatisticProps extends Omit<StatisticProps, 'label' | 'value' | 'infinityLabel' | 'progressMode' | 'color' | 'unlimitedLabel' | 'title'> {
    title: ReactNode;
    current?: number;
    infinityDisplay?: string;
    progressMode?: 'ghost' | 'hidden' | 'normal';
}
declare const BAIStatistic: React.FC<BAIStatisticProps>;
export default BAIStatistic;
