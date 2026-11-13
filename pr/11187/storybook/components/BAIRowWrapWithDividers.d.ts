import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIRowWrapWithDividersProps {
    children: React.ReactNode;
    wrap?: boolean;
    rowGap?: number | string;
    columnGap?: number | string;
    dividerWidth?: number;
    dividerColor?: string;
    /** Top/bottom inset of the vertical divider. Does not affect container size. */
    dividerInset?: number;
    itemStyle?: React.CSSProperties;
    style?: React.CSSProperties;
    className?: string;
}
/**
 * Wraps like flex-wrap and draws vertical dividers only between items on the same row.
 * dividerInset shortens only the divider line without changing the container padding.
 */
declare const BAIRowWrapWithDividers: React.FC<BAIRowWrapWithDividersProps>;
export default BAIRowWrapWithDividers;
