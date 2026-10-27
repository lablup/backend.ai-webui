import { toHexColor, ColorPickerProps } from '@lablup/ui-common/components/ColorPicker';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
