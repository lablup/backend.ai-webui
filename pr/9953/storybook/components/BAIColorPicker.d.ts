import { default as React, CSSProperties } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * Normalise whatever the caller holds into the `#rrggbb` a native colour
 * input accepts. Theme documents store hex, but a token read straight off the
 * shim can still arrive as `rgb()` / `rgba()` (the probe's native output) or
 * as `#rgb`, and an unparseable value must not silently paint black — it
 * returns `null` so the swatch can render "unset" instead.
 */
export declare const toHexColor: (value?: string | null) => string | null;
export interface BAIColorPickerProps {
    /** Current colour. Hex, or anything `toHexColor` can normalise. */
    value?: string | null;
    /** Fires with `#rrggbb` when the user settles on a colour. */
    onChangeComplete?: (hex: string) => void;
    /** Renders the hex next to the swatch on the trigger (antd's `showText`). */
    showText?: boolean;
    /** Offers a "clear" action inside the popover. */
    allowClear?: boolean;
    onClear?: () => void;
    disabled?: boolean;
    /**
     * Accessible name for the trigger. Falls back to a generic one; the call
     * sites sit under a visible label of their own.
     */
    label?: string;
    style?: CSSProperties;
    'data-testid'?: string;
}
declare const BAIColorPicker: React.FC<BAIColorPickerProps>;
export default BAIColorPicker;
