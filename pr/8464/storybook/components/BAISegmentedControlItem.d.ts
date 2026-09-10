import { SegmentedControlItemProps } from '@astryxdesign/core/SegmentedControl';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAISegmentedControlItemProps extends Omit<SegmentedControlItemProps, 'label' | 'isLabelHidden'> {
    /** Widened from Astryx's `string` — see the file header. */
    label: React.ReactNode;
}
declare const BAISegmentedControlItem: React.FC<BAISegmentedControlItemProps>;
export default BAISegmentedControlItem;
