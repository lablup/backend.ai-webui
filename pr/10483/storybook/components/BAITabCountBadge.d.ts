import { BadgeProps } from '@lablup/ui-common/Badge';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
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
