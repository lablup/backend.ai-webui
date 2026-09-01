import { BadgeProps } from '@astryxdesign/core/Badge';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAITabCountBadgeProps extends Omit<BadgeProps, 'label' | 'icon' | 'variant'> {
    /** The count to show. Nullish or 0 renders nothing unless `showZero`. */
    count?: number | null;
    /** Whether the owning tab is the selected one. */
    selected?: boolean;
    /** Keep the pill when `count` is 0. @default false */
    showZero?: boolean;
}
declare const BAITabCountBadge: React.FC<BAITabCountBadgeProps>;
export default BAITabCountBadge;
