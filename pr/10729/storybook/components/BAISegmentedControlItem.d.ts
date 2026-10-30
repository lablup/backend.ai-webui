import { SegmentedControlItemProps } from '@lablup/ui-common/SegmentedControl';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
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
