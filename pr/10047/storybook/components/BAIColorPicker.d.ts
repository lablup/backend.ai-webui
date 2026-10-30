import { toHexColor, ColorPickerProps } from '@lablup/ui-common/components/ColorPicker';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export { toHexColor };
export interface BAIColorPickerProps extends Omit<ColorPickerProps, 'onChange' | 'hasValueLabel' | 'hasClear' | 'isDisabled'> {
    /** Fires with `#rrggbb` when the user settles on a colour. */
    onChangeComplete?: (hex: string) => void;
    /** Renders the hex next to the swatch on the trigger. */
    showText?: boolean;
    /** Offers a "clear" action inside the popover. */
    allowClear?: boolean;
    disabled?: boolean;
}
declare const BAIColorPicker: React.FC<BAIColorPickerProps>;
export default BAIColorPicker;
