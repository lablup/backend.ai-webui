import { default as React, CSSProperties } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIUncontrolledInputProps {
    /** Initial value. Changing it remounts the input and discards uncommitted edits. */
    defaultValue?: string;
    /** Called with the current value when the user commits by pressing Enter or blurring. */
    onCommit?: (value: string) => void;
    /** `'number'` routes to Astryx `NumberInput`; everything else to `TextInput`. */
    type?: 'text' | 'number' | 'password' | 'email';
    placeholder?: string;
    disabled?: boolean;
    /** antd's `status`, reshaped onto Astryx's richer `status` object. */
    status?: 'error' | 'warning' | '';
    /** Visible accessible name. Hidden when absent — see the PILOT-DECISION. */
    label?: string;
    isLabelHidden?: boolean;
    style?: CSSProperties;
    className?: string;
    [key: `data-${string}`]: string | undefined;
}
/**
 * An intentionally uncontrolled input that commits its value on Enter or
 * blur — not on every keystroke.
 *
 * `value`/`onChange` are deliberately absent so expensive commit side effects
 * (e.g. persisting to localStorage) go through `onCommit`, which fires only
 * when the user finishes editing.
 */
declare const BAIUncontrolledInput: React.FC<BAIUncontrolledInputProps>;
export default BAIUncontrolledInput;
