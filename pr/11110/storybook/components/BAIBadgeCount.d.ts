import { CountBadgeProps } from '@lablup/ui-common/components/CountBadge';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIBadgeCountProps extends Omit<CountBadgeProps, 'isZeroShown' | 'size' | 'label'> {
    /** Keep the overlay when `count` is 0. antd `showZero`. @default false */
    showZero?: boolean;
    /** antd's `size="small"`: a denser pill. @default 'default' */
    size?: 'small' | 'default';
    /** Accessible name for the overlay, e.g. "3 unread notifications". */
    title?: string;
}
declare const BAIBadgeCount: React.FC<BAIBadgeCountProps>;
export default BAIBadgeCount;
