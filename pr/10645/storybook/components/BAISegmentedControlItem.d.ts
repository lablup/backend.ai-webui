import { SegmentedControlItemProps } from '@lablup/ui-common/SegmentedControl';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
type ItemBaseProps = Omit<SegmentedControlItemProps, 'label' | 'isLabelHidden'>;
export type BAISegmentedControlItemProps = (ItemBaseProps & {
    /** Widened from Astryx's `string` — see the file header. */
    label: React.ReactNode;
    isLabelHidden?: false;
}) | (ItemBaseProps & {
    /** The accessible name of an icon-only segment. */
    label: string;
    isLabelHidden: true;
});
declare const BAISegmentedControlItem: React.FC<BAISegmentedControlItemProps>;
export default BAISegmentedControlItem;
