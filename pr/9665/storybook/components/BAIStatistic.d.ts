import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIStatisticProps {
    title: ReactNode;
    current?: number;
    total?: number;
    unit?: string;
    precision?: number;
    infinityDisplay?: string;
    progressMode?: 'ghost' | 'hidden' | 'normal';
    progressSteps?: number;
    style?: React.CSSProperties;
}
declare const BAIStatistic: React.FC<BAIStatisticProps>;
export default BAIStatistic;
