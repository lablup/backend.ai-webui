import { default as React, PropsWithChildren } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
type GapSize = number | 'xxs' | 'xs' | 'sm' | 'ms' | 'md' | 'lg' | 'xl' | 'xxl';
type GapProp = GapSize | [GapSize | undefined, GapSize | undefined];
export interface BAIFlexProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'dir'>, PropsWithChildren {
    direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    justify?: 'start' | 'end' | 'center' | 'between' | 'around';
    align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
    gap?: GapProp;
}
declare const BAIFlex: React.ForwardRefExoticComponent<BAIFlexProps & React.RefAttributes<HTMLDivElement>>;
export default BAIFlex;
