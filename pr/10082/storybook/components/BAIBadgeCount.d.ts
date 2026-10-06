import { CountBadgeProps } from '@lablup/ui-common/components/CountBadge';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
