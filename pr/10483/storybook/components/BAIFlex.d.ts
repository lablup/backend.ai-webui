import { default as React, PropsWithChildren } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
